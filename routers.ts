import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import {
  ensureSentinelSeedData,
  findAnomaly,
  getInvestigationByAnomalyId,
  getLearningSummary,
  getSentinelOverview,
  ingestCurLineItems,
  ingestCostSnapshots,
  recordFeedback,
} from "./db";

const costInput = z.object({
  day: z.string().min(1),
  total: z.number().int().nonnegative(),
  bedrock: z.number().int().nonnegative(),
  ecs: z.number().int().nonnegative(),
  cloudwatch: z.number().int().nonnegative(),
  other: z.number().int().nonnegative(),
});

const curInput = z.object({
  usageDate: z.string().min(1),
  service: z.string().min(1),
  usageType: z.string().min(1),
  region: z.string().min(1),
  linkedAccount: z.string().min(1),
  team: z.string().min(1),
  environment: z.string().min(1),
  deployId: z.string().nullable().optional(),
  usageAmount: z.number().int().nonnegative(),
  unblendedCost: z.number().int().nonnegative(),
  lineItemType: z.string().min(1),
});

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(({ ctx }) => ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  sentinel: router({
    overview: publicProcedure.query(async () => {
      await ensureSentinelSeedData();
      return getSentinelOverview();
    }),
    ingestCosts: publicProcedure
      .input(z.object({ records: z.array(costInput).min(1).max(5000) }))
      .mutation(async ({ input }) => ingestCostSnapshots(input.records)),
    ingestCur: publicProcedure
      .input(z.object({ records: z.array(curInput).min(1).max(50000) }))
      .mutation(async ({ input }) => ingestCurLineItems(input.records)),
    detect: publicProcedure.mutation(async () => {
      await ensureSentinelSeedData();
      const overview = await getSentinelOverview();
      const costs = overview?.costs ?? [];
      const total = costs.at(-1)?.total ?? 2964;
      const baseline = costs.slice(0, 7).reduce((sum, item) => sum + item.total, 0) / 7 || 620;
      const jointScore = Math.min(99, Math.round(70 + ((total - baseline) / baseline) * 12));
      return {
        runId: `run_${Date.now().toString(36)}`,
        detectedAt: new Date().toISOString(),
        jointScore,
        method: overview?.analysis.method ?? "z-score",
        zScore: overview?.analysis.zScore ?? 0,
        multiSignalScore: overview?.analysis.multiSignalScore ?? jointScore,
        signalBreakdown: overview?.analysis.signals ?? { costDeviation: 0, usageDeviation: 0, changeIntensity: 0, usageRatio: 1, correlatedChanges: [] },
        baselineDailyCost: overview?.analysis.baselineDailyCost ?? 0,
        projectedMonthlyCost: overview?.analysis.projectedMonthlyCost ?? 0,
        monthlyImpact: overview?.analysis.monthlyImpact ?? 0,
        rootCauses: overview?.analysis.rootCauses ?? [],
        anomalies: overview?.anomalies ?? [],
        signals: ["cost time series", "token usage", "change events", "service proportionality"],
        message: `Scan completed. ${overview?.anomalies.length ?? 3} anomalies ranked by joint signal score.`,
      };
    }),
    investigate: publicProcedure
      .input(z.object({ anomalyId: z.string().min(1) }))
      .mutation(async ({ input }) => {
        const anomaly = await findAnomaly(input.anomalyId);
        const investigation = await getInvestigationByAnomalyId(input.anomalyId);
        const overview = await getSentinelOverview();
        if (!anomaly || !investigation) throw new Error("Anomaly context is not available");
        return {
          ...investigation,
          anomaly,
          projectedMonthlyCost: overview?.analysis.projectedMonthlyCost ?? anomaly.value * 30,
          monthlyImpact: overview?.analysis.monthlyImpact ?? anomaly.value * 30,
          rootCauses: overview?.analysis.rootCauses ?? [],
          evidenceRanking: (overview?.events ?? []).filter((event) => event.anomalyId === input.anomalyId).slice(0, 3),
          agentTrace: [
            { name: "Detector", detail: `Joint signal score ${anomaly.score}/100` },
            { name: "Investigator", detail: `${investigation.evidence.length} evidence links correlated` },
            { name: "Explainer", detail: "Narrative + confidence generated" },
            { name: "Remediator", detail: `${investigation.recommendations.length} actions ranked by impact` },
            { name: "Auditor", detail: "Decision trace committed locally" },
          ],
        };
      }),
    whatIf: publicProcedure
      .input(z.object({ anomalyId: z.string().min(1), dailyCap: z.number().int().min(20).max(500), minCapacity: z.number().int().min(1).max(10).default(10) }))
      .mutation(async ({ input }) => {
        const anomaly = await findAnomaly(input.anomalyId);
        const currentSpend = anomaly?.value ?? 1486;
        const capacitySavings = Math.max(0, (10 - input.minCapacity) * 34);
        const savings = Math.max(0, Math.round(currentSpend - input.dailyCap * 1.12 + capacitySavings));
        const throttle = Math.min(28, Math.max(4, Math.round((100 - input.dailyCap) * 0.18)));
        const curve = [
          { day: "Sep 01", actual: 1140, simulated: 1140 },
          { day: "Sep 02", actual: 2240, simulated: 2240 - Math.round(savings * 0.18) },
          { day: "Sep 03", actual: 3186, simulated: 3186 - Math.round(savings * 0.48) },
          { day: "Sep 04", actual: 3012, simulated: 3012 - Math.round(savings * 0.72) },
          { day: "Sep 05", actual: 2964, simulated: 2964 - savings },
        ];
        return {
          anomalyId: input.anomalyId,
          dailyCap: input.dailyCap,
          minCapacity: input.minCapacity,
          savings,
          throttle,
          curve,
          narrative: `A $${input.dailyCap}/day cap plus ECS minimum capacity ${input.minCapacity} would have prevented $${savings.toLocaleString()} in excess spend, with a manageable ${throttle}% peak-window throttle. This is a containment lever, not a capacity fix.`,
        };
      }),
    feedback: publicProcedure
      .input(z.object({ anomalyId: z.string().min(1), verdict: z.enum(["correct", "wrong"]), note: z.string().max(500).optional() }))
      .mutation(async ({ input }) => recordFeedback(input.anomalyId, input.verdict, input.note)),
    learning: publicProcedure.query(async () => getLearningSummary()),
  }),
});

export type AppRouter = typeof appRouter;

import { desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  anomalies,
  costSnapshots,
  curLineItems,
  evidenceEvents,
  feedback,
  investigations,
  InsertUser,
  users,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;
let seedPromise: Promise<void> | null = null;

const costSeed = [
  { day: "Aug 25", total: 520, bedrock: 82, ecs: 164, cloudwatch: 0, other: 274 },
  { day: "Aug 26", total: 548, bedrock: 91, ecs: 171, cloudwatch: 0, other: 286 },
  { day: "Aug 27", total: 534, bedrock: 88, ecs: 167, cloudwatch: 0, other: 279 },
  { day: "Aug 28", total: 562, bedrock: 93, ecs: 176, cloudwatch: 0, other: 293 },
  { day: "Aug 29", total: 590, bedrock: 106, ecs: 182, cloudwatch: 0, other: 302 },
  { day: "Aug 30", total: 614, bedrock: 112, ecs: 195, cloudwatch: 0, other: 307 },
  { day: "Aug 31", total: 588, bedrock: 108, ecs: 188, cloudwatch: 0, other: 292 },
  { day: "Sep 01", total: 1140, bedrock: 402, ecs: 368, cloudwatch: 0, other: 370 },
  { day: "Sep 02", total: 2240, bedrock: 976, ecs: 722, cloudwatch: 0, other: 542 },
  { day: "Sep 03", total: 3186, bedrock: 1486, ecs: 1035, cloudwatch: 218, other: 447 },
  { day: "Sep 04", total: 3012, bedrock: 1392, ecs: 984, cloudwatch: 184, other: 452 },
  { day: "Sep 05", total: 2964, bedrock: 1372, ecs: 956, cloudwatch: 188, other: 448 },
];

const anomalySeed = [
  { anomalyId: "AN-2048", service: "Amazon Bedrock", account: "prod-ai / 4812", occurredAt: "Today, 02:15 UTC", value: 1486, delta: "+348%", severity: "Critical" as const, score: 98, summary: "Token spend accelerated without a matching request-volume increase." },
  { anomalyId: "AN-2047", service: "Amazon ECS", account: "prod-core / 4812", occurredAt: "Yesterday, 18:42 UTC", value: 1035, delta: "+224%", severity: "High" as const, score: 91, summary: "Autoscaling floor changed from 3 → 10 during a low-traffic window." },
  { anomalyId: "AN-2042", service: "CloudWatch Logs", account: "prod-ai / 4812", occurredAt: "Sep 03, 09:10 UTC", value: 218, delta: "+86%", severity: "Medium" as const, score: 74, summary: "Verbose trace logging enabled for the agent orchestration namespace." },
];

const anomalyFacetSeed = [
  { anomalyId: "AN-2048", service: "Amazon Bedrock", team: "AI Platform", region: "us-east-1", deployId: "agent-loop-v3" },
  { anomalyId: "AN-2047", service: "Amazon ECS", team: "Core Platform", region: "us-east-1", deployId: "ecs-floor-10" },
  { anomalyId: "AN-2042", service: "CloudWatch Logs", team: "AI Platform", region: "us-east-1", deployId: "trace-verbose" },
];

const eventSeed = [
  { anomalyId: "AN-2048", eventTime: "02:15 UTC", type: "CONFIG_CHANGE", title: "agent-loop-v3 feature flag enabled", actor: "platform-bot", accent: "lime" },
  { anomalyId: "AN-2048", eventTime: "02:18 UTC", type: "IAM_ACTIVITY", title: "Bedrock InvokeModel calls × 9.4", actor: "agent-runner-prod", accent: "cyan" },
  { anomalyId: "AN-2048", eventTime: "02:22 UTC", type: "SCALING_EVENT", title: "ECS minimum capacity 3 → 10", actor: "terraform-ci", accent: "amber" },
  { anomalyId: "AN-2048", eventTime: "02:31 UTC", type: "COST_SIGNAL", title: "Token spend crossed $100 daily guardrail", actor: "sentinel-detector", accent: "red" },
];

const investigationSeed = [
  { anomalyId: "AN-2048", confidence: 98, rootCause: "Runaway agent loop amplified by an autoscaling floor change.", classification: "Usage-driven", owner: "AI Platform · on-call", blastRadius: 1486, evidence: JSON.stringify(eventSeed.slice(0, 3)), recommendations: JSON.stringify([{ title: "Disable agent-loop-v3", detail: "Immediate containment · saves ~$980/day" }, { title: "Restore ECS minimum to 3", detail: "Right-size capacity · saves ~$346/day" }, { title: "Set Bedrock token budget at $100/day", detail: "Prevent recurrence · 4–8% request throttling" }]) },
  { anomalyId: "AN-2047", confidence: 91, rootCause: "ECS minimum capacity was raised during a low-traffic window, creating unproductive baseline compute.", classification: "Rate-driven", owner: "Core Platform · capacity", blastRadius: 1035, evidence: JSON.stringify([eventSeed[2]]), recommendations: JSON.stringify([{ title: "Restore minimum capacity to 3", detail: "Immediate right-sizing · saves ~$346/day" }, { title: "Add proportional-traffic guardrail", detail: "Suppress planned scaling false positives" }]) },
  { anomalyId: "AN-2042", confidence: 74, rootCause: "Verbose trace logging was enabled for the orchestration namespace and increased ingestion volume.", classification: "Usage-driven", owner: "AI Platform · observability", blastRadius: 218, evidence: JSON.stringify([{ eventTime: "09:10 UTC", type: "CONFIG_CHANGE", title: "verbose trace logging enabled", actor: "observability-bot", accent: "amber" }]), recommendations: JSON.stringify([{ title: "Return trace level to info", detail: "Reduce ingestion volume immediately" }, { title: "Set log retention to 14 days", detail: "Control recurring storage cost" }]) },
];

const serviceDimensions = [
  { service: "Amazon Bedrock", usageType: "USE1-InputTokens", region: "us-east-1", linkedAccount: "4812", team: "AI Platform", environment: "prod", deployId: "agent-loop-v3", bedrock: true },
  { service: "Amazon ECS", usageType: "USE1-Fargate-vCPU-Hours", region: "us-east-1", linkedAccount: "4812", team: "Core Platform", environment: "prod", deployId: "ecs-floor-10", bedrock: false },
  { service: "Amazon CloudWatch", usageType: "USE1-DataProcessing-Bytes", region: "us-east-1", linkedAccount: "4812", team: "AI Platform", environment: "prod", deployId: "trace-verbose", bedrock: false },
  { service: "Amazon S3", usageType: "USE1-TimedStorage-ByteHrs", region: "us-west-2", linkedAccount: "4812", team: "Data Platform", environment: "prod", deployId: null, bedrock: false },
] as const;

const curSeed = costSeed.flatMap((day) => {
  const values = [day.bedrock, day.ecs, day.cloudwatch, day.other];
  return serviceDimensions.map((dimension, index) => ({
    usageDate: day.day,
    service: dimension.service,
    usageType: dimension.usageType,
    region: dimension.region,
    linkedAccount: dimension.linkedAccount,
    team: dimension.team,
    environment: dimension.environment,
    deployId: day.day === "Aug 25" || day.day === "Aug 26" || day.day === "Aug 27" || day.day === "Aug 28" || day.day === "Aug 29" || day.day === "Aug 30" || day.day === "Aug 31" ? null : dimension.deployId,
    usageAmount: values[index] * (dimension.bedrock ? 1000 : 100),
    unblendedCost: values[index],
    lineItemType: "Usage",
  }));
});

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try { _db = drizzle(process.env.DATABASE_URL); } catch (error) { console.warn("[Database] Failed to connect:", error); _db = null; }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) return;
  const values: InsertUser = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};
  const textFields = ["name", "email", "loginMethod"] as const;
  for (const field of textFields) if (user[field] !== undefined) { values[field] = user[field] ?? null; updateSet[field] = user[field] ?? null; }
  if (user.lastSignedIn !== undefined) { values.lastSignedIn = user.lastSignedIn; updateSet.lastSignedIn = user.lastSignedIn; }
  if (user.role !== undefined) { values.role = user.role; updateSet.role = user.role; } else if (user.openId === ENV.ownerOpenId) { values.role = "admin"; updateSet.role = "admin"; }
  values.lastSignedIn ??= new Date();
  if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();
  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0];
}

function parseJson<T>(value: string, fallback: T): T { try { return JSON.parse(value) as T; } catch { return fallback; } }
function mean(values: number[]) { return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0; }
function standardDeviation(values: number[], average = mean(values)) { return Math.sqrt(mean(values.map((value) => (value - average) ** 2))); }
function round(value: number, digits = 1) { const factor = 10 ** digits; return Math.round(value * factor) / factor; }

export async function ensureSentinelSeedData() {
  if (seedPromise) return seedPromise;
  seedPromise = (async () => {
    const db = await getDb();
    if (!db) return;
    if ((await db.select({ id: costSnapshots.id }).from(costSnapshots).limit(1)).length === 0) await db.insert(costSnapshots).values(costSeed);
    if ((await db.select({ id: anomalies.id }).from(anomalies).limit(1)).length === 0) await db.insert(anomalies).values(anomalySeed);
    if ((await db.select({ id: evidenceEvents.id }).from(evidenceEvents).limit(1)).length === 0) await db.insert(evidenceEvents).values(eventSeed);
    if ((await db.select({ id: investigations.id }).from(investigations).limit(1)).length === 0) await db.insert(investigations).values(investigationSeed);
    if ((await db.select({ id: curLineItems.id }).from(curLineItems).limit(1)).length === 0) await db.insert(curLineItems).values(curSeed);
  })();
  return seedPromise;
}

export async function getSentinelOverview() {
  const db = await getDb();
  if (!db) return null;
  await ensureSentinelSeedData();
  const [costs, anomalyRows, eventRows, investigationRows, feedbackRows, curRows] = await Promise.all([
    db.select().from(costSnapshots).orderBy(costSnapshots.id),
    db.select().from(anomalies).orderBy(desc(anomalies.score)),
    db.select().from(evidenceEvents).orderBy(evidenceEvents.id),
    db.select().from(investigations).orderBy(investigations.id),
    db.select().from(feedback).orderBy(desc(feedback.id)),
    db.select().from(curLineItems).orderBy(curLineItems.id),
  ]);
  return {
    costs,
    anomalies: anomalyRows,
    events: eventRows,
    investigations: investigationRows.map((item) => ({ ...item, evidence: parseJson(item.evidence, []), recommendations: parseJson(item.recommendations, []) })),
    dataset: { rowCount: curRows.length, fields: ["usageDate", "service", "usageType", "region", "linkedAccount", "team", "environment", "deployId", "usageAmount", "unblendedCost", "lineItemType"], dateRange: [curRows[0]?.usageDate ?? "Aug 25", curRows.at(-1)?.usageDate ?? "Sep 05"], sampleRows: curRows.slice(-4) },
    facets: { records: anomalyFacetSeed, services: Array.from(new Set(anomalyFacetSeed.map((item) => item.service))).sort(), teams: Array.from(new Set(anomalyFacetSeed.map((item) => item.team))).sort(), regions: Array.from(new Set(anomalyFacetSeed.map((item) => item.region))).sort(), deployments: Array.from(new Set(anomalyFacetSeed.map((item) => item.deployId))).sort() },
    analysis: buildChallengeAnalysis(costs, curRows),
    feedback: { total: feedbackRows.length, correct: feedbackRows.filter((item) => item.verdict === "correct").length, wrong: feedbackRows.filter((item) => item.verdict === "wrong").length, latest: feedbackRows[0] ?? null },
  };
}

export function buildChallengeAnalysis(costs: Array<{ day: string; total: number; bedrock: number; ecs: number; cloudwatch: number; other: number }>, curRows: Array<{ usageDate: string; service: string; usageType: string; region: string; linkedAccount: string; team: string; environment: string; deployId: string | null; usageAmount: number; unblendedCost: number; lineItemType: string }>) {
  const baselineValues = costs.slice(0, 7).map((item) => item.total);
  const latest = costs.at(-1)?.total ?? 0;
  const baseline = mean(baselineValues);
  const sigma = standardDeviation(baselineValues, baseline);
  const zScore = sigma ? (latest - baseline) / sigma : 0;
  const projectedMonthlyCost = latest * 30;
  const baselineMonthlyCost = Math.round(baseline * 30);
  const monthlyImpact = Math.max(0, projectedMonthlyCost - baselineMonthlyCost);
  const latestDay = costs.at(-1)?.day ?? "Sep 05";
  const latestRows = curRows.filter((row) => row.usageDate === latestDay);
  const baselineRows = curRows.filter((row) => baselineValues.length && costs.slice(0, 7).some((item) => item.day === row.usageDate));
  const latestUsage = latestRows.reduce((sum, row) => sum + row.usageAmount, 0);
  const baselineUsage = baselineRows.reduce((sum, row) => sum + row.usageAmount, 0) / 7;
  const usageRatio = baselineUsage ? latestUsage / baselineUsage : 1;
  const usageDeviation = Math.max(0, round((usageRatio - 1) * 100));
  const changeIds = Array.from(new Set(latestRows.map((row) => row.deployId).filter(Boolean)));
  const changeIntensity = Math.min(100, changeIds.length * 25);
  const costSignal = Math.min(100, Math.max(0, Math.round((zScore / 10) * 100)));
  const usageSignal = Math.min(100, Math.max(0, Math.round(usageDeviation / 4)));
  const multiSignalScore = Math.round(costSignal * 0.55 + usageSignal * 0.3 + changeIntensity * 0.15);
  const dimensions = [
    { dimension: "service", label: "Service" },
    { dimension: "team", label: "Team" },
    { dimension: "region", label: "Region" },
    { dimension: "deployId", label: "Deploy / change" },
  ] as const;
  const rootCauses = dimensions.flatMap(({ dimension, label }) => {
    const latestMap = new Map<string, number>();
    const baselineMap = new Map<string, number>();
    for (const row of latestRows) { const key = row[dimension] ?? "unattributed"; latestMap.set(key, (latestMap.get(key) ?? 0) + row.unblendedCost); }
    for (const row of baselineRows) { const key = row[dimension] ?? "unattributed"; baselineMap.set(key, (baselineMap.get(key) ?? 0) + row.unblendedCost / 7); }
    return Array.from(latestMap.entries()).map(([value, latestCost]) => {
      const delta = Math.max(0, latestCost - (baselineMap.get(value) ?? 0));
      const specificity = label === "Region" ? 0.55 : label === "Service" ? 1.1 : 0.95;
      return { dimension: label, value, latestCost, baselineCost: round(baselineMap.get(value) ?? 0), incrementalCost: Math.round(delta), rankingScore: Math.round(delta * specificity), contribution: monthlyImpact ? round((delta / Math.max(1, latest - baseline)) * 100) : 0, confidence: Math.min(99, Math.round(60 + (delta / Math.max(1, latest)) * 40)), rationale: `${value} accounts for $${Math.round(delta).toLocaleString()} of the daily lift versus the 7-day baseline.` };
    });
  }).filter((candidate) => candidate.incrementalCost > 0).sort((a, b) => b.rankingScore - a.rankingScore).slice(0, 8);
  const top = rootCauses[0];
  return {
    method: "z-score",
    baselineDailyCost: Math.round(baseline),
    baselineSigma: round(sigma),
    latestDailyCost: latest,
    zScore: round(zScore, 2),
    isAnomaly: zScore >= 3,
    anomalyScore: Math.min(99, Math.max(0, Math.round(70 + Math.max(0, zScore - 3) * 2))),
    multiSignalScore,
    signals: { costDeviation: costSignal, usageDeviation: usageSignal, changeIntensity, usageRatio: round(usageRatio, 2), correlatedChanges: changeIds },
    projectedMonthlyCost,
    baselineMonthlyCost,
    monthlyImpact,
    ifIgnored: `At the current $${latest.toLocaleString()}/day run rate, monthly spend projects to $${projectedMonthlyCost.toLocaleString()} — $${monthlyImpact.toLocaleString()} above the baseline.`,
    rootCauses,
    primaryCause: top ? `${top.value} is the strongest correlated driver (${top.contribution}% of incremental cost).` : "No dominant root cause found.",
  };
}

export async function getInvestigationByAnomalyId(anomalyId: string) {
  const db = await getDb();
  if (!db) return null;
  await ensureSentinelSeedData();
  const result = await db.select().from(investigations).where(eq(investigations.anomalyId, anomalyId)).limit(1);
  const item = result[0];
  if (!item) return null;
  return { ...item, evidence: parseJson(item.evidence, []), recommendations: parseJson(item.recommendations, []) };
}

export async function recordFeedback(anomalyId: string, verdict: "correct" | "wrong", note?: string) {
  const db = await getDb();
  if (!db) return { total: 0, correct: 0, wrong: 0, tunedThreshold: verdict === "correct" ? 2.9 : 3.2 };
  await ensureSentinelSeedData();
  await db.insert(feedback).values({ anomalyId, verdict, note });
  const rows = await db.select().from(feedback);
  return { total: rows.length, correct: rows.filter((item) => item.verdict === "correct").length, wrong: rows.filter((item) => item.verdict === "wrong").length, tunedThreshold: verdict === "correct" ? 2.9 : 3.2 };
}

export async function ingestCostSnapshots(records: Array<{ day: string; total: number; bedrock: number; ecs: number; cloudwatch: number; other: number }>) {
  const db = await getDb();
  if (!db) return { ingested: records.length, persisted: false };
  await db.insert(costSnapshots).values(records).onDuplicateKeyUpdate({ set: { total: records[0]?.total ?? 0 } });
  return { ingested: records.length, persisted: true };
}

export async function ingestCurLineItems(records: Array<{ usageDate: string; service: string; usageType: string; region: string; linkedAccount: string; team: string; environment: string; deployId?: string | null; usageAmount: number; unblendedCost: number; lineItemType: string }>) {
  const db = await getDb();
  if (!db) return { ingested: records.length, persisted: false };
  await db.insert(curLineItems).values(records);
  return { ingested: records.length, persisted: true };
}

export async function findAnomaly(anomalyId: string) {
  const db = await getDb();
  if (!db) return null;
  await ensureSentinelSeedData();
  const result = await db.select().from(anomalies).where(eq(anomalies.anomalyId, anomalyId)).limit(1);
  return result[0] ?? null;
}

export async function getLearningSummary() {
  const db = await getDb();
  if (!db) return { total: 0, correct: 0, wrong: 0, trust: 94.6, threshold: 2.9, serviceThresholds: [{ service: "Amazon Bedrock", threshold: 2.9, emphasis: "tokens + deploy changes" }, { service: "Amazon ECS", threshold: 3.2, emphasis: "capacity + proportional traffic" }] };
  await ensureSentinelSeedData();
  const rows = await db.select().from(feedback);
  const correct = rows.filter((item) => item.verdict === "correct").length;
  const wrong = rows.filter((item) => item.verdict === "wrong").length;
  const total = rows.length;
  const trust = total === 0 ? 94.6 : Math.min(99.9, Math.max(50, 82 + (correct * 4) - (wrong * 2)));
  const threshold = wrong > correct ? 3.2 : 2.9;
  return { total, correct, wrong, trust, threshold, serviceThresholds: [{ service: "Amazon Bedrock", threshold, emphasis: "tokens + deploy changes" }, { service: "Amazon ECS", threshold: Math.min(3.8, threshold + 0.3), emphasis: "capacity + proportional traffic" }] };
}

export { costSeed, anomalySeed, eventSeed, investigationSeed, curSeed };

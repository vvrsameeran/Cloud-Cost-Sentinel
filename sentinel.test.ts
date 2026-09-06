import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: { protocol: "http", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("sentinel backend", () => {
  it("seeds and returns the synthetic FinOps overview", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.sentinel.overview();

    expect(result?.costs).toHaveLength(12);
    expect(result?.anomalies[0]?.anomalyId).toBe("AN-2048");
    expect(result?.events.length).toBeGreaterThanOrEqual(4);
    expect(result?.dataset.rowCount).toBe(48);
    expect(result?.dataset.fields).toContain("unblendedCost");
    expect(result?.analysis.method).toBe("z-score");
    expect(result?.analysis.isAnomaly).toBe(true);
    expect(result?.analysis.projectedMonthlyCost).toBe(88920);
    expect(result?.analysis.rootCauses[0]?.value).toBe("Amazon Bedrock");
    expect(result?.analysis.multiSignalScore).toBeGreaterThan(70);
    expect(result?.analysis.signals.correlatedChanges).toContain("agent-loop-v3");
    expect(result?.facets.services).toContain("Amazon Bedrock");
    expect(result?.facets.teams).toContain("Core Platform");
    expect(result?.facets.regions).toContain("us-east-1");
    expect(result?.facets.deployments).toContain("ecs-floor-10");
  });

  it("detects the spend spike with a joint signal score", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.sentinel.detect();

    expect(result.jointScore).toBeGreaterThanOrEqual(90);
    expect(result.anomalies).toHaveLength(3);
    expect(result.signals).toContain("token usage");
    expect(result.zScore).toBeGreaterThan(10);
    expect(result.rootCauses[0]?.dimension).toBe("Service");
    expect(result.monthlyImpact).toBeGreaterThan(70000);
    expect(result.signalBreakdown.changeIntensity).toBeGreaterThan(0);
  });

  it("returns an auditable investigation with agent trace", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.sentinel.investigate({ anomalyId: "AN-2048" });

    expect(result.confidence).toBe(98);
    expect(result.rootCause).toContain("Runaway agent loop");
    expect(result.agentTrace).toHaveLength(5);
    expect(result.recommendations.length).toBeGreaterThanOrEqual(3);
  });

  it("simulates a daily token cap and returns savings trade-offs", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.sentinel.whatIf({ anomalyId: "AN-2048", dailyCap: 100 });

    expect(result.savings).toBe(1374);
    expect(result.throttle).toBe(4);
    expect(result.curve).toHaveLength(5);
    expect(result.narrative).toContain("$1,374");
  });

  it("models both token budget and ECS minimum capacity", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.sentinel.whatIf({ anomalyId: "AN-2048", dailyCap: 100, minCapacity: 2 });

    expect(result.minCapacity).toBe(2);
    expect(result.savings).toBe(1646);
    expect(result.narrative).toContain("ECS minimum capacity 2");
  });

  it("returns persisted learning metrics", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.sentinel.learning();

    expect(result.trust).toBeGreaterThan(0);
    expect(result.threshold).toBeGreaterThan(0);
    expect(result.serviceThresholds[0].emphasis).toContain("tokens");
  });

  it("persists operator feedback and returns a tuned threshold", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.sentinel.feedback({ anomalyId: "AN-2048", verdict: "correct" });

    expect(result.correct).toBeGreaterThanOrEqual(1);
    expect(result.tunedThreshold).toBe(2.9);
  });
});

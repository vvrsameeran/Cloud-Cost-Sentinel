# Cloud Cost Sentinel

Cloud Cost Sentinel is a safe, full-stack prototype for the cloud cost-anomaly root-cause challenge. It ingests a realistic synthetic feed shaped like AWS Cost and Usage Report (CUR) line items, detects statistical outliers, ranks probable causes across service/team/region/deploy dimensions, explains the result in plain English, and projects the monthly cost if the issue is ignored.

No production AWS account is accessed. The demo uses an isolated synthetic dataset and mock operational events.

The checked-in dataset artifact is `data/synthetic-cur.csv` (48 data rows plus the header). Regenerate it with `node scripts/export-synthetic-cur.mjs`.

## Challenge deliverables

| Requirement | Implementation |
|---|---|
| Synthetic or sample AWS billing dataset | 48 persisted CUR-style rows in `cur_line_items`, with `usageDate`, `service`, `usageType`, `region`, `linkedAccount`, `team`, `environment`, `deployId`, `usageAmount`, `unblendedCost`, and `lineItemType`. The UI displays the row count, field count, date range, and sample rows through `sentinel.overview`. |
| Time-series anomaly detector | A transparent statistical detector uses the first seven daily totals as the baseline, then computes mean, standard deviation, and a z-score for the latest day. The scan returns `method: z-score`, baseline, z-score, anomaly flag, and confidence. A score of `z >= 3` is treated as anomalous. |
| Root-cause ranking | The latest CUR slice is compared with the seven-day baseline and grouped by service, team, region, and deploy/change ID. Candidates are ranked by incremental daily cost contribution and include confidence, baseline cost, current cost, and rationale. |
| Plain-English root-cause summary | The investigation response combines the seeded change-event window with the ranked CUR attribution. The dashboard explains that the Bedrock agent loop and ECS scaling floor are correlated causes rather than presenting an alert alone. |
| Projected monthly cost if ignored | The detector extrapolates the current daily spend for 30 days and compares it with the 7-day baseline. The dashboard shows projected monthly spend and incremental monthly impact directly in the challenge-proof panel. |

## Demo scenario

The synthetic feed models an AI platform organization. Normal spend runs around `$520–$614/day`; it accelerates to `$2,964/day` after a feature-flag change, an ECS minimum-capacity change, and verbose logging. The strongest attribution is Amazon Bedrock / AI Platform / `us-east-1` / `agent-loop-v3`, with Amazon ECS as a correlated secondary driver.

The seeded event timeline includes:

1. `agent-loop-v3` feature flag enabled.
2. Bedrock `InvokeModel` calls increasing by `9.4×`.
3. ECS minimum capacity changing from `3 → 10`.
4. Token spend crossing the daily guardrail.

At the current run rate, the system projects approximately `$88,920` monthly spend, compared with a baseline of approximately `$16,954`, for an incremental impact of approximately `$71,966` if left unaddressed.

## Architecture

```text
React + Recharts dashboard
          │ tRPC over /api/trpc
          ▼
Express / tRPC server
          │
          ├── sentinel.overview
          │     ├── persisted CUR feed
          │     ├── z-score analysis
          │     └── ranked root causes + monthly projection
          ├── sentinel.ingestCur
          ├── sentinel.ingestCosts
          ├── sentinel.detect
          ├── sentinel.investigate
          ├── sentinel.whatIf
          ├── sentinel.feedback
          └── sentinel.learning
          │
          ▼
Drizzle ORM → MySQL/TiDB
  cur_line_items · costs · anomalies · events · investigations · feedback
```

The first overview request seeds the database when the tables are empty. Seeding is idempotent and contains only synthetic rows. `sentinel.ingestCur` accepts up to 50,000 validated CUR-style records for the demo ingestion path.

## API surface

| Procedure | Type | Purpose |
|---|---|---|
| `sentinel.overview` | query | Returns the persisted feed, dataset metadata, detector analysis, ranked causes, anomalies, evidence, investigations, and feedback summary. |
| `sentinel.ingestCur` | mutation | Persists validated CUR-style line items. |
| `sentinel.ingestCosts` | mutation | Ingests daily aggregate snapshots. |
| `sentinel.detect` | mutation | Runs the z-score detector and returns ranked anomalies, z-score, baseline, root causes, and monthly impact. |
| `sentinel.investigate` | mutation | Returns an auditable explanation, agent trace, ranked causes, and monthly projection for an anomaly. |
| `sentinel.whatIf` | mutation | Simulates a daily token cap and returns savings, throttling trade-offs, and a simulated curve. |
| `sentinel.feedback` | mutation | Persists a correct/misleading operator verdict. |
| `sentinel.learning` | query | Returns trust, feedback counts, and the tuned threshold. |

## Local development

```bash
pnpm install
pnpm db:push
pnpm run dev
```

## Verification

```bash
pnpm run check
pnpm run build
pnpm test
```

Tests cover CUR seeding, z-score detection, root-cause ranking, monthly projection, investigation trace, what-if simulation, feedback persistence, and the existing auth logout contract.

## Safe demo flow

1. Open **Overview** and show the CUR row count, z-score, projected monthly cost, and top attribution.
2. Click **Run scan now** to return the statistical scan result.
3. Open AN-2048 and click **Investigate** to show the plain-English cause and correlated deploy events.
4. Use **What-if studio** with a `$100/day` Bedrock cap to show avoided spend and throttling trade-offs.
5. Submit operator feedback and open **Learning loop** to show the persisted model signal.

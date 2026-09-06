# Cloud Cost Sentinel: Jury Presentation Guide

## The Core Objective

Your goal is not to explain every screen. Your goal is to make the jury remember one clear idea:

> **Cloud Cost Sentinel does not merely report that cloud spend is abnormal. It explains what changed, proves why it changed, and shows what happens if the operator acts.**

Present the project as a **safe, full-stack FinOps investigation system**. Use the interface as evidence for the story rather than as a list of features.

---

## 1. The Recommended Opening

Begin with this sentence and pause afterward:

> “Most cloud billing dashboards can tell you that spend has increased. Our system is designed to answer the question that matters next: **what caused the increase, who owns it, and what will it cost if we do nothing?**”

Then continue:

> “Cloud Cost Sentinel converts a billing anomaly into an evidence-backed investigation. It combines cost deviation, usage deviation, and operational changes; ranks probable root causes; estimates projected impact; and lets an operator test containment options before touching production.”

This opening works because it establishes the **problem**, the **difference**, and the **safety boundary** in under 30 seconds.

---

## 2. The 90-Second Problem Statement

Use the following wording if the jury asks why the problem matters:

> “A cost spike is not automatically an incident. It may be organic demand, a planned deployment, a scaling change, a logging configuration, or a runaway workload. A cost-only threshold creates false positives and still leaves the FinOps team with manual investigation work. The missing layer is attribution: connecting financial data to usage signals and change events.”

> “We therefore built a safe demonstration environment using a realistic Cost and Usage Report-style dataset. It contains 48 synthetic billing line items across 11 fields, including service, usage type, region, team, deployment identifier, usage amount, and cost. No production AWS account is accessed.”

Avoid saying that the prototype is connected to a real production cloud. Say **“CUR-style synthetic feed”**, **“mock CloudTrail-like events”**, and **“safe test environment.”** That language demonstrates technical maturity and responsible scope.

---

## 3. The 5-Minute Demonstration Sequence

| Time | What you show | What you say | Why it impresses |
|---|---|---|---|
| 0:00–0:30 | Landing page and three-second branded splash | “This is the public entry point. It communicates the product promise before the operator enters the workspace.” | Shows product polish and a clear user journey. |
| 0:30–1:00 | Command center overview | “The dashboard starts with spend, avoidable spend, time to insight, and detection confidence.” | Establishes business value before technical detail. |
| 1:00–1:45 | Multi-signal anomaly panel | “The score is not cost-only. It combines cost deviation, usage deviation, and change intensity.” | Demonstrates a stronger detector than a simple threshold. |
| 1:45–2:30 | Filters and anomaly queue | “I can slice the queue by service, team, region, deployment, and severity. The selected investigation follows the filter.” | Shows practical operator workflow and interactivity. |
| 2:30–3:15 | Root-cause investigation | “The explanation is tied to evidence: the agent-loop deployment, the increase in model calls, the scaling change, and the cost guardrail crossing.” | Converts AI output into traceable reasoning. |
| 3:15–4:00 | What-if studio | “I can test a Bedrock daily cap and an ECS minimum capacity before making a change.” | Demonstrates proactive planning, not only alerting. |
| 4:00–4:30 | Operator action deck and feedback buttons | “Actions can be staged, and the operator can mark the explanation correct or misleading. That feedback updates the learning loop.” | Shows operational closure and continuous improvement. |
| 4:30–5:00 | Scan console and final summary | “A scan runs through ingestion, usage scoring, change correlation, and root-cause ranking. The result is an explainable decision, not just a red alert.” | Leaves the jury with a memorable end-to-end story. |

### The Rule During the Demo

Do not click randomly. Every click must answer one of these questions:

1. **What happened?**
2. **Why did it happen?**
3. **What evidence supports that conclusion?**
4. **What should the operator do next?**
5. **What is the financial impact of that action?**

If a feature does not answer one of these questions, do not spend presentation time on it.

---

## 4. The Strongest Live Story

Use the Bedrock anomaly as the central narrative because it connects every feature:

> “The current anomaly is Amazon Bedrock. The system sees a large cost deviation, an abnormal usage movement, and correlated operational changes. The top deployment candidate is `agent-loop-v3`. The evidence indicates that model calls increased without a proportional request increase, which suggests recursive behavior rather than normal demand.”

Then show the numbers:

- **Multi-signal score:** approximately 96–98 out of 100.
- **Projected monthly cost if ignored:** approximately **$88,920**.
- **Incremental impact above baseline:** approximately **$71,966**.
- **Top attribution:** Amazon Bedrock, with the `agent-loop-v3` deployment as a correlated change.
- **Evidence classification:** usage-driven, with configuration and scaling events contributing context.

Finish the story with the counterfactual:

> “Instead of stopping at the diagnosis, I can simulate a $100 daily Bedrock cap and reduce ECS minimum capacity from 10 to 2. The system estimates savings and gives the trade-off in request throttling. This lets an operator compare containment options before making a production decision.”

---

## 5. How to Explain the Technical Architecture

Use this simple architecture explanation:

> “The frontend is a React dashboard. The backend exposes typed tRPC procedures. The data layer persists synthetic CUR-style records, anomalies, investigations, evidence events, feedback, and what-if results. The detector uses a statistical z-score baseline. The attribution layer aggregates contribution across service, team, region, and deployment dimensions. The interface consumes the backend through typed queries and mutations.”

### Technical Components to Mention

| Component | What it does | Presentation wording |
|---|---|---|
| Synthetic CUR feed | Provides realistic billing and usage records | “A safe input layer that resembles the public CUR schema.” |
| Z-score detector | Measures deviation from the recent baseline | “A transparent detector whose score can be inspected.” |
| Multi-signal scorer | Combines cost, usage, and change intensity | “A weighted score that reduces cost-only false positives.” |
| Root-cause ranking | Scores service, team, region, and deploy candidates | “An attribution layer that turns anomaly detection into investigation.” |
| Evidence events | Provides mock CloudTrail-like operational context | “Every explanation points to concrete events.” |
| What-if simulator | Estimates savings and trade-offs | “A counterfactual planning tool with no production impact.” |
| Feedback loop | Stores correct or misleading judgments | “Operator feedback becomes a model-governance signal.” |
| tRPC API | Keeps frontend and backend contracts typed | “The UI and server share a typed contract.” |

Do not claim that the prototype uses a large language model to independently discover truth. Say that the system provides **structured, evidence-backed explanations** and that the demo uses deterministic mock data and ranking logic. This is more credible than saying “the AI knows the cause.”

---

## 6. The One-Slide Value Proposition

If you need to summarize the entire project on one slide or whiteboard, use this structure:

### Input

Billing rows, usage movement, tags, regions, teams, deployment identifiers, and operational events.

### Intelligence

Z-score deviation, multi-signal scoring, root-cause ranking, evidence correlation, and projected impact.

### Decision

A plain-English explanation, ranked actions, a counterfactual simulation, and an operator feedback loop.

### Outcome

Faster triage, fewer false positives, more defensible cost decisions, and safer remediation planning.

---

## 7. Likely Jury Questions and Strong Answers

### “Why did you use synthetic data?”

> “The challenge requires a safe demonstration environment. Synthetic data lets us reproduce a convincing anomaly, include deployment and team context, and demonstrate the full workflow without accessing an unauthorized production account. The schema is intentionally modeled after Cost and Usage Report-style fields so the ingestion boundary is realistic.”

### “Why use a z-score instead of Prophet or a more advanced model?”

> “Z-score is transparent and appropriate for a prototype with a controlled 12-day signal. It makes the detector easy to inspect and explain. In production, I would compare it with seasonal forecasting, service-specific baselines, and change-point detection.”

### “How do you avoid false positives?”

> “We do not rely on cost alone. The multi-signal score combines cost deviation, usage deviation, and change intensity. A planned deployment can explain a cost increase, while a large cost increase without proportional usage or change context becomes more suspicious.”

### “How do you know the root cause is correct?”

> “The system presents it as a ranked candidate, not an absolute truth. It shows the supporting events, contribution percentage, confidence, and classification. The operator can mark it correct or misleading, which creates a feedback signal for future calibration.”

### “Is the remediation automatic?”

> “No. The prototype deliberately keeps remediation safe. It stages recommended actions and simulates their effects, but it does not modify a production account. An enterprise version could add approvals, policy checks, and controlled integrations.”

### “What is novel here compared with a normal billing dashboard?”

> “A normal dashboard shows spend. This system connects spend to usage and operational change, ranks a probable cause, explains the evidence, projects the cost of inaction, and tests a response. The novelty is the investigation loop rather than another visualization of the invoice.”

### “What would you build next?”

> “I would add real CUR file upload and validation, service-specific seasonal baselines, CloudTrail and deployment integrations, alert routing, and an approval-controlled remediation workflow. The current architecture already separates ingestion, detection, attribution, simulation, and feedback, so those additions have clear integration points.”

---

## 8. How to Sound Confident Without Overclaiming

Use these phrases:

- **“The prototype demonstrates…”** instead of “This fully solves…”.
- **“The ranked candidate is…”** instead of “The AI knows…”.
- **“The simulation estimates…”** instead of “The savings are guaranteed.”
- **“The safe environment models…”** instead of “We connected to production.”
- **“The next production step would be…”** instead of pretending the demo is production-ready.

The jury will usually reward a precise prototype more than an exaggerated claim.

---

## 9. The 30-Second Closing

End with this:

> “Cloud Cost Sentinel changes the unit of work from an alert to an investigation. It starts with a realistic billing signal, adds usage and change context, ranks the probable cause, shows the evidence, estimates the cost of inaction, and lets the operator test a safer response. That is the difference between seeing a cloud bill and being able to act on it.”

Pause after the final sentence. Do not immediately add more information.

---

## 10. Presentation Readiness Checklist

Before the jury session, verify the following:

| Check | What to verify |
|---|---|
| Opening | You can deliver the first 30 seconds without reading. |
| Demo path | Landing page → command center → filters → investigation → what-if → feedback. |
| Safety language | You explicitly say the data and events are synthetic. |
| Numbers | You remember 48 rows, 11 fields, approximately $88,920 projected monthly cost, and approximately $71,966 incremental impact. |
| Interaction | You know how to run a scan and how to stage an operator action. |
| Filters | You can show service, team, region, deployment, and severity filtering. |
| Recovery | If a query loads slowly, explain the intended result and continue with the static evidence already visible. |
| Closing | You finish with the alert-to-investigation message. |

## Final Advice

Speak slowly. Use the interface to prove one idea at a time. When the jury sees a number, explain its decision value. When the jury sees a button, explain the operator decision it enables. The most impressive presentation will feel effortless because the story is linear: **detect, explain, simulate, learn, act safely.**

## References

[1]: manus-webdev://42da7e2c "Cloud Cost Sentinel prototype checkpoint"
[2]: https://docs.aws.amazon.com/cur/latest/userguide/what-is-data-dictionary.html "AWS Cost and Usage Report data dictionary"

import { mkdirSync, writeFileSync } from "node:fs";

const days = [
  ["Aug 25", 82, 164, 0, 274], ["Aug 26", 91, 171, 0, 286], ["Aug 27", 88, 167, 0, 279],
  ["Aug 28", 93, 176, 0, 293], ["Aug 29", 106, 182, 0, 302], ["Aug 30", 112, 195, 0, 307],
  ["Aug 31", 108, 188, 0, 292], ["Sep 01", 402, 368, 0, 370], ["Sep 02", 976, 722, 0, 542],
  ["Sep 03", 1486, 1035, 218, 447], ["Sep 04", 1392, 984, 184, 452], ["Sep 05", 1372, 956, 188, 448],
];
const dimensions = [
  ["Amazon Bedrock", "USE1-InputTokens", "us-east-1", "4812", "AI Platform", "agent-loop-v3"],
  ["Amazon ECS", "USE1-Fargate-vCPU-Hours", "us-east-1", "4812", "Core Platform", "ecs-floor-10"],
  ["Amazon CloudWatch", "USE1-DataProcessing-Bytes", "us-east-1", "4812", "AI Platform", "trace-verbose"],
  ["Amazon S3", "USE1-TimedStorage-ByteHrs", "us-west-2", "4812", "Data Platform", ""],
];
const header = ["usageDate", "service", "usageType", "region", "linkedAccount", "team", "environment", "deployId", "usageAmount", "unblendedCost", "lineItemType"];
const rows = [header];
for (const [day, bedrock, ecs, cloudwatch, other] of days) {
  const costs = [bedrock, ecs, cloudwatch, other];
  dimensions.forEach((dimension, index) => {
    const [service, usageType, region, account, team, deployId] = dimension;
    const activeChange = !["Aug 25", "Aug 26", "Aug 27", "Aug 28", "Aug 29", "Aug 30", "Aug 31"].includes(day);
    rows.push([day, service, usageType, region, account, team, "prod", activeChange ? deployId : "", String(costs[index] * (index === 0 ? 1000 : 100)), String(costs[index]), "Usage"]);
  });
}
mkdirSync(new URL("../data/", import.meta.url), { recursive: true });
writeFileSync(new URL("../data/synthetic-cur.csv", import.meta.url), rows.map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(",")).join("\n") + "\n");

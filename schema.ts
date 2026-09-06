import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export const costSnapshots = mysqlTable("cost_snapshots", {
  id: int("id").autoincrement().primaryKey(),
  day: varchar("day", { length: 32 }).notNull().unique(),
  total: int("total").notNull(),
  bedrock: int("bedrock").notNull(),
  ecs: int("ecs").notNull(),
  cloudwatch: int("cloudwatch").notNull(),
  other: int("other").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const curLineItems = mysqlTable("cur_line_items", {
  id: int("id").autoincrement().primaryKey(),
  usageDate: varchar("usageDate", { length: 32 }).notNull(),
  service: varchar("service", { length: 128 }).notNull(),
  usageType: varchar("usageType", { length: 128 }).notNull(),
  region: varchar("region", { length: 64 }).notNull(),
  linkedAccount: varchar("linkedAccount", { length: 128 }).notNull(),
  team: varchar("team", { length: 128 }).notNull(),
  environment: varchar("environment", { length: 32 }).notNull(),
  deployId: varchar("deployId", { length: 64 }),
  usageAmount: int("usageAmount").notNull(),
  unblendedCost: int("unblendedCost").notNull(),
  lineItemType: varchar("lineItemType", { length: 32 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const anomalies = mysqlTable("anomalies", {
  id: int("id").autoincrement().primaryKey(),
  anomalyId: varchar("anomalyId", { length: 32 }).notNull().unique(),
  service: varchar("service", { length: 128 }).notNull(),
  account: varchar("account", { length: 128 }).notNull(),
  occurredAt: varchar("occurredAt", { length: 64 }).notNull(),
  value: int("value").notNull(),
  delta: varchar("delta", { length: 16 }).notNull(),
  severity: mysqlEnum("severity", ["Critical", "High", "Medium", "Low"]).notNull(),
  score: int("score").notNull(),
  summary: text("summary").notNull(),
  status: mysqlEnum("status", ["open", "acknowledged", "resolved"]).default("open").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const evidenceEvents = mysqlTable("evidence_events", {
  id: int("id").autoincrement().primaryKey(),
  anomalyId: varchar("anomalyId", { length: 32 }).notNull(),
  eventTime: varchar("eventTime", { length: 32 }).notNull(),
  type: varchar("type", { length: 64 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  actor: varchar("actor", { length: 128 }).notNull(),
  accent: varchar("accent", { length: 16 }).notNull(),
});

export const investigations = mysqlTable("investigations", {
  id: int("id").autoincrement().primaryKey(),
  anomalyId: varchar("anomalyId", { length: 32 }).notNull().unique(),
  confidence: int("confidence").notNull(),
  rootCause: text("rootCause").notNull(),
  classification: varchar("classification", { length: 64 }).notNull(),
  owner: varchar("owner", { length: 128 }).notNull(),
  blastRadius: int("blastRadius").notNull(),
  evidence: text("evidence").notNull(),
  recommendations: text("recommendations").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const feedback = mysqlTable("feedback", {
  id: int("id").autoincrement().primaryKey(),
  anomalyId: varchar("anomalyId", { length: 32 }).notNull(),
  verdict: mysqlEnum("verdict", ["correct", "wrong"]).notNull(),
  note: text("note"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type CostSnapshot = typeof costSnapshots.$inferSelect;
export type CurLineItem = typeof curLineItems.$inferSelect;
export type Anomaly = typeof anomalies.$inferSelect;
export type EvidenceEvent = typeof evidenceEvents.$inferSelect;
export type Investigation = typeof investigations.$inferSelect;

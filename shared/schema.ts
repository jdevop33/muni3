import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").unique(),
  fullName: text("full_name"),
  role: text("role").notNull().default("user"),
  organization: text("organization"),
  position: text("position"),
  avatarUrl: text("avatar_url"),
  isActive: boolean("is_active").notNull().default(true),
  lastLogin: timestamp("last_login"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  fullName: true,
  role: true,
  organization: true,
  position: true,
  avatarUrl: true,
});

export const meetings = pgTable("meetings", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  type: text("type").notNull(),
  date: timestamp("date").notNull(),
  startTime: text("start_time").notNull(),
  duration: text("duration").notNull(),
  status: text("status").notNull(),
  topics: text("topics").array(),
  keyDiscussions: jsonb("key_discussions"),  // Added for key discussions
  keyDecisions: jsonb("key_decisions"),      // Added for key decisions
  participants: integer("participants").notNull(),
  hasVideo: boolean("has_video").default(false),
  hasTranscript: boolean("has_transcript").default(false),
  hasMinutes: boolean("has_minutes").default(false),
});

export const insertMeetingSchema = createInsertSchema(meetings).omit({ 
  id: true 
});

export const decisions = pgTable("decisions", {
  id: serial("id").primaryKey(),
  meetingId: integer("meeting_id").notNull(),
  meeting: text("meeting").notNull(), // For meeting name
  meetingType: text("meeting_type").notNull(), // For meeting type
  title: text("title").notNull(),
  description: text("description").notNull(),
  date: timestamp("date").notNull(),
  topics: text("topics").array(),
  votesFor: integer("votes_for"),
  votesAgainst: integer("votes_against"),
  status: text("status").notNull(),
  type: text("type").notNull(),
});

export const insertDecisionSchema = createInsertSchema(decisions).omit({ 
  id: true 
});

export const topics = pgTable("topics", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  count: integer("count").notNull(),
  lastDiscussed: timestamp("last_discussed"),
});

export const insertTopicSchema = createInsertSchema(topics).omit({ 
  id: true 
});

export const neighborhoods = pgTable("neighborhoods", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  discussions: integer("discussions").notNull(),
  lastDiscussed: timestamp("last_discussed"),
  color: text("color").notNull(),
});

export const insertNeighborhoodSchema = createInsertSchema(neighborhoods).omit({ 
  id: true 
});

export const meetingDiscussions = pgTable("meeting_discussions", {
  id: serial("id").primaryKey(),
  meetingId: integer("meeting_id").notNull(),
  speakerId: integer("speaker_id"),
  speakerName: text("speaker_name").notNull(),
  speakerRole: text("speaker_role"),
  speakerAvatar: text("speaker_avatar"),
  text: text("text").notNull(),
  timestamp: text("timestamp").notNull(),
  isDecision: boolean("is_decision").default(false),
  decisionId: integer("decision_id"),
});

export const insertMeetingDiscussionSchema = createInsertSchema(meetingDiscussions).omit({ 
  id: true 
});

export const meetingKeyMoments = pgTable("meeting_key_moments", {
  id: serial("id").primaryKey(),
  meetingId: integer("meeting_id").notNull(),
  title: text("title").notNull(),
  timestamp: text("timestamp").notNull(),
  description: text("description"),
});

export const insertMeetingKeyMomentSchema = createInsertSchema(meetingKeyMoments).omit({ 
  id: true 
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertMeeting = z.infer<typeof insertMeetingSchema>;
export type Meeting = typeof meetings.$inferSelect;

export type InsertDecision = z.infer<typeof insertDecisionSchema>;
export type Decision = typeof decisions.$inferSelect;

export type InsertTopic = z.infer<typeof insertTopicSchema>;
export type Topic = typeof topics.$inferSelect;

export type InsertNeighborhood = z.infer<typeof insertNeighborhoodSchema>;
export type Neighborhood = typeof neighborhoods.$inferSelect;

export type InsertMeetingDiscussion = z.infer<typeof insertMeetingDiscussionSchema>;
export type MeetingDiscussion = typeof meetingDiscussions.$inferSelect;

export type InsertMeetingKeyMoment = z.infer<typeof insertMeetingKeyMomentSchema>;
export type MeetingKeyMoment = typeof meetingKeyMoments.$inferSelect;

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  meetingDiscussions: many(meetingDiscussions, { relationName: "user_meeting_discussions" })
}));

export const meetingsRelations = relations(meetings, ({ many }) => ({
  decisions: many(decisions),
  discussions: many(meetingDiscussions),
  keyMoments: many(meetingKeyMoments)
}));

export const decisionsRelations = relations(decisions, ({ one, many }) => ({
  meeting: one(meetings, {
    fields: [decisions.meetingId],
    references: [meetings.id]
  }),
  discussions: many(meetingDiscussions, { relationName: "decision_discussions" })
}));

export const meetingDiscussionsRelations = relations(meetingDiscussions, ({ one }) => ({
  meeting: one(meetings, {
    fields: [meetingDiscussions.meetingId],
    references: [meetings.id]
  }),
  speaker: one(users, {
    fields: [meetingDiscussions.speakerId],
    references: [users.id],
    relationName: "user_meeting_discussions"
  }),
  decision: one(decisions, {
    fields: [meetingDiscussions.decisionId],
    references: [decisions.id],
    relationName: "decision_discussions"
  })
}));

export const meetingKeyMomentsRelations = relations(meetingKeyMoments, ({ one }) => ({
  meeting: one(meetings, {
    fields: [meetingKeyMoments.meetingId],
    references: [meetings.id]
  })
}));

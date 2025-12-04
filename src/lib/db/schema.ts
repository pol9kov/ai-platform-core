import { sqliteTable, text, integer, blob } from 'drizzle-orm/sqlite-core'

export const thoughts = sqliteTable('thoughts', {
  id: text('id').primaryKey(),
  spaceId: text('space_id').notNull(),
  content: text('content').notNull(),
  embedding: blob('embedding', { mode: 'buffer' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
})

export type Thought = typeof thoughts.$inferSelect
export type NewThought = typeof thoughts.$inferInsert

export const messages = sqliteTable('messages', {
  id: text('id').primaryKey(),
  spaceId: text('space_id').notNull(),
  role: text('role').notNull(), // 'user' | 'assistant'
  content: text('content').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
})

export type Message = typeof messages.$inferSelect
export type NewMessage = typeof messages.$inferInsert

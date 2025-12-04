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

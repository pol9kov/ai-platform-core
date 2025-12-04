import { db, thoughts, type Thought, type NewThought } from './db'
import { eq, desc, like, and } from 'drizzle-orm'
import { events } from './events'

function generateId(): string {
  return crypto.randomUUID()
}

export async function createThought(
  spaceId: string,
  content: string,
  embedding?: Float32Array
): Promise<Thought> {
  const thought: NewThought = {
    id: generateId(),
    spaceId,
    content,
    embedding: embedding ? Buffer.from(embedding.buffer) : null,
    createdAt: new Date(),
  }

  await db.insert(thoughts).values(thought)

  const created = { ...thought, createdAt: thought.createdAt } as Thought
  events.emit('thought:created', { thought: created })

  return created
}

export async function listThoughts(spaceId: string): Promise<Thought[]> {
  return db
    .select()
    .from(thoughts)
    .where(eq(thoughts.spaceId, spaceId))
    .orderBy(desc(thoughts.createdAt))
}

export async function searchThoughts(
  spaceId: string,
  query: string
): Promise<Thought[]> {
  return db
    .select()
    .from(thoughts)
    .where(and(eq(thoughts.spaceId, spaceId), like(thoughts.content, `%${query}%`)))
    .orderBy(desc(thoughts.createdAt))
}

export async function deleteThought(id: string): Promise<void> {
  await db.delete(thoughts).where(eq(thoughts.id, id))
}

export type { Thought, NewThought }

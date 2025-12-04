import { db, messages, type Message, type NewMessage } from './db'
import { eq, asc } from 'drizzle-orm'
import { events } from './events'

function generateId(): string {
  return crypto.randomUUID()
}

export async function createMessage(
  spaceId: string,
  role: 'user' | 'assistant',
  content: string
): Promise<Message> {
  const message: NewMessage = {
    id: generateId(),
    spaceId,
    role,
    content,
    createdAt: new Date(),
  }

  await db.insert(messages).values(message)

  const created = { ...message, createdAt: message.createdAt } as Message
  events.emit('message:received', { message: created })

  return created
}

export async function listMessages(spaceId: string): Promise<Message[]> {
  return db
    .select()
    .from(messages)
    .where(eq(messages.spaceId, spaceId))
    .orderBy(asc(messages.createdAt))
}

export async function deleteMessages(spaceId: string): Promise<void> {
  await db.delete(messages).where(eq(messages.spaceId, spaceId))
}

export type { Message, NewMessage }

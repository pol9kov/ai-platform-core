import { PluginManifest } from '../plugins'
import { events } from '../events'
import { searchThoughts, createThought } from '../thoughts'
import { listMessages, type Message } from '../messages'
import OpenAI from 'openai'

// AI completion logic - owned by thoughts plugin
export async function completeWithThoughts(
  spaceId: string,
  query: string,
  history: Message[]
): Promise<string> {
  const openai = new OpenAI()

  // RAG: search for relevant thoughts
  const relevantThoughts = await searchThoughts(spaceId, query)

  // Build context from thoughts
  let contextPrompt = ''
  if (relevantThoughts.length > 0) {
    contextPrompt = `\n\nRelevant context from user's thoughts:\n${relevantThoughts
      .slice(0, 5)
      .map(t => `- ${t.content}`)
      .join('\n')}\n\nUse this context to inform your responses when relevant.`
  }

  // Build messages for OpenAI
  const openaiMessages: OpenAI.ChatCompletionMessageParam[] = [
    {
      role: 'system',
      content: `You are a helpful AI assistant in a knowledge management platform. Help the user organize and explore their thoughts.${contextPrompt}`,
    },
    ...history.map(msg => ({
      role: msg.role as 'user' | 'assistant',
      content: msg.content,
    })),
  ]

  // Call LLM
  const response = await openai.chat.completions.create({
    model: 'gpt-5-nano',
    max_completion_tokens: 1024,
    messages: openaiMessages,
  })

  return response.choices[0]?.message?.content || ''
}

// Thoughts plugin manifest
export const thoughtsManifest: PluginManifest = {
  name: 'Thoughts',
  version: '1.0.0',
  depends: ['core'],
  emits: ['thought:created'],
  listens: ['message:received'],
  handles: ['ai:complete'],
  init: () => {
    // Register AI completion handler
    events.handle('ai:complete', async (payload: { spaceId: string; query: string }) => {
      const { spaceId, query } = payload
      const history = await listMessages(spaceId)
      const answer = await completeWithThoughts(spaceId, query, history)
      return { answer }
    })
  },
}

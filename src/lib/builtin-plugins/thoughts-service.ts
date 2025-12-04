// Server-only: AI completion logic for thoughts plugin
import { searchThoughts } from '../thoughts'
import { listMessages, type Message } from '../messages'
import OpenAI from 'openai'

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

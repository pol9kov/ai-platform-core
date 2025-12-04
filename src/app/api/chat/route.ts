import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createMessage, listMessages } from '@/lib/messages'
import { searchThoughts } from '@/lib/thoughts'

const anthropic = new Anthropic()

// POST /api/chat
export async function POST(request: NextRequest) {
  const body = await request.json()
  const { spaceId, content } = body

  if (!spaceId || !content) {
    return NextResponse.json(
      { error: 'spaceId and content required' },
      { status: 400 }
    )
  }

  try {
    // Save user message
    const userMessage = await createMessage(spaceId, 'user', content)

    // Get conversation history
    const history = await listMessages(spaceId)

    // Search for relevant thoughts (RAG context)
    const relevantThoughts = await searchThoughts(spaceId, content)

    // Build context from thoughts
    let contextPrompt = ''
    if (relevantThoughts.length > 0) {
      contextPrompt = `\n\nRelevant context from user's thoughts:\n${relevantThoughts
        .slice(0, 5)
        .map(t => `- ${t.content}`)
        .join('\n')}\n\nUse this context to inform your responses when relevant.`
    }

    // Build messages for Anthropic
    const anthropicMessages = history.map(msg => ({
      role: msg.role as 'user' | 'assistant',
      content: msg.content,
    }))

    // Call Anthropic API
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: `You are a helpful AI assistant in a knowledge management platform. Help the user organize and explore their thoughts.${contextPrompt}`,
      messages: anthropicMessages,
    })

    // Extract response text
    const assistantContent = response.content
      .filter(block => block.type === 'text')
      .map(block => block.text)
      .join('')

    // Save assistant message
    const assistantMessage = await createMessage(spaceId, 'assistant', assistantContent)

    return NextResponse.json({
      userMessage,
      assistantMessage,
    })
  } catch (error) {
    console.error('Chat error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// GET /api/chat?spaceId=xxx - get message history
export async function GET(request: NextRequest) {
  const spaceId = request.nextUrl.searchParams.get('spaceId')

  if (!spaceId) {
    return NextResponse.json({ error: 'spaceId required' }, { status: 400 })
  }

  try {
    const messages = await listMessages(spaceId)
    return NextResponse.json(messages)
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { createMessage, listMessages } from '@/lib/messages'
import { completeWithThoughts } from '@/lib/builtin-plugins/thoughts'

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

    // AI completion - delegated to thoughts plugin
    const assistantContent = await completeWithThoughts(spaceId, content, history)

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

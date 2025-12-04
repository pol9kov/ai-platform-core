import { NextRequest, NextResponse } from 'next/server'
import { createThought, listThoughts, searchThoughts } from '@/lib/thoughts'

// GET /api/thoughts?spaceId=xxx&query=xxx
export async function GET(request: NextRequest) {
  const spaceId = request.nextUrl.searchParams.get('spaceId')
  const query = request.nextUrl.searchParams.get('query')

  if (!spaceId) {
    return NextResponse.json({ error: 'spaceId required' }, { status: 400 })
  }

  try {
    const result = query
      ? await searchThoughts(spaceId, query)
      : await listThoughts(spaceId)
    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// POST /api/thoughts
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
    const thought = await createThought(spaceId, content)
    return NextResponse.json(thought)
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

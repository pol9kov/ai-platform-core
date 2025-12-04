'use client'

import { events } from './events'
import { getUserId } from './auth'

export interface Space {
  id: string
  name: string
  createdAt: number
}

const SPACES_KEY = 'ai-platform:spaces'
const CURRENT_SPACE_KEY = 'ai-platform:current-space'

function getStorageKey(userId: string): string {
  return `${SPACES_KEY}:${userId}`
}

export function getSpaces(): Space[] {
  if (typeof window === 'undefined') return []
  const userId = getUserId()
  const data = localStorage.getItem(getStorageKey(userId))
  return data ? JSON.parse(data) : []
}

export function createSpace(name: string): Space {
  const userId = getUserId()
  const spaces = getSpaces()

  const space: Space = {
    id: crypto.randomUUID(),
    name,
    createdAt: Date.now()
  }

  spaces.push(space)
  localStorage.setItem(getStorageKey(userId), JSON.stringify(spaces))
  events.emit('space:created', space)

  return space
}

export function deleteSpace(id: string): void {
  const userId = getUserId()
  const spaces = getSpaces().filter(s => s.id !== id)
  localStorage.setItem(getStorageKey(userId), JSON.stringify(spaces))

  // Clear current space if deleted
  if (getCurrentSpaceId() === id) {
    setCurrentSpace(spaces[0]?.id ?? null)
  }

  events.emit('space:deleted', { id })
}

export function getCurrentSpaceId(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(CURRENT_SPACE_KEY)
}

export function setCurrentSpace(id: string | null): void {
  if (typeof window === 'undefined') return
  if (id) {
    localStorage.setItem(CURRENT_SPACE_KEY, id)
  } else {
    localStorage.removeItem(CURRENT_SPACE_KEY)
  }
  events.emit('space:selected', { id })
}

export function getCurrentSpace(): Space | null {
  const id = getCurrentSpaceId()
  if (!id) return null
  return getSpaces().find(s => s.id === id) ?? null
}

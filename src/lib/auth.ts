'use client'

const USER_ID_KEY = 'ai-platform:user-id'

function generateUUID(): string {
  return crypto.randomUUID()
}

export function getUserId(): string {
  if (typeof window === 'undefined') {
    return ''
  }

  let userId = localStorage.getItem(USER_ID_KEY)
  if (!userId) {
    userId = generateUUID()
    localStorage.setItem(USER_ID_KEY, userId)
  }
  return userId
}

export function clearUserId(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(USER_ID_KEY)
}

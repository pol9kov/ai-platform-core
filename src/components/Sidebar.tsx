'use client'

import { useEffect, useState } from 'react'
import { Space, getSpaces, createSpace, deleteSpace, getCurrentSpaceId, setCurrentSpace } from '@/lib/spaces'
import { events } from '@/lib/events'

export function Sidebar() {
  const [spaces, setSpaces] = useState<Space[]>(() => getSpaces())
  const [currentId, setCurrentId] = useState<string | null>(() => getCurrentSpaceId())

  useEffect(() => {
    const unsub1 = events.on('space:created', () => setSpaces(getSpaces()))
    const unsub2 = events.on('space:deleted', () => setSpaces(getSpaces()))
    const unsub3 = events.on<{ id: string | null }>('space:selected', ({ id }) => setCurrentId(id))

    return () => {
      unsub1()
      unsub2()
      unsub3()
    }
  }, [])

  const handleCreate = () => {
    const name = prompt('Space name:')
    if (name) {
      const space = createSpace(name)
      setCurrentSpace(space.id)
    }
  }

  return (
    <aside className="w-60 border-r border-neutral-200 dark:border-neutral-800 flex flex-col">
      <div className="p-3 border-b border-neutral-200 dark:border-neutral-800 flex justify-between items-center">
        <span className="text-sm font-medium">Spaces</span>
        <button
          onClick={handleCreate}
          className="text-sm px-2 py-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800"
        >
          +
        </button>
      </div>
      <nav className="flex-1 overflow-y-auto p-2">
        {spaces.length === 0 && (
          <p className="text-sm text-neutral-500 p-2">No spaces yet</p>
        )}
        {spaces.map(space => (
          <div
            key={space.id}
            className={`group flex items-center justify-between p-2 rounded cursor-pointer ${
              currentId === space.id
                ? 'bg-neutral-100 dark:bg-neutral-800'
                : 'hover:bg-neutral-50 dark:hover:bg-neutral-900'
            }`}
            onClick={() => setCurrentSpace(space.id)}
          >
            <span className="text-sm truncate">{space.name}</span>
            <button
              onClick={(e) => {
                e.stopPropagation()
                if (confirm('Delete this space?')) {
                  deleteSpace(space.id)
                }
              }}
              className="opacity-0 group-hover:opacity-100 text-neutral-400 hover:text-red-500 text-xs"
            >
              ×
            </button>
          </div>
        ))}
      </nav>
    </aside>
  )
}

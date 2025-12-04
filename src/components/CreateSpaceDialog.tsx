'use client'

import { useState } from 'react'
import { getAvailablePluginNames } from '@/lib/builtin-plugins'

interface CreateSpaceDialogProps {
  onClose: () => void
  onCreate: (name: string, plugins: string[]) => void
}

export function CreateSpaceDialog({ onClose, onCreate }: CreateSpaceDialogProps) {
  const [name, setName] = useState('')
  const [selectedPlugins, setSelectedPlugins] = useState<string[]>([])
  const availablePlugins = getAvailablePluginNames()

  const togglePlugin = (pluginName: string) => {
    setSelectedPlugins(prev =>
      prev.includes(pluginName)
        ? prev.filter(p => p !== pluginName)
        : [...prev, pluginName]
    )
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (name.trim() && selectedPlugins.length > 0) {
      onCreate(name.trim(), selectedPlugins)
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-neutral-900 rounded-lg p-6 w-80 shadow-xl">
        <h2 className="text-lg font-semibold mb-4">Create Space</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm text-neutral-600 dark:text-neutral-400 mb-1">
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="My Space"
              autoFocus
              className="w-full px-3 py-2 rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm text-neutral-600 dark:text-neutral-400 mb-2">
              Plugins
            </label>
            <div className="space-y-2">
              {availablePlugins.map(plugin => (
                <label
                  key={plugin}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedPlugins.includes(plugin)}
                    onChange={() => togglePlugin(plugin)}
                    className="rounded"
                  />
                  <span className="text-sm">{plugin}</span>
                </label>
              ))}
            </div>
            {availablePlugins.length === 0 && (
              <p className="text-sm text-neutral-500">No plugins available</p>
            )}
          </div>

          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm rounded hover:bg-neutral-100 dark:hover:bg-neutral-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim() || selectedPlugins.length === 0}
              className="px-4 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

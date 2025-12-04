'use client'

import { useEffect, useState, ComponentType } from 'react'
import { plugins } from '@/lib/plugins'
import { events } from '@/lib/events'
import { getCurrentSpace } from '@/lib/spaces'
import { registerPlugins } from '@/lib/builtin-plugins'

interface PluginWithView {
  name: string
  SpaceView: ComponentType
}

export function PluginTabs() {
  const [pluginViews, setPluginViews] = useState<PluginWithView[]>([])
  const [activeTab, setActiveTab] = useState<string | null>(null)
  const [spacePlugins, setSpacePlugins] = useState<string[]>([])

  // Load plugins when space changes
  useEffect(() => {
    async function loadSpacePlugins() {
      const space = getCurrentSpace()
      const pluginNames = space?.plugins || []
      setSpacePlugins(pluginNames)

      // Register plugins for this space
      await registerPlugins(pluginNames)

      // Get plugin views
      const allViews = plugins.getComponents() as PluginWithView[]
      const filteredViews = allViews.filter(p => pluginNames.includes(p.name))
      setPluginViews(filteredViews)
      setActiveTab(filteredViews[0]?.name || null)
    }

    loadSpacePlugins()

    const unsub = events.on('space:selected', () => {
      loadSpacePlugins()
    })

    return () => unsub()
  }, [])

  // Update when plugins are loaded
  useEffect(() => {
    const unsub = events.on('plugin:loaded', () => {
      const allViews = plugins.getComponents() as PluginWithView[]
      const filteredViews = allViews.filter(p => spacePlugins.includes(p.name))
      setPluginViews(filteredViews)
      setActiveTab(prev => prev ?? (filteredViews[0]?.name || null))
    })
    return () => unsub()
  }, [spacePlugins])

  if (pluginViews.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-neutral-500">
        No plugins enabled for this space
      </div>
    )
  }

  const ActiveView = pluginViews.find(p => p.name === activeTab)?.SpaceView

  return (
    <div className="h-full flex flex-col">
      <div className="border-b border-neutral-200 dark:border-neutral-800 flex">
        {pluginViews.map(plugin => (
          <button
            key={plugin.name}
            onClick={() => setActiveTab(plugin.name)}
            className={`px-4 py-2 text-sm ${
              activeTab === plugin.name
                ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
            }`}
          >
            {plugin.name}
          </button>
        ))}
      </div>
      <div className="flex-1 overflow-y-auto">
        {ActiveView && <ActiveView />}
      </div>
    </div>
  )
}

'use client'

import { useEffect, useState, ComponentType } from 'react'
import { plugins } from '@/lib/plugins'
import { events } from '@/lib/events'

interface PluginWithView {
  name: string
  SpaceView: ComponentType
}

function getInitialViews(): PluginWithView[] {
  return plugins.getComponents() as PluginWithView[]
}

export function PluginTabs() {
  const [pluginViews, setPluginViews] = useState<PluginWithView[]>(getInitialViews)
  const [activeTab, setActiveTab] = useState<string | null>(() => {
    const views = getInitialViews()
    return views.length > 0 ? views[0].name : null
  })

  useEffect(() => {
    const unsub = events.on('plugin:loaded', () => {
      const views = plugins.getComponents() as PluginWithView[]
      setPluginViews(views)
      setActiveTab(prev => prev ?? (views.length > 0 ? views[0].name : null))
    })
    return () => unsub()
  }, [])

  if (pluginViews.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-neutral-500">
        No plugins loaded
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

'use client'

import { useEffect, useState, useRef } from 'react'
import { Layout } from '@/components/Layout'
import { PluginTabs } from '@/components/PluginTabs'
import { getCurrentSpace } from '@/lib/spaces'
import { events } from '@/lib/events'
import { registerBuiltinPlugins } from '@/lib/builtin-plugins'

export default function Home() {
  const [currentSpace, setCurrentSpaceState] = useState(getCurrentSpace())
  const pluginsInitialized = useRef(false)

  useEffect(() => {
    if (!pluginsInitialized.current) {
      pluginsInitialized.current = true
      registerBuiltinPlugins()
    }
  }, [])

  useEffect(() => {
    const unsub = events.on('space:selected', () => {
      setCurrentSpaceState(getCurrentSpace())
    })
    return () => unsub()
  }, [])

  return (
    <Layout>
      {currentSpace ? (
        <PluginTabs />
      ) : (
        <div className="h-full flex items-center justify-center text-neutral-500">
          Select or create a space to get started
        </div>
      )}
    </Layout>
  )
}

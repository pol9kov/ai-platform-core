'use client'

import { useEffect, useState } from 'react'
import { Layout } from '@/components/Layout'
import { PluginTabs } from '@/components/PluginTabs'
import { getCurrentSpace } from '@/lib/spaces'
import { events } from '@/lib/events'

export default function Home() {
  const [currentSpace, setCurrentSpaceState] = useState(getCurrentSpace())

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

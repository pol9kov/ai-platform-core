import { ComponentType } from 'react'
import { events } from './events'

export interface PluginManifest {
  name: string
  version?: string
  depends?: string[]
  emits?: string[]
  handles?: string[]
  components?: {
    SpaceView?: ComponentType
    Tab?: ComponentType
  }
  init?: () => void | Promise<void>
}

interface RegisteredPlugin {
  manifest: PluginManifest
  loaded: boolean
}

class PluginLoader {
  private plugins = new Map<string, RegisteredPlugin>()

  async register(manifest: PluginManifest): Promise<void> {
    // Validate manifest
    if (!manifest.name) {
      throw new Error('Plugin manifest must have a name')
    }

    if (this.plugins.has(manifest.name)) {
      throw new Error(`Plugin already registered: ${manifest.name}`)
    }

    // Check dependencies
    for (const dep of manifest.depends ?? []) {
      if (dep !== 'core' && !this.plugins.has(dep)) {
        throw new Error(`Missing dependency: ${dep} for plugin ${manifest.name}`)
      }
    }

    // Register plugin
    this.plugins.set(manifest.name, { manifest, loaded: false })

    // Initialize plugin
    if (manifest.init) {
      await manifest.init()
    }

    this.plugins.get(manifest.name)!.loaded = true
    events.emit('plugin:loaded', { name: manifest.name })
  }

  get(name: string): PluginManifest | undefined {
    return this.plugins.get(name)?.manifest
  }

  getAll(): PluginManifest[] {
    return Array.from(this.plugins.values())
      .filter(p => p.loaded)
      .map(p => p.manifest)
  }

  getComponents(): { name: string; SpaceView?: ComponentType }[] {
    return this.getAll()
      .filter(m => m.components?.SpaceView)
      .map(m => ({ name: m.name, SpaceView: m.components!.SpaceView }))
  }
}

export const plugins = new PluginLoader()

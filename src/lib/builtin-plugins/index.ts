import { plugins, PluginManifest } from '../plugins'
import { chatManifest } from './chat'
import { thoughtsManifest } from './thoughts'

// All available plugins
export const availablePlugins: PluginManifest[] = [
  thoughtsManifest,  // Thoughts first - provides ai:complete handler
  chatManifest,
]

// Get list of available plugin names
export function getAvailablePluginNames(): string[] {
  return availablePlugins.map(p => p.name)
}

// Register specific plugins by name
export async function registerPlugins(pluginNames: string[]) {
  for (const name of pluginNames) {
    const manifest = availablePlugins.find(p => p.name === name)
    if (manifest && !plugins.get(name)) {
      await plugins.register(manifest)
    }
  }
}

// Register all builtin plugins (for backwards compatibility)
export async function registerBuiltinPlugins() {
  for (const manifest of availablePlugins) {
    if (!plugins.get(manifest.name)) {
      await plugins.register(manifest)
    }
  }
}

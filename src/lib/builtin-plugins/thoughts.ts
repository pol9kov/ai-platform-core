// Client-safe: Thoughts plugin manifest only (no server imports)
import { PluginManifest } from '../plugins'

export const thoughtsManifest: PluginManifest = {
  name: 'Thoughts',
  version: '1.0.0',
  depends: ['core'],
  emits: ['thought:created'],
  listens: ['message:received'],
  handles: ['ai:complete'],
  // Note: init would register handlers, but that's server-side only
}

import { plugins } from '../plugins'
import { chatManifest } from './chat'

export async function registerBuiltinPlugins() {
  await plugins.register(chatManifest)
}

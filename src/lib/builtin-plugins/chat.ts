import { PluginManifest } from '../plugins'
import { ChatView } from '@/components/ChatView'

export const chatManifest: PluginManifest = {
  name: 'Chat',
  version: '1.0.0',
  depends: ['core'],
  optional: ['thoughts'],
  emits: ['message:received'],
  listens: [],
  handles: [],
  components: {
    SpaceView: ChatView,
  },
}

import { PluginManifest } from '../plugins'
import { GraphView } from '@/components/GraphView'

export const graphManifest: PluginManifest = {
  name: 'Graph',
  version: '1.0.0',
  depends: ['core'],
  optional: ['thoughts'],
  emits: [],
  listens: ['thought:created'],
  handles: [],
  components: {
    SpaceView: GraphView,
  },
}

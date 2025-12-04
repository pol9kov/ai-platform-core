// Core exports for plugins
export { events } from './events'
export type { EventHandler, RequestHandler } from './events'

export { plugins } from './plugins'
export type { PluginManifest } from './plugins'

export { getUserId, clearUserId } from './auth'

export {
  getSpaces,
  createSpace,
  deleteSpace,
  getCurrentSpaceId,
  setCurrentSpace,
  getCurrentSpace
} from './spaces'
export type { Space } from './spaces'

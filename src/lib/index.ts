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

export {
  createThought,
  listThoughts,
  searchThoughts,
  deleteThought
} from './thoughts'
export type { Thought, NewThought } from './thoughts'

export {
  createMessage,
  listMessages,
  deleteMessages
} from './messages'
export type { Message, NewMessage } from './messages'

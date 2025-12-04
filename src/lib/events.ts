type EventHandler<T = unknown> = (payload: T) => void
type RequestHandler<T = unknown, R = unknown> = (payload: T) => R | Promise<R>

class EventBus {
  private listeners = new Map<string, Set<EventHandler>>()
  private handlers = new Map<string, RequestHandler>()

  // Fire-and-forget event
  emit<T = unknown>(event: string, payload?: T): void {
    const eventListeners = this.listeners.get(event)
    if (eventListeners) {
      eventListeners.forEach(handler => handler(payload))
    }
  }

  // Subscribe to events
  on<T = unknown>(event: string, handler: EventHandler<T>): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set())
    }
    this.listeners.get(event)!.add(handler as EventHandler)

    // Return unsubscribe function
    return () => {
      this.listeners.get(event)?.delete(handler as EventHandler)
    }
  }

  // Request with response
  async request<T = unknown, R = unknown>(event: string, payload?: T): Promise<R> {
    const handler = this.handlers.get(event)
    if (!handler) {
      throw new Error(`No handler registered for: ${event}`)
    }
    return handler(payload) as Promise<R>
  }

  // Register request handler (only one per event)
  handle<T = unknown, R = unknown>(event: string, handler: RequestHandler<T, R>): () => void {
    if (this.handlers.has(event)) {
      throw new Error(`Handler already registered for: ${event}`)
    }
    this.handlers.set(event, handler as RequestHandler)

    // Return unregister function
    return () => {
      this.handlers.delete(event)
    }
  }
}

export const events = new EventBus()
export type { EventHandler, RequestHandler }

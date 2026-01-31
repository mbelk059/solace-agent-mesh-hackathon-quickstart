// Shared event store for SSE broadcasting across route handlers
// Use globalThis to ensure we have a truly shared instance across all route handlers

// @ts-ignore - globalThis is available in Node.js
const globalForSubscribers = globalThis as unknown as {
  subscribers?: Set<ReadableStreamDefaultController>;
};

// Initialize subscribers Set on globalThis if it doesn't exist
if (!globalForSubscribers.subscribers) {
  globalForSubscribers.subscribers = new Set<ReadableStreamDefaultController>();
  console.log('[events-store] Initialized global subscribers Set');
}

export const subscribers = globalForSubscribers.subscribers;

export function broadcastEvent(event: any) {
  console.log(`[broadcastEvent] Broadcasting ${event.type}, subscribers: ${subscribers.size}`);
  
  if (subscribers.size === 0) {
    console.warn('[broadcastEvent] No subscribers connected to event stream');
    return;
  }

  const data = JSON.stringify(event) + '\n\n';
  const encoded = new TextEncoder().encode(`data: ${data}`);
  
  const deadSubscribers: ReadableStreamDefaultController[] = [];
  let successCount = 0;
  
  subscribers.forEach((controller) => {
    try {
      controller.enqueue(encoded);
      successCount++;
    } catch (error) {
      console.error('[broadcastEvent] Error enqueueing to subscriber:', error);
      // Mark dead subscribers for removal
      deadSubscribers.push(controller);
    }
  });

  // Remove dead subscribers
  deadSubscribers.forEach((controller) => {
    subscribers.delete(controller);
  });

  console.log(`[broadcastEvent] Successfully broadcasted ${event.type} to ${successCount}/${subscribers.size} subscribers`);
}

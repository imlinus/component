/**
 * Scheduler — cooperative, time-sliced task runner
 * 
 * Advances generator tasks smoothly over rAF passes without blocking.
 */

/** Queue of generator tasks waiting to be processed. */
const tasks = []

/** Whether a frame callback has already been requested. */
let frameRequested = false

/** Channel for microtask resumption of generator renders. */
const channel = typeof MessageChannel !== 'undefined' ? new MessageChannel() : null

/** Enqueue generator task for cooperative processing. */
export function schedule (task) {
  tasks.push(task)
  if (!frameRequested) {
    frameRequested = true
    requestAnimationFrame(() => {
      if (channel) {
        channel.port1.postMessage(null)
      } else {
        processTasks()
      }
    })
  }
}

if (channel) {
  channel.port2.onmessage = processTasks
}

/** Processes internal generator queue until time slice hits 10ms. */
function processTasks () {
  frameRequested = false
  const startTime = performance.now()

  while (tasks.length > 0) {
    const task = tasks[0]
    const { done } = task.next()

    if (done) {
      tasks.shift()
    }

    // Yield to the browser after 10 ms to keep the UI responsive.
    if (performance.now() - startTime > 10) {
      frameRequested = true
      requestAnimationFrame(() => {
        if (channel) {
          channel.port1.postMessage(null)
        } else {
          processTasks()
        }
      })
      break
    }
  }
}

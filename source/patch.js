/**
 * DOM patching — incremental updates with key-based reconciliation.
 * Reconciles the live DOM against the new parsed template VDOM.
 */

/** Reconciles the live children of a parent to match the new parsed VDOM children array. */
export function reconcileChildren (dom, vdomChildren) {
  // Build a map of keyed existing nodes for O(1) lookup.
  const keyedNodes = new Map()
  Array.from(dom.childNodes).forEach(node => {
    const key = node.dataset?.key
    if (key) keyedNodes.set(key, node)
  })

  vdomChildren.forEach((vChild, i) => {
    const key = vChild.dataset?.key
    const existingByKey = key ? keyedNodes.get(key) : null
    const existingByIndex = dom.childNodes[i]

    if (existingByKey) {
      // Reuse the keyed node, moving it into position if needed.
      patch(existingByKey, vChild)
      if (dom.childNodes[i] !== existingByKey) {
        dom.insertBefore(existingByKey, dom.childNodes[i] ?? null)
      }
      keyedNodes.delete(key) // Mark as consumed.
    } else if (existingByIndex && !existingByIndex.dataset?.key) {
      // Unkeyed position match — patch in place.
      patch(existingByIndex, vChild)
    } else {
      // No match — insert a new node.
      dom.insertBefore(vChild.cloneNode(true), dom.childNodes[i] ?? null)
    }
  })

  // Remove any leftover keyed nodes that are no longer in the new children.
  keyedNodes.forEach(node => node.remove())

  // Remove trailing unkeyed nodes beyond the new child count.
  while (dom.childNodes.length > vdomChildren.length) {
    dom.lastChild.remove()
  }
}

/** Patches a single live DOM node to match a virtual DOM node. */
export function patch (dom, vdom) {
  if (!vdom) {
    if (dom?.remove) dom.remove()
    return
  }
  if (!dom) return

  // If the node types differ (e.g. text vs element), replace wholesale.
  if (dom.nodeType !== vdom.nodeType) {
    dom.replaceWith(vdom.cloneNode(true))
    return
  }

  if (dom.nodeType === 1) {
    // Element node — check tag name first.
    if (dom.tagName !== vdom.tagName) {
      dom.replaceWith(vdom.cloneNode(true))
      return
    }

    // Remove attributes that no longer exist in the new vdom.
    for (let i = dom.attributes.length - 1; i >= 0; i--) {
      const attr = dom.attributes[i]
      if (attr && !vdom.hasAttribute(attr.name)) {
        try {
          dom.removeAttribute(attr.name)
        } catch (_e) {
          // Skip attributes with names the DOM API considers invalid.
        }
      }
    }

    // Set / update attributes to match vdom.
    for (let i = 0; i < vdom.attributes.length; i++) {
      const attr = vdom.attributes[i]
      if (attr && dom.getAttribute(attr.name) !== attr.value) {
        try {
          dom.setAttribute(attr.name, attr.value)
        } catch (e) {
          // Guard against DOMException: InvalidCharacterError.
          console.warn('[patch] Skipping invalid attribute:', attr.name, e.message)
        }
      }
    }

    // Preserve live form values (the DOM tracks these separately from attrs).
    if (dom.tagName === 'SELECT') {
      // For SELECT, vdom.value is unreliable (template parsing doesn't compute it).
      // Instead, derive the intended value from the option with a `selected` attribute.
      const selectedOpt = vdom.querySelector('option[selected]')
      const intendedValue = selectedOpt ? selectedOpt.getAttribute('value') || selectedOpt.textContent.trim() : ''
      if (dom.value !== intendedValue) dom.value = intendedValue
    } else if (dom.tagName === 'INPUT' || dom.tagName === 'TEXTAREA') {
      if (dom.value !== vdom.value) dom.value = vdom.value
      if (dom.checked !== vdom.checked) dom.checked = vdom.checked
    }

    // Reconcile children with key awareness.
    reconcileChildren(dom, Array.from(vdom.childNodes))
  } else if (dom.nodeType === 3 || dom.nodeType === 8) {
    // Text or comment node — just update the content.
    if (dom.textContent !== vdom.textContent) dom.textContent = vdom.textContent
  }
}

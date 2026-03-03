/**
 * Component Framework — public API barrel file.
 *
 * All consumer imports come through here:
 *   import { html, Component, useState, ... } from '//js.imlin.us/component'
 *
 * The framework is split into focused modules:
 *
 *   scheduler.js  — cooperative, time-sliced task runner (rAF + MessageChannel)
 *   utils.js      — shallowEqual, escapeAttr (shared helpers)
 *   diff.js       — generator-based virtual tree diffing
 *   template.js   — html tagged template + shared internal bookkeeping state
 *   hooks.js      — useState, useEffect, useRef
 *   patch.js      — DOM patching with key-based child reconciliation
 *   component.js  — Component class, functional() wrapper, mount() helper
 */

export { html } from '/component/source/template.js'
export { useState, useEffect, useRef } from '/component/source/hooks.js'
export { Component, functional, mount } from '/component/source/component.js'

// Default export for `import component from '...'` style usage.
import { html } from '/component/source/template.js'
import { useState, useEffect, useRef } from '/component/source/hooks.js'
import { Component, functional, mount } from '/component/source/component.js'

export default { Component, html, useState, useEffect, useRef, functional, mount }
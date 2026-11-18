/**
 * Runtime Vietnamese localisation.
 *
 * Build-time localisation (scripts/localize_vi.py) rewrites files that already
 * exist.  This module covers everything else: text injected later by the app,
 * strings fetched from JSON question banks, and third-party widgets.  It is
 * deliberately dependency-free and never touches English text.
 */

import { hasCjk, translate } from "./vi-core.mjs";

export const TRANSLATABLE_ATTRS = Object.freeze([
  "title",
  "alt",
  "aria-label",
  "aria-description",
  "placeholder",
  "content",
  "label",
  "summary",
]);

export const SKIP_TAGS = Object.freeze([
  "script",
  "style",
  "pre",
  "code",
  "svg",
  "textarea",
]);

export function shouldSkipNode(node) {
  const parent = node.parentElement;
  if (parent === null) {
    return true;
  }
  if (SKIP_TAGS.includes(parent.tagName.toLowerCase())) {
    return true;
  }
  if (parent.closest("[data-vi-skip]") !== null) {
    return true;
  }
  return !hasCjk(node.nodeValue);
}

export function translateNode(node, dictionary) {
  if (shouldSkipNode(node)) {
    return false;
  }
  node.nodeValue = translate(node.nodeValue, dictionary);
  return true;
}

export function translateAttributes(element, dictionary) {
  let changed = 0;
  for (const name of TRANSLATABLE_ATTRS) {
    const value = element.getAttribute(name);
    if (hasCjk(value)) {
      element.setAttribute(name, translate(value, dictionary));
      changed += 1;
    }
  }
  return changed;
}

export function translateTree(root, dictionary) {
  const walker = root.ownerDocument.createTreeWalker(root, 4);
  const nodes = [];
  while (walker.nextNode() !== null) {
    nodes.push(walker.currentNode);
  }
  let changed = 0;
  for (const node of nodes) {
    changed += translateNode(node, dictionary) ? 1 : 0;
  }
  const selector = TRANSLATABLE_ATTRS.map((name) => `[${name}]`).join(",");
  for (const element of root.querySelectorAll(selector)) {
    changed += translateAttributes(element, dictionary);
  }
  return changed;
}

export function observe(root, dictionary) {
  const Observer = root.ownerDocument.defaultView.MutationObserver;
  const observer = new Observer(() => translateTree(root, dictionary));
  observer.observe(root, {
    childList: true,
    subtree: true,
    characterData: true,
    attributes: true,
    attributeFilter: TRANSLATABLE_ATTRS,
  });
  return observer;
}

export function boot(doc, dictionary) {
  const html = doc.documentElement;
  html.lang = "vi";
  const root = doc.body || html;
  translateTree(root, dictionary);
  html.dataset.viReady = "true";
  return observe(root, dictionary);
}

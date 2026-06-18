/**
 * React 17 → React 19 compatibility shim
 * Paperbits 1.0.10 uses ReactDOM.render() which was removed in React 18+
 * This module patches ReactDOM to support the old API
 */

import ReactDOM from "react-dom";
import * as ReactDOMClient from "react-dom/client";
import React from "react";

// Store refs to root instances to allow unmounting
const rootMap = new WeakMap<Node, any>();

// Create the old ReactDOM.render API using createRoot
const renderCompat = (
  element: React.ReactElement,
  container: Element | DocumentFragment,
  callback?: () => void
): any => {
  const containerNodeType = (container as Node)?.nodeType;

  if (!container || (containerNodeType !== Node.ELEMENT_NODE && containerNodeType !== Node.DOCUMENT_FRAGMENT_NODE)) {
    console.error("ReactDOM.render: container must be a valid DOM node");
    return null;
  }

  // Check if we already have a root for this container
  let root = rootMap.get(container);
  if (!root) {
    const createRoot = ReactDOMClient.createRoot;
    if (typeof createRoot === "function") {
      root = createRoot(container);
      rootMap.set(container, root);
    } else {
      console.error("ReactDOM.createRoot not available; unable to render legacy root");
      return null;
    }
  }

  // Render and call callback when done
  if (root && typeof root.render === "function") {
    const flushSync = (ReactDOM as any).flushSync;

    // Paperbits expects refs to be populated synchronously after ReactDOM.render.
    if (typeof flushSync === "function") {
      flushSync(() => root.render(element));
    } else {
      root.render(element);
    }

    if (callback) {
      // In React 19, callback timing is different; schedule it for next microtask
      Promise.resolve().then(callback);
    }
  }

  return root;
};

// Patch ReactDOM if render doesn't exist
if (!(ReactDOM as any).render) {
  (ReactDOM as any).render = renderCompat;
}

export default ReactDOM;

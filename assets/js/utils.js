"use strict";

/**
 * Retrieves a single DOM element by CSS selector.
 * @param {string} selector - The CSS selector to query
 * @param {Element} [parent=document] - The parent element to query within. Defaults to {@link document}
 * @param {string} [messageIfNotFound="Element not found"] - Error message if element is not found. Defaults to "Element not found"
 * @returns {Element} The first element matching the selector
 * @throws {Error} If no element matching the selector is found
 */
export function getElement(selector, parent = document, messageIfNotFound = "Element not found") {
  const element = parent.querySelector(selector);
  if (!element) {
    throw new Error(messageIfNotFound);
  }
  return element;
}

/**
 * Retrieves all DOM elements matching a CSS selector.
 * @param {string} selector - The CSS selector to query
 * @param {Element} [parent=document] - The parent element to query within. Defaults to {@link document}
 * @param {string} [messageIfNotFound="Element not found"] - Error message if no elements are found. Defaults to "Element not found"
 * @returns {NodeListOf<Element>} A NodeList of all elements matching the selector
 * @throws {Error} If no elements matching the selector are found
 */
export function getElements(selector, parent = document, messageIfNotFound = "Element not found") {
  const elements = parent.querySelectorAll(selector);
  if (elements.length === 0) {
    throw new Error(messageIfNotFound);
  }
  return elements;
}

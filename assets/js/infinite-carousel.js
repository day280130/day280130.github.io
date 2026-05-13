"use strict";

import { getElement, getElements } from "./utils.js";

export default class InfiniteCarousel {
  /** @type {HTMLElement} */
  #container = undefined;
  /** @type {HTMLElement[]} */
  #items = [];
  /** @type {HTMLElement[]} */
  #paginationButtons = [];
  /** @type {number} */
  #activeItemIndex;
  /** @type {string} */
  #activeClassName;
  /** @type {string} */
  #nextClassName;
  /** @type {string} */
  #prevClassName;

  /**
   * @callback SetActiveItemIndexFunction
   * @param {number} index - The index to set as active
   * @returns {void}
   */

  /**
   * @callback IsItemCloned
   * @param {number} index - The index to navigate to
   * @returns {boolean} True if the item at the given index is a cloned item, false otherwise
   */

  /**
   * @callback CustomNavigateFunction
   * @param {number} destinationIndex - The target item index
   * @param {InfiniteCarousel} carousel - The carousel instance for accessing public methods
   * @param {SetActiveItemIndexFunction} setActiveItemIndex - Set the carousel's active item index
   * @param {IsItemCloned} isItemCloned - Check if the item at the given index is a cloned item
   * @returns {void}
   */

  /**
   * @typedef {Object} InfiniteCarouselConfig
   * @property {string} [containerSelector=".carousel"] - CSS selector for the carousel container element. Defaults to ".carousel"
   * @property {string} [itemSelector=".carousel-item"] - CSS selector for carousel item elements (must be children of container). Defaults to ".carousel-item"
   * @property {string} [activeClassName="active"] - CSS class name for the active item. Defaults to "active"
   * @property {string} [nextClassName="next"] - CSS class name for the next item. Defaults to "next"
   * @property {string} [prevClassName="prev"] - CSS class name for the previous item. Defaults to "prev"
   * @property {string} [nextButtonSelector] - CSS selector for the next button (must be child of container). If omitted, next navigation will be unavailable
   * @property {string} [prevButtonSelector] - CSS selector for the previous button (must be child of container). If omitted, previous navigation will be unavailable
   * @property {string} [paginationButtonSelector] - CSS selector for pagination buttons (must be children of container). If omitted, pagination will be unavailable
   * @property {CustomNavigateFunction} [customNavigateFunction] - Optional custom navigation callback. If provided, this function will be called instead of the default navigation
   */

  /**
   * Creates an infinite carousel instance with optional navigation and pagination controls
   * @param {InfiniteCarouselConfig} config - Carousel configuration object
   * @returns {InfiniteCarousel} The carousel instance
   */
  constructor(config) {
    this.#container = getElement(config.containerSelector ?? ".carousel", "Carousel container is required");

    this.#items = Array.from(getElements(config.itemSelector ?? ".carousel-item", "Carousel items are required"));

    this.#activeClassName = config.activeClassName ?? "active";
    this.#nextClassName = config.nextClassName ?? "next";
    this.#prevClassName = config.prevClassName ?? "prev";

    const customNavFuncParams = [this, this.#setActiveItemIndex.bind(this), this.#isItemCloned.bind(this)];

    if (config.nextButtonSelector !== undefined) {
      const nextButton = getElement(config.nextButtonSelector, "Carousel next button is not found");
      nextButton.addEventListener("click", () => {
        const nextIndex = (this.#activeItemIndex + 1) % this.#items.length;
        if (config.customNavigateFunction) {
          config.customNavigateFunction(nextIndex, ...customNavFuncParams);
        } else {
          this.navigateTo(nextIndex);
        }
      });
    }

    if (config.prevButtonSelector !== undefined) {
      const prevButton = getElement(config.prevButtonSelector ?? ".carousel-prev", "Carousel previous button is not found");
      prevButton.addEventListener("click", () => {
        const prevIndex = (this.#activeItemIndex - 1 + this.#items.length) % this.#items.length;
        if (config.customNavigateFunction) {
          config.customNavigateFunction(prevIndex, ...customNavFuncParams);
        } else {
          this.navigateTo(prevIndex);
        }
      });
    }

    // need to be wrapped in a try-catch so that initiateItems() will still run even if there is an error with pagination buttons. Moving initiateItems() before handling pagination buttons is not an option, because the logic handling pagination buttons needs the items.length state to reflect the original number of items in the carousel, and there will be cloned items added in initiateItems() if there are only 2 actual items originally. Also, if there is an error with pagination buttons initialization, we want to log the error and still allow the carousel to function without pagination.
    try {
      if (config.paginationButtonSelector !== undefined) {
        this.#paginationButtons = Array.from(getElements(config.paginationButtonSelector ?? ".carousel-pagination-button", "Carousel pagination buttons are required"));

        if (this.#paginationButtons.length !== this.#items.length) {
          throw new Error("The number of pagination buttons should be equal to the number of carousel items");
        }

        this.#paginationButtons.forEach((button, index) => {
          button.addEventListener("click", () => {
            if (config.customNavigateFunction) {
              config.customNavigateFunction(index, ...customNavFuncParams);
            } else {
              this.navigateTo(index);
            }
          });
        });
      }
    } catch (error) {
      console.error("Error initializing pagination buttons:", error);
    }

    this.#initiateItems();
  }

  /**
   * Checks if a carousel item at the given index is a cloned item
   * @type {IsItemCloned}
   * @private
   */
  #isItemCloned(index) {
    // TODO: implement a way to determine if an item is cloned
    return false;
  }

  /**
   * Sets the active item index
   * @type {SetActiveItemIndexFunction}
   * @private
   */
  #setActiveItemIndex(index) {
    if (index === this.#activeItemIndex) return;
    if (index < 0 || index >= this.#items.length) {
      throw new Error("Invalid index");
    }
    this.#activeItemIndex = index;
  }

  /**
   * Removes active, next, and prev classes from all carousel items and pagination buttons
   * @private
   */
  #clearItemsStates() {
    this.#items.forEach((item) => {
      item.classList.remove(this.#activeClassName, this.#nextClassName, this.#prevClassName);
      item.ariaCurrent = null;
    });
    this.#paginationButtons.forEach((button) => {
      button.classList.remove(this.#activeClassName);
    });
  }

  /**
   * Adds the active class to the pagination button at the specified index
   * @private
   * @param {number} index - The index of the pagination button to activate
   */
  #activatePaginationButton(index) {
    if (this.#paginationButtons[index] !== undefined) {
      this.#paginationButtons[index].classList.add(this.#activeClassName);
    }
  }

  /**
   * Initializes carousel items and sets up the initial active, next, and prev states
   * @private
   */
  #initiateItems() {
    this.#clearItemsStates();

    this.#setActiveItemIndex(0);
    this.#items[this.#activeItemIndex].classList.add(this.#activeClassName);
    this.#items[this.#activeItemIndex].ariaCurrent = "page";
    this.#activatePaginationButton(this.#activeItemIndex);

    // No need to handle next and prev items if there is only 1 item, so we can return early
    if (this.#items.length === 1) return;

    // If there are only 2 items, clone all items and append them to the end of the container and items array to create a seamless carousel effect
    if (this.#items.length === 2) {
      const clonedItem1 = this.#items[0].cloneNode(true);
      const clonedItem2 = this.#items[1].cloneNode(true);

      this.#container.appendChild(clonedItem1);
      this.#container.appendChild(clonedItem2);

      this.#items.push(clonedItem1);
      this.#items.push(clonedItem2);
    }

    // by this point we are sure that there are at least 3 items in the carousel, so we can safely set next and prev items
    const nextItemIndex = 1;
    const prevItemIndex = this.#items.length - 1;

    this.#items[nextItemIndex].classList.add(this.#nextClassName);
    this.#items[prevItemIndex].classList.add(this.#prevClassName);
  }

  /**
   * Advances the carousel to the desired item index and updates pagination state
   * @public
   * @param {number} index - The index of the item to navigate to
   */
  navigateTo(index) {
    if (this.#items.length <= 1) return;

    this.#clearItemsStates();

    // TODO: handle the case when carousel item is initially two, but then become four after getting cloned by initiateItems(), but the pagination button isn't cloned

    this.#setActiveItemIndex(index);
    const nextItemIndex = (index + 1) % this.#items.length;
    const prevItemIndex = (index - 1 + this.#items.length) % this.#items.length;

    this.#items[this.#activeItemIndex].classList.add(this.#activeClassName);
    this.#items[nextItemIndex].classList.add(this.#nextClassName);
    this.#items[prevItemIndex].classList.add(this.#prevClassName);

    this.#items[this.#activeItemIndex].ariaCurrent = "page";

    this.#activatePaginationButton(this.#activeItemIndex);
  }

  /**
   * Gets the index of the currently active carousel item
   * @public
   * @returns {number} The index of the active item
   */
  getActiveItemIndex() {
    return this.#activeItemIndex;
  }

  /**
   * Gets all carousel items
   * @public
   * @returns {HTMLElement[]} Copy of array of carousel item elements
   */
  getItems() {
    // prevents external code from accidentally modifying the internal state of the carousel.
    return [...this.#items];
  }

  /**
   * Gets all pagination buttons
   * @public
   * @returns {HTMLElement[]} Copy of array of pagination button elements
   */
  getPaginationButtons() {
    // prevents external code from accidentally modifying the internal state of the carousel.
    return [...this.#paginationButtons];
  }
}

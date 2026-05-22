"use strict";

import { getElement, getElements } from "./utils.js";

/**
 * @callback CustomNavigateFunction
 * @param {number} destinationIndex - The target item index
 * @param {InfiniteCarousel} carousel - The carousel instance for accessing public methods
 * @returns {void}
 */

/**
 * @typedef {Object} InfiniteCarouselConfig
 * @property {string} [containerSelector=".carousel"] - CSS selector for the carousel container element. Defaults to ".carousel"
 * @property {string} [itemsContainerSelector=".carousel-items"] - CSS selector for the container holding carousel items. Defaults to ".carousel-items"
 * @property {string} [itemSelector=".carousel-item"] - CSS selector for carousel item elements (must be children of itemsContainer). Defaults to ".carousel-item"
 * @property {string} [activeClassName="active"] - CSS class name for the active item. Defaults to "active"
 * @property {string} [nextClassName="next"] - CSS class name for the next item. Defaults to "next"
 * @property {string} [prevClassName="prev"] - CSS class name for the previous item. Defaults to "prev"
 * @property {string} [nextButtonSelector] - CSS selector for the next button (must be child of container). If omitted, next navigation will be unavailable
 * @property {string} [prevButtonSelector] - CSS selector for the previous button (must be child of container). If omitted, previous navigation will be unavailable
 * @property {string} [paginationButtonSelector] - CSS selector for pagination buttons (must be children of container). If omitted, pagination will be unavailable
 * @property {CustomNavigateFunction} [customNavigateFunction] - Optional custom navigation callback. If provided, this function will be called instead of the default navigation
 */

/**
 * @typedef {Object} ItemStateTargets
 * @property {number} [activeItemIndex] - Index of targeted active item
 * @property {number} [nextItemIndex] - Index of targeted next item
 * @property {number} [prevItemIndex] - Index of targeted previous item
 */

export default class InfiniteCarousel {
  /** @type {HTMLElement} */
  #container;
  /** @type {HTMLElement} */
  #itemsContainer;
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
   * Creates an infinite carousel instance with optional navigation and pagination controls
   * @param {InfiniteCarouselConfig} config - Carousel configuration object
   * @returns {InfiniteCarousel} The carousel instance
   */
  constructor(config) {
    this.#container = getElement(config.containerSelector ?? ".carousel", undefined, "Carousel container is required");

    this.#itemsContainer = getElement(config.itemsContainerSelector ?? ".carousel-items", this.#container, "Carousel items container is required");

    this.#items = Array.from(getElements(config.itemSelector ?? ".carousel-item", this.#itemsContainer, "Carousel items are required"));

    this.#activeClassName = config.activeClassName ?? "active";
    this.#nextClassName = config.nextClassName ?? "next";
    this.#prevClassName = config.prevClassName ?? "prev";

    this.#initiateWheelListener(config);

    this.#initiateSwipeListener(config);

    this.#initiateControlButtons(config);

    // need to be wrapped in a try-catch so that initiateItems() will still run even if there is an error while initializing pagination buttons. Moving initiateItems() before handling pagination buttons is not an option, because the logic handling pagination buttons needs the items.length state to reflect the original number of items in the carousel, and there will be cloned items added in initiateItems() if there are only 2 actual items originally. Also, if there is an error with pagination buttons initialization, we want to log the error and still allow the carousel to function without pagination.
    try {
      this.#initiatePaginationButtons(config);
    } catch (error) {
      console.error("Error initializing pagination buttons:", error);
    }

    this.#initiateItems();
  }

  /**
   * Checks if the given index is valid for the current carousel
   * @public
   * @param {number} index - The index to check
   * @returns {boolean} - True if the index is valid, false otherwise
   */
  isIndexValid(index) {
    return index >= 0 && index < this.#items.length;
  }

  /**
   * Gets the index of the next item relative to the given index
   * @public
   * @param {number} index - The reference index to find the next item from
   * @returns {number} The index of the next item
   * @throws {Error} Will throw an error if the index provided is not valid to the carousel
   */
  getNextItemIndex(index) {
    if (!this.isIndexValid(index)) throw new Error("Invalid index");
    return (index + 1) % this.#items.length;
  }

  /**
   * Gets the index of the previous item relative to the given index
   * @public
   * @param {number} index - The reference index to find the previous item from
   * @returns {number} The index of the previous item
   * @throws {Error} Will throw an error if the index provided is not valid to the carousel
   */
  getPreviousItemIndex(index) {
    if (!this.isIndexValid(index)) throw new Error("Invalid index");
    return (index - 1 + this.#items.length) % this.#items.length;
  }

  /**
   * Checks if a carousel item at the given index is a cloned item
   * @public
   * @param {number} index - The index to navigate to
   * @returns {boolean} True if the item at the given index is a cloned item, false otherwise
   */
  isItemCloned(index) {
    // The only case of items being cloned
    if (this.#items.length === 4 && this.#paginationButtons.length === 2) {
      // if item's index is 2 or 3, then it's a cloned item
      return index >= this.#paginationButtons.length;
    }

    return false;
  }

  /**
   * Sets the carousel's active, next, and previous items
   * @public
   * @param {ItemStateTargets} stateTarget - The index to set as active
   * @returns {void}
   * @throws {Error} Will throw an error if the index provided is not valid
   */
  setItemsStates({ activeItemIndex, nextItemIndex, prevItemIndex }) {
    if (activeItemIndex !== undefined) {
      if (!this.isIndexValid(activeItemIndex)) {
        throw new Error("Invalid active item index target");
      }
      this.#activeItemIndex = activeItemIndex;
      this.#items[activeItemIndex].classList.add(this.#activeClassName);
      this.#items[this.#activeItemIndex].ariaCurrent = "page";
    }

    if (nextItemIndex !== undefined) {
      if (!this.isIndexValid(nextItemIndex)) {
        throw new Error("Invalid next item index target");
      }
      this.#items[nextItemIndex].classList.add(this.#nextClassName);
    }

    if (prevItemIndex !== undefined) {
      if (!this.isIndexValid(prevItemIndex)) {
        throw new Error("Invalid prev item index target");
      }
      this.#items[prevItemIndex].classList.add(this.#prevClassName);
    }
  }

  /**
   * Removes active, next, and previous classNames and aria description from all carousel items and pagination buttons
   * @public
   * @returns {void}
   */
  clearItemsAndButtonsStates() {
    this.#items.forEach((item) => {
      item.classList.remove(this.#activeClassName, this.#nextClassName, this.#prevClassName);
      item.ariaCurrent = null;
    });
    this.#paginationButtons.forEach((button) => {
      button.classList.remove(this.#activeClassName);
      button.ariaCurrent = null;
    });
  }

  /**
   * Adds the active class to the pagination button at the specified index
   * @public
   * @param {number} index - The index of the pagination button to activate
   * @returns {void}
   */
  setActivePaginationButton(index) {
    if (this.#paginationButtons[index] !== undefined) {
      this.#paginationButtons[index].classList.add(this.#activeClassName);
      this.#paginationButtons[index].ariaCurrent = "page";
    }
  }

  /**
   * Advances the carousel to the desired item index and updates pagination state
   * @public
   * @param {number} destinationIndex - The index of the item to navigate to
   * @returns {void}
   */
  navigateTo(destinationIndex) {
    if (!this.isIndexValid(destinationIndex)) {
      console.error("Invalid index");
      return;
    }

    // No need to navigate or update states if there is only 1 item
    if (this.#items.length <= 1) return;

    // No need to navigate or update states if the destination index is the same as the current active index
    if (destinationIndex === this.#activeItemIndex) return;

    this.clearItemsAndButtonsStates();

    const nextItemIndex = this.getNextItemIndex(destinationIndex);
    const prevItemIndex = this.getPreviousItemIndex(destinationIndex);

    this.setItemsStates({
      activeItemIndex: destinationIndex,
      nextItemIndex: nextItemIndex,
      prevItemIndex: prevItemIndex,
    });

    if (this.isItemCloned(destinationIndex)) {
      // activate the corresponding pagination button for the cloned item
      this.setActivePaginationButton(destinationIndex % this.#paginationButtons.length);
    } else {
      this.setActivePaginationButton(destinationIndex);
    }
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

  /**
   * Attach event listeners to handle mouse wheel interactions for the carousel
   * @private
   * @param {InfiniteCarouselConfig} config - Carousel configuration object
   * @returns {void}
   */
  #initiateWheelListener({ customNavigateFunction }) {
    this.#container.addEventListener("wheel", (event) => {
      let targetIndex = -1;
      // some browsers still modify deltaY instead of deltaX when user use mouse wheel while holding shift key
      if (event.deltaX > 0 || (event.deltaY > 0 && event.shiftKey)) {
        targetIndex = this.getNextItemIndex(this.#activeItemIndex);
      } else if (event.deltaX < 0 || (event.deltaY < 0 && event.shiftKey)) {
        targetIndex = this.getPreviousItemIndex(this.#activeItemIndex);
      } else {
        // to prevent navigation fires when scrolling vertically while cursor is on the carousel
        return;
      }

      if (customNavigateFunction !== undefined) {
        customNavigateFunction(targetIndex, this);
      } else {
        this.navigateTo(targetIndex);
      }
    });
  }

  /**
   * Attach event listeners to handle swipe interactions for the carousel
   * @private
   * @param {InfiniteCarouselConfig} config - Carousel configuration object
   * @returns {void}
   */
  #initiateSwipeListener({ customNavigateFunction }) {
    let touchStartX = 0;
    let touchStartY = 0;

    /** minimum distance in pixels for a swipe to be registered */
    const deltaThreshold = 50;

    this.#container.addEventListener("touchstart", (event) => {
      touchStartX = event.changedTouches[0].clientX;
      touchStartY = event.changedTouches[0].clientY;
    });

    this.#container.addEventListener("touchmove", (event) => {
      const deltaX = event.changedTouches[0].clientX - touchStartX;
      const deltaY = event.changedTouches[0].clientY - touchStartY;

      // to prevent triggering carousel navigation when user is scrolling relatively vertical on the carousel
      if (Math.abs(deltaY) > Math.abs(deltaX)) return;

      // to prevent triggering some browser's default swipe url navigation when user is swiping on the carousel
      event.preventDefault();

      let targetIndex = -1;
      if (deltaX < -deltaThreshold) {
        // swiped left
        targetIndex = this.getNextItemIndex(this.#activeItemIndex);
      } else if (deltaX > deltaThreshold) {
        // swiped right
        targetIndex = this.getPreviousItemIndex(this.#activeItemIndex);
      }

      // to prevent navigation fires before swipe distance threshold is reached
      if (targetIndex === -1) return;

      if (customNavigateFunction !== undefined) {
        customNavigateFunction(targetIndex, this);
      } else {
        this.navigateTo(targetIndex);
      }
    });
  }

  /**
   * Query and attach event listeners to next and prev buttons
   * @private
   * @param {InfiniteCarouselConfig} config - Carousel configuration object
   */
  #initiateControlButtons({ nextButtonSelector, prevButtonSelector, customNavigateFunction }) {
    if (this.#items.length === 1) return;

    if (nextButtonSelector !== undefined) {
      const nextButton = getElement(nextButtonSelector, this.#container, "Carousel next button is not found");
      nextButton.addEventListener("click", () => {
        const nextIndex = this.getNextItemIndex(this.#activeItemIndex);
        if (customNavigateFunction !== undefined) {
          customNavigateFunction(nextIndex, this);
        } else {
          this.navigateTo(nextIndex);
        }
      });
    }

    if (prevButtonSelector !== undefined) {
      const prevButton = getElement(prevButtonSelector, this.#container, "Carousel previous button is not found");
      prevButton.addEventListener("click", () => {
        const prevIndex = this.getPreviousItemIndex(this.#activeItemIndex);
        if (customNavigateFunction !== undefined) {
          customNavigateFunction(prevIndex, this);
        } else {
          this.navigateTo(prevIndex);
        }
      });
    }
  }

  /**
   * Query and attach event listeners to pagination buttons
   * @private
   * @param {InfiniteCarouselConfig} config - Carousel configuration object
   * @throws {Error} Will throw an error if the amount of initial items and pagination buttons is not the same
   */
  #initiatePaginationButtons({ paginationButtonSelector, customNavigateFunction }) {
    if (this.#items.length === 1) return;

    if (paginationButtonSelector !== undefined) {
      this.#paginationButtons = Array.from(getElements(paginationButtonSelector, this.#container, "Carousel pagination buttons are required"));

      if (this.#paginationButtons.length !== this.#items.length) {
        throw new Error("The number of pagination buttons should be equal to the number of carousel items");
      }

      // in case of only 2 items, inactive pagination buttons acts like prev (for first button) and next (for second button) buttons
      if (this.#items.length === 2) {
        this.#paginationButtons[0].addEventListener("click", (event) => {
          /** @type {number} */
          let destinationIndex;

          /** @type {HTMLElement} */
          const currentButton = event.currentTarget;
          if (currentButton.classList.contains(this.#activeClassName)) {
            destinationIndex = this.#activeItemIndex;
          } else {
            destinationIndex = this.getPreviousItemIndex(this.#activeItemIndex);
          }

          if (customNavigateFunction !== undefined) {
            customNavigateFunction(destinationIndex, this);
          } else {
            this.navigateTo(destinationIndex);
          }
        });

        this.#paginationButtons[1].addEventListener("click", (event) => {
          /** @type {number} */
          let destinationIndex;

          /** @type {HTMLElement} */
          const currentButton = event.currentTarget;
          if (currentButton.classList.contains(this.#activeClassName)) {
            destinationIndex = this.#activeItemIndex;
          } else {
            destinationIndex = this.getNextItemIndex(this.#activeItemIndex);
          }

          if (customNavigateFunction !== undefined) {
            customNavigateFunction(destinationIndex, this);
          } else {
            this.navigateTo(destinationIndex);
          }
        });

        return;
      }

      this.#paginationButtons.forEach((button, index) => {
        button.addEventListener("click", () => {
          if (customNavigateFunction !== undefined) {
            customNavigateFunction(index, this);
          } else {
            this.navigateTo(index);
          }
        });
      });
    }
  }

  /**
   * Initializes carousel items and sets up the initial active, next, and prev states
   * @private
   */
  #initiateItems() {
    this.clearItemsAndButtonsStates();

    this.setItemsStates({ activeItemIndex: 0 });
    this.setActivePaginationButton(this.#activeItemIndex);

    // No need to handle next and prev items if there is only 1 item, so we can return early
    if (this.#items.length === 1) return;

    // If there are only 2 items, clone all items and append them to the end of the container and items array to create a seamless carousel effect
    if (this.#items.length === 2) {
      // making sure original items will be cloned with clean states
      this.clearItemsAndButtonsStates();

      const clonedItem1 = this.#items[0].cloneNode(true);
      const clonedItem2 = this.#items[1].cloneNode(true);

      this.#itemsContainer.appendChild(clonedItem1);
      this.#itemsContainer.appendChild(clonedItem2);

      this.#items.push(clonedItem1);
      this.#items.push(clonedItem2);

      // reapply active item state previously set
      this.setItemsStates({ activeItemIndex: 0 });
      this.setActivePaginationButton(this.#activeItemIndex);
    }

    // by this point we are sure that there are at least 3 items in the carousel, so we can safely set next and prev items
    const nextItemIndex = this.getNextItemIndex(this.#activeItemIndex);
    const prevItemIndex = this.getPreviousItemIndex(this.#activeItemIndex);

    this.setItemsStates({ nextItemIndex: nextItemIndex, prevItemIndex: prevItemIndex });
  }
}

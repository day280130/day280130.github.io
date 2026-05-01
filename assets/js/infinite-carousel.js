"use strict";

export default class InfiniteCarousel {
  /** @type {HTMLElement} */
  #container = undefined;
  /** @type {HTMLElement[]} */
  #items = [];
  /** @type {number} */
  #activeItemIndex = 0;
  /** @type {number} */
  #nextItemIndex = 0;
  /** @type {number} */
  #prevItemIndex = 0;

  /**
   * @typedef {Object} InfiniteCarouselConfig
   * @property {string} containerSelector - Optional, CSS selector for the infinite carousel container element. Uses ".carousel" as default value.
   * @property {string} itemSelector - Optional, CSS selector for the item elements. Item elements HAVE to be childs of the container. Uses ".carousel-item" as default value.
   * @property {string} nextButtonSelector - Optional, CSS selector for the next button. Next button element HAVE to be child of the container. Uses ".carousel-next" as default value.
   * @property {string} prevButtonSelector - Optional, CSS selector for the previous button. Previous button element HAVE to be child of the container. Uses ".carousel-prev" as default value.
   * @param {InfiniteCarouselConfig} config - constructor configuration
   * @returns {InfiniteCarousel} - infinite carousel instance
   */
  constructor(config) {
    this.#container = document.querySelector(config.containerSelector ?? ".carousel");
    if (this.#container === null) throw new Error("Carousel container is required");

    this.#items = Array.from(this.#container.querySelectorAll(config.itemSelector ?? ".carousel-item"));
    if (this.#items.length === 0) throw new Error("Carousel items are required");

    const nextButton = this.#container.querySelector(config.nextButtonSelector ?? ".carousel-next");
    if (nextButton === null) throw new Error("Carousel next button is required");
    nextButton.addEventListener("click", () => this.handleNext());

    const prevButton = this.#container.querySelector(config.prevButtonSelector ?? ".carousel-prev");
    if (prevButton === null) throw new Error("Carousel previous button is required");
    prevButton.addEventListener("click", () => this.handlePrev());

    this.#initiateItems();
  }

  #clearItemsClasses() {
    this.#items.forEach((item) => {
      item.classList.remove("active", "next", "prev");
    });
  }

  #initiateItems() {
    this.#clearItemsClasses();

    this.#items[0].classList.add("active");
    this.#activeItemIndex = 0;

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
    this.#items[1].classList.add("next");
    this.#nextItemIndex = 1;
    this.#items[this.#items.length - 1].classList.add("prev");
    this.#prevItemIndex = this.#items.length - 1;
  }

  handleNext() {
    if (this.#items.length <= 1) return;

    this.#clearItemsClasses();

    this.#prevItemIndex = this.#activeItemIndex;
    this.#activeItemIndex = this.#nextItemIndex;
    this.#nextItemIndex = (this.#nextItemIndex + 1) % this.#items.length;

    this.#items[this.#prevItemIndex].classList.add("prev");
    this.#items[this.#activeItemIndex].classList.add("active");
    this.#items[this.#nextItemIndex].classList.add("next");
  }

  handlePrev() {
    if (this.#items.length <= 1) return;

    this.#clearItemsClasses();

    this.#nextItemIndex = this.#activeItemIndex;
    this.#activeItemIndex = this.#prevItemIndex;
    this.#prevItemIndex = (this.#prevItemIndex - 1 + this.#items.length) % this.#items.length;

    this.#items[this.#nextItemIndex].classList.add("next");
    this.#items[this.#activeItemIndex].classList.add("active");
    this.#items[this.#prevItemIndex].classList.add("prev");
  }
}

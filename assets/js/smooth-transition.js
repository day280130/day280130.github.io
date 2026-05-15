"use strict";

import { getElement } from "./utils.js";

/**
 * @typedef {Object} TransitionConfig
 * @property {number} [transitionDuration=300] - Duration of carousel transition in ms
 * @property {string} [transitionFunction="linear"] - Transition function used by carousel. Will be changed to linear during the smooth transition, and then changed back to this configuration afterward
 * @property {string} [containerSelector=".carousel"] - CSS selector for the carousel container element. Defaults to ".carousel"
 */

/**
 * @callback SmoothTransitionFactory
 * @param {TransitionConfig} config - function configuration
 * @returns {import("./infinite-carousel.js").CustomNavigateFunction}
 */

/**
 * @typedef {"right" | "left"} TransitionDirection
 */

/**
 * A factory to produce smooth transition function for infinite carousel
 * @type {SmoothTransitionFactory}
 */
export const smoothTransitionFactory = ({ transitionDuration = 300, transitionFunction = "linear", containerSelector = ".carousel" }) => {
  /** @type {HTMLElement} */
  const carouselContainer = getElement(containerSelector, undefined, "Carousel container is not found");

  /**
   * Set the carousel's "--transition-duration" CSS variable
   * @type {(duration: number) => void}
   */
  const setTransitionDuration = (duration) => carouselContainer.style.setProperty("--transition-duration", `${duration}ms`);

  /**
   * Set the carousel's "--transition-duration" CSS variable
   * @type {(funct: string) => void}
   */
  const setTransitionFunction = (func) => carouselContainer.style.setProperty("--transition-function", func);

  /**
   * Get the index of the item that will be transitioned into in the next compound transition
   * @param {number} currentActiveIndex Currently active item's index
   * @param {number} itemsCount The total number of items in the carousel
   * @param {TransitionDirection} direction Direction of the transition chosen
   * @returns {number}
   */
  const getNextIndex = (currentActiveIndex, itemsCount, direction) => {
    if (direction === "right") {
      return (currentActiveIndex + 1) % itemsCount;
    }
    return (currentActiveIndex - 1 + itemsCount) % itemsCount;
  };

  // set the carousel's default transition duration and function according to configuration
  setTransitionDuration(transitionDuration);
  setTransitionFunction(transitionFunction);

  let transitionIsOngoing = false;

  return (destIndex, carousel) => {
    // prevents navigating when another transition is currently happening
    if (transitionIsOngoing) return;

    transitionIsOngoing = true;

    const itemsCount = carousel.getItems().length;
    const initialActiveIndex = carousel.getActiveItemIndex();

    const distanceRight = (destIndex + itemsCount - initialActiveIndex) % itemsCount;
    console.log("distanceRight: ", distanceRight);

    const distanceLeft = (initialActiveIndex - destIndex + itemsCount) % itemsCount;
    console.log("distanceLeft: ", distanceLeft);

    const distance = Math.min(distanceRight, distanceLeft);

    // just use default navigation if only transitioning to next/prev item
    if (distance <= 1) {
      carousel.navigateTo(destIndex);
      setTimeout(() => {
        transitionIsOngoing = false;
      }, transitionDuration + 5);
      return;
    }

    /**
     * Prioritizes right direction because it will feel more natural
     * @type {TransitionDirection}
     */
    const transitionDirection = distanceRight <= distanceLeft ? "right" : "left";

    /**
     * duration for individual transition. Set to be 100ms minimum to prevent each transition going too fast
     */
    const compoundTransitionDuration = Math.max(100, Math.ceil(transitionDuration / distance));

    // reduce carousel's transition duration temporarily to prevent the total compound transition for going too long
    setTransitionDuration(compoundTransitionDuration);

    // changed transition function to linear for smoother experience (needs improvement)
    setTransitionFunction("linear");

    for (let index = 0; index < distance; index++) {
      setTimeout(
        () => {
          carousel.navigateTo(getNextIndex(carousel.getActiveItemIndex(), itemsCount, transitionDirection));
        },
        // adding 5ms to make sure the transition duration and function change already applied before begining compound transition
        index * compoundTransitionDuration + 5,
      );
    }

    setTimeout(
      () => {
        // reset transition duration and function
        setTransitionDuration(transitionDuration);
        setTransitionFunction(transitionFunction);
        transitionIsOngoing = false;
      },
      // adding 10ms to make sure the last compound transition already finished
      compoundTransitionDuration * distance + 10,
    );
  };
};

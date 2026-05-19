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

    const distanceLeft = (initialActiveIndex - destIndex + itemsCount) % itemsCount;

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
     * The way this smooth transition works is by turning it into compound transition, and then transitioning
     * the slide one by one until the destination is reached. The first transition's function is turned into
     * ease-in, and from the second on is turned into linear, until the last transition is turned into ease-out,
     * simulating an ease-in-out transition function for the compound transition
     */

    /**
     * duration for ease transitions. Set to be 200ms minimum to prevent each transition from going too fast
     */
    const easeTransitionDuration = Math.max(200, Math.ceil(transitionDuration / 2));

    /**
     * duration for linear transitions. Set to be 150ms minimum to prevent each transition from going too fast
     */
    const linearTransitionDuration = Math.max(150, Math.ceil(transitionDuration / 3));

    // combined ease-in, linear, and ease-out functions for smoother experience
    for (let index = 0; index < distance; index++) {
      /** @type {string} */
      let currentTransitionFunction;
      /** @type {number} */
      let currentTransitionDuration;
      /** @type {number} */
      let currentTransitionDelay;
      if (index === 0) {
        currentTransitionFunction = "ease-in";
        currentTransitionDuration = easeTransitionDuration;
        currentTransitionDelay = 0;
      } else if (index < distance - 1) {
        currentTransitionFunction = "linear";
        currentTransitionDuration = linearTransitionDuration;
        currentTransitionDelay = easeTransitionDuration + (index - 1) * linearTransitionDuration;
      } else {
        currentTransitionFunction = "ease-out";
        currentTransitionDuration = easeTransitionDuration;
        currentTransitionDelay = easeTransitionDuration + (index - 1) * linearTransitionDuration;
      }
      setTimeout(() => {
        setTransitionFunction(currentTransitionFunction);
        setTransitionDuration(currentTransitionDuration);
        carousel.navigateTo(getNextIndex(carousel.getActiveItemIndex(), itemsCount, transitionDirection));
      }, currentTransitionDelay);
    }

    setTimeout(
      () => {
        // reset transition duration and function
        setTransitionDuration(transitionDuration);
        setTransitionFunction(transitionFunction);
        transitionIsOngoing = false;
      },
      // adding 10ms to make sure the last compound transition already finished
      easeTransitionDuration * 2 + (distance - 2) * linearTransitionDuration,
    );
  };
};

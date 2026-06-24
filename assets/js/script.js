import InfiniteCarousel from "./infinite-carousel.js";
import { smoothTransitionFactory } from "./smooth-transition.js";
import { getElement, getElements } from "./utils.js";

// Sidebar
const sidebar = document.querySelector("aside");
if (sidebar !== null) {
  const sidebarToggles = document.querySelectorAll(".sidebar-toggle");
  sidebarToggles.forEach((sidebarToggle) => {
    // attach sidebar state handler
    sidebarToggle.addEventListener("click", () => {
      const currentState = sidebar.dataset.show;
      const nextState = currentState === "true" ? false : true;
      sidebar.setAttribute("data-show", nextState);
    });
  });
  // handle clicking outside aside element
  window.addEventListener("click", (mv) => {
    const isSidebarOpen = sidebar.dataset.show === "true";
    const isSidebar = sidebar.contains(mv.target);
    // omitting sidebar trigger click here since it will be handled by its own click event listener
    // and not omitting it result in sidebar close immediately after open when clicking the trigger
    let isSidebarToggle = false;
    sidebarToggles.forEach((sidebarToggle) => {
      if (sidebarToggle.contains(mv.target)) {
        isSidebarToggle = true;
      }
    });
    if (isSidebarOpen && !isSidebar && !isSidebarToggle) {
      sidebar.setAttribute("data-show", false);
    }
  });
}

// Dropdown
const dropdowns = document.querySelectorAll(".dropdown");
dropdowns.forEach((dropdown) => {
  // attach dropdown state handler
  const dropdownTrigger = dropdown.querySelector(".dropdown-trigger");
  const dropdownContainer = dropdown.querySelector(".dropdown-container");
  dropdownTrigger.addEventListener("click", () => {
    const currentState = dropdown.dataset.open;
    const nextState = currentState === "true" ? false : true;
    dropdown.setAttribute("data-open", nextState);
    // remove prevent-animation helper after dropdown opened for the first time
    if (dropdownContainer.classList.contains("prevent-animation")) {
      dropdownContainer.classList.remove("prevent-animation");
    }
  });
  // handle clicking outside dropdown container
  window.addEventListener("click", (mv) => {
    const isDropdownOpen = dropdown.dataset.open === "true";
    const isDropdownContainer = dropdownContainer.contains(mv.target);
    // omitting dropdown trigger click here since it will be handled by its own click event listener
    // and not omitting it result in dropdown close immediately after open when clicking the trigger
    const isDropdownTrigger = dropdownTrigger.contains(mv.target);
    if (isDropdownOpen && !isDropdownContainer && !isDropdownTrigger) {
      dropdown.setAttribute("data-open", false);
    }
  });
});

// Theme Switcher
// browser theme preference watcher
const preferDarkMql = window.matchMedia("(prefers-color-scheme: dark)");

// theme state dispatchers
const setThemeDark = () => {
  localStorage.setItem("theme", "dark");
  document.documentElement.setAttribute("data-theme", "dark");
};
const setThemeLight = () => {
  localStorage.setItem("theme", "light");
  document.documentElement.setAttribute("data-theme", "light");
};
const setThemeSystem = () => {
  localStorage.setItem("theme", "system");
  if (preferDarkMql.matches) {
    document.documentElement.setAttribute("data-theme", "dark");
  } else {
    document.documentElement.setAttribute("data-theme", "light");
  }
};

// attach state dispatcher to theme setting buttons
getElement("button.theme-dark", undefined, "dark theme button not found").addEventListener("click", setThemeDark);
getElement("button.theme-light", undefined, "light theme button not found").addEventListener("click", setThemeLight);
getElement("button.theme-system", undefined, "system theme button not found").addEventListener("click", setThemeSystem);

// handle browser theme preference changes
preferDarkMql.addEventListener("change", () => {
  // ignore if page theme not following browser/os theme preference
  if (localStorage.getItem("theme") !== "system") return;
  if (preferDarkMql.matches) {
    document.documentElement.setAttribute("data-theme", "dark");
  } else {
    document.documentElement.setAttribute("data-theme", "light");
  }
});

// Carousel
// generate page buttons for the carousel
const carouselPages = getElements(".carousel-item", undefined, "carousel items not found");

const carouselPageButtonsContainer = getElement(".carousel-page-dots", undefined, "carousel page buttons container not found");

/** @type {HTMLTemplateElement} */
const carouselPageButtonTemplate = getElement("#carousel-page-dot-template", undefined, "carousel page button template not found");

carouselPages.forEach((carouselPage, pageIndex) => {
  /** @type {HTMLLIElement} */
  const pageButtonListItem = carouselPageButtonTemplate.content.cloneNode(true);

  /** @type {HTMLButtonElement} */
  const pageButton = getElement(".carousel-page-dot", pageButtonListItem, `carousel page button template for page ${pageIndex} element not found`);
  const ariaLabel = (pageButton.ariaLabel ?? "") + ` ${pageIndex + 1}`;
  pageButton.setAttribute("aria-label", ariaLabel);
  if (pageIndex === 0) {
    pageButton.ariaCurrent = "page";
  }

  /** @type {HTMLSpanElement} */
  const srLabelSpan = getElement(".sr-only", pageButton, `carousel page button template for page ${pageIndex} sr label not found`);
  const srLabel = srLabelSpan.textContent + ` ${pageIndex + 1}`;
  srLabelSpan.textContent = srLabel;

  carouselPageButtonsContainer.appendChild(pageButtonListItem);
});

// generate smooth transition function for the carousel
const smoothTransition = smoothTransitionFactory({
  containerSelector: ".carousel-container",
  transitionDuration: 300,
  transitionFunction: "ease-in-out",
});

// register the carousel
const projectCarousel = new InfiniteCarousel({
  containerSelector: ".carousel-container",
  itemsContainerSelector: ".carousel-items",
  itemSelector: ".carousel-item",
  activeClassName: "active",
  nextClassName: "next",
  prevClassName: "prev",
  nextButtonSelector: ".carousel-next",
  prevButtonSelector: ".carousel-prev",
  paginationButtonSelector: ".carousel-page-dot",
  customNavigateFunction: smoothTransition,
  // custom click handler to make carousel item unclickable if not active
  customItemClickFunction: (_, carouselItemIndex, clickEvent, carousel) => {
    if (carouselItemIndex !== carousel.getActiveItemIndex()) clickEvent.preventDefault();
  },
});

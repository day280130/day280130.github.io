// Sidebar
const button = document.querySelector(".sidebar-toggle");
const asideElement = document.querySelector("aside");
button.addEventListener("click", () => {
  const currentState = asideElement.dataset.show;
  const nextState = currentState === "true" ? false : true;
  asideElement.setAttribute("data-show", nextState);
});

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
// get initial browser theme setting
const mql = window.matchMedia("(prefers-color-scheme: dark)");
const initialSystemTheme = mql.matches ? "dark" : "light";
// get theme state if already saved before
const initialTheme = localStorage.getItem("theme");
// set initial theme state
const body = document.querySelector("body");
if (initialTheme === "dark") {
  body.setAttribute("data-theme", "dark");
} else if (initialTheme === "light") {
  body.setAttribute("data-theme", "light");
} else {
  if (initialSystemTheme === "dark") {
    body.setAttribute("data-theme", "dark");
  } else {
    body.setAttribute("data-theme", "light");
  }
}
// theme state dispatchers
const setThemeDark = () => {
  localStorage.setItem("theme", "dark");
  body.setAttribute("data-theme", "dark");
};
const setThemeLight = () => {
  localStorage.setItem("theme", "light");
  body.setAttribute("data-theme", "light");
};
const setThemeSystem = () => {
  localStorage.setItem("theme", "system");
  if (mql.matches) {
    body.setAttribute("data-theme", "dark");
  } else {
    body.setAttribute("data-theme", "light");
  }
};
// handle theme state switching via browser setting
mql.onchange = () => {
  // ignore if page theme not following browser/os theme
  if (localStorage.getItem("theme") !== "system") return;
  if (mql.matches) {
    body.setAttribute("data-theme", "dark");
  } else {
    body.setAttribute("data-theme", "light");
  }
};

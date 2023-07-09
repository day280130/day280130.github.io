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
dropdowns.forEach((e) => {
  const button = e.querySelector("button");
  button.addEventListener("click", () => {
    const currentState = e.dataset.open;
    const nextState = currentState === "true" ? false : true;
    e.setAttribute("data-open", nextState);
  });
  const container = e.querySelector("div");
  document.addEventListener("DOMContentLoaded", () => {
    setTimeout(() => {
      container.classList.remove("prevent-animation");
    }, 300);
  });
  window.addEventListener("click", (mv) => {
    const openState = e.dataset.open;
    if (openState === "true" && !e.contains(mv.target)) e.setAttribute("data-open", false);
  });
});

// Theme Switcher
const mql = window.matchMedia("(prefers-color-scheme: dark)");
const body = document.querySelector("body");
const initialTheme = localStorage.getItem("theme");
const initialSystemTheme = mql.matches ? "dark" : "light";
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
const setDark = () => {
  localStorage.setItem("theme", "dark");
  body.setAttribute("data-theme", "dark");
};
const setLight = () => {
  localStorage.setItem("theme", "light");
  body.setAttribute("data-theme", "light");
};
const setSystem = () => {
  localStorage.setItem("theme", "system");
  if (mql.matches) {
    body.setAttribute("data-theme", "dark");
  } else {
    body.setAttribute("data-theme", "light");
  }
};
mql.onchange = () => {
  if (localStorage.getItem("theme") !== "system") return;
  if (mql.matches) {
    body.setAttribute("data-theme", "dark");
  } else {
    body.setAttribute("data-theme", "light");
  }
};

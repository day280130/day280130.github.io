// Image URL
const imgUrl = "./assets/img";

// Applying imgUrl
const imgElements = document.querySelectorAll("img");
imgElements.forEach((imgElement) => {
  imgElement.src = `${imgUrl}/${imgElement.dataset.imgName}`;
});

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

// Render Cards
const renderCards = (card, parent) =>
  (parent.innerHTML += `
    <a href="${card.link}" target="_blank" style="--shadow: ${card.shadow}">
      <img src="${imgUrl}/${card.id}.png" alt="java icon" />
      ${card.name}
    </a>
  `);
const languages = [
  {
    id: "html",
    name: "HTML",
    link: "https://html.com/",
    shadow: "28 100% 64%",
  },
  {
    id: "css",
    name: "CSS",
    link: "https://developer.mozilla.org/en-US/docs/Web/CSS",
    shadow: "200 100% 55%",
  },
  {
    id: "js",
    name: "Javascript",
    link: "https://developer.mozilla.org/en-US/docs/Web/JavaScript",
    shadow: "53 100% 55%",
  },
  {
    id: "ts",
    name: "Typescript",
    link: "https://www.typescriptlang.org/",
    shadow: "204 69% 42%",
  },
  {
    id: "php",
    name: "PHP",
    link: "https://www.php.net/docs.php",
    shadow: "236 13% 55%",
  },
  {
    id: "java",
    name: "Java",
    link: "https://docs.oracle.com/en/java/",
    shadow: "202 59% 35%",
  },
];
const languagesDiv = document.getElementById("languages-container");
languages.forEach((language) => renderCards(language, languagesDiv));
const frameworks = [
  {
    id: "react",
    name: "ReactJS",
    link: "https://react.dev/",
    shadow: "184 100% 50%",
  },
  {
    id: "express",
    name: "ExpressJS",
    link: "https://expressjs.com/",
    shadow: "360 5% 23%",
  },
  {
    id: "tailwind",
    name: "TailwindCSS",
    link: "https://tailwindcss.com/",
    shadow: "189 100% 45%",
  },
  {
    id: "next",
    name: "NextJS",
    link: "https://nextjs.org/",
    shadow: "0 0% 0%",
  },
  {
    id: "ci",
    name: "CodeIgniter",
    link: "https://www.codeigniter.com/",
    shadow: "14 100% 53%",
  },
];
const frameworksDiv = document.getElementById("frameworks-container");
frameworks.forEach((framework) => renderCards(framework, frameworksDiv));
const tools = [
  {
    id: "mysql",
    name: "MySQL",
    link: "https://www.mysql.com/",
    shadow: "196 64% 27%",
  },
  {
    id: "mongodb",
    name: "MongoDB",
    link: "https://www.mongodb.com/",
    shadow: "135 75% 50%",
  },
  {
    id: "vite",
    name: "ViteJS",
    link: "https://vitejs.dev/",
    shadow: "280 75% 50%",
  },
  {
    id: "nodejs",
    name: "NodeJS",
    link: "https://nodejs.org/en",
    shadow: "142 86% 29%",
  },
  {
    id: "vscode",
    name: "Visual Studio Code",
    link: "https://code.visualstudio.com/",
    shadow: "208 100% 63%",
  },
];
const toolsDiv = document.getElementById("tools-container");
tools.forEach((tool) => renderCards(tool, toolsDiv));

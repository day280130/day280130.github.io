(() => {
  const savedTheme = localStorage.getItem("theme");
  const systemPreferDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const theme = ["dark", "light"].includes(savedTheme) ? savedTheme : systemPreferDark ? "dark" : "light";
  document.documentElement.setAttribute("data-theme", theme);
})();

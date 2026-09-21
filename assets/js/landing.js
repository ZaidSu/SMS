const menuToggle = document.getElementById("menuToggle");
const mobileMenu = document.getElementById("mobileMenu");

if (menuToggle && mobileMenu) {
  const icon = menuToggle.querySelector("i");
  menuToggle.addEventListener("click", () => {
    mobileMenu.classList.toggle("open");
    if (icon) {
      icon.classList.toggle("fa-bars", !mobileMenu.classList.contains("open"));
      icon.classList.toggle("fa-xmark", mobileMenu.classList.contains("open"));
    }
  });
  window.addEventListener("resize", () => {
    if (window.innerWidth > 980) {
      mobileMenu.classList.remove("open");
      if (icon) {
        icon.classList.add("fa-bars");
        icon.classList.remove("fa-xmark");
      }
    }
  });
  mobileMenu.querySelectorAll("a").forEach(link => link.addEventListener("click", () => mobileMenu.classList.remove("open")));
}

const tabs = document.querySelectorAll(".experience-tabs .tab");
const contents = document.querySelectorAll(".experience-content");
tabs.forEach(tab => {
  tab.addEventListener("click", () => {
    tabs.forEach(t => t.classList.remove("active"));
    contents.forEach(content => content.classList.remove("active"));
    tab.classList.add("active");
    const target = document.getElementById(tab.dataset.tab);
    if (target) target.classList.add("active");
  });
});

const footerYear = document.getElementById("footerYear");
if (footerYear) footerYear.textContent = new Date().getFullYear();

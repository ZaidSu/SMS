const menuToggle = document.getElementById("menuToggle");
const mobileMenu = document.getElementById("mobileMenu");
const icon = menuToggle.querySelector("i");

menuToggle.addEventListener("click", () => {
  mobileMenu.classList.toggle("open");

  if (mobileMenu.classList.contains("open")) {
    icon.classList.remove("fa-bars");
    icon.classList.add("fa-xmark");
  } else {
    icon.classList.remove("fa-xmark");
    icon.classList.add("fa-bars");
  }
});

window.addEventListener("resize", () => {
  if (window.innerWidth > 980) {
    mobileMenu.classList.remove("open");
    icon.classList.remove("fa-xmark");
    icon.classList.add("fa-bars");
  }
});


const tabs = document.querySelectorAll(".tab")
const contents = document.querySelectorAll(".experience-content")

tabs.forEach(tab => {

  tab.addEventListener("click", () => {

    tabs.forEach(t => t.classList.remove("active"))
    tab.classList.add("active")

    const target = tab.dataset.tab

    contents.forEach(content => {
      content.classList.remove("active")
    })

    document.getElementById(target).classList.add("active")

  })

})



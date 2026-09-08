const nav = document.getElementById("mobile-nav");
nav.style.display = 'none';
document.querySelector(".mobile-menu-toggle").addEventListener("click", () => { nav.style.display = nav.style.display === 'none' ? "block" : "none"; })
document.addEventListener("click", (e) => {
    if (!nav.contains(e.target) && !document.querySelector(".mobile-menu-toggle").contains(e.target)) {
        nav.style.display = 'none';
    }
});
window.addEventListener("resize", () => {
    if (window.innerWidth > 768) {
        nav.style.display = 'none';
    }
});
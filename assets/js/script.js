//navbar and scrollup 
document.addEventListener("DOMContentLoaded", () => {
  fetch("/components/navbar.html")  // Adjusted to go up one level
    .then((response) => response.ok ? response.text() : Promise.reject("Navbar file not found"))
    .then((html) => {
      document.getElementById("navbar-placeholder").innerHTML = html;
      const scrollToTopBtn = document.querySelector("#scrollToTopBtn");
      if (scrollToTopBtn) {
        window.addEventListener("scroll", () => 
          scrollToTopBtn.classList.toggle("show", window.scrollY > 300)
        );
        scrollToTopBtn.addEventListener("click", () =>
          window.scrollTo({ top: 0, behavior: "smooth" })
        );
      }
    })
    .catch((error) => console.error("Error loading navbar:", error));
});
//footer
document.addEventListener('DOMContentLoaded', () => {
  fetch('/components/footer.html')  // Adjusted to go up one level
      .then(response => {
          if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.text();
      })
      .then(data => {
          document.getElementById('footer').innerHTML = data;
      })
      .catch(error => console.error('Error loading footer:', error));
  });










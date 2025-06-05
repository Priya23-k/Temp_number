// script.js (updated)
document.addEventListener("DOMContentLoaded", () => {
  // Navbar loading
  const navbarPlaceholder = document.getElementById('navbar-placeholder');
  if (navbarPlaceholder) {
      fetch('/navbar.html')  // Ensure correct file extension
          .then(response => {
              if (!response.ok) throw new Error(`HTTP ${response.status}`);
              return response.text();
          })
          .then(html => navbarPlaceholder.innerHTML = html)
          .catch(error => console.error('Navbar load error:', error));
  }

  // Footer loading
  const footer = document.getElementById('footer');
  if (footer) {
      fetch('/footer.html')  // Ensure correct file extension
          .then(response => {
              if (!response.ok) throw new Error(`HTTP ${response.status}`);
              return response.text();
          })
          .then(html => footer.innerHTML = html)
          .catch(error => console.error('Footer load error:', error));
  }

  // Scroll to top button
  const scrollToTopBtn = document.getElementById('scrollToTopBtn');
  if (scrollToTopBtn) {
      window.addEventListener('scroll', () => {
          scrollToTopBtn.classList.toggle('show', window.scrollY > 300);
      });

      scrollToTopBtn.addEventListener('click', () => {
          window.scrollTo({ top: 0, behavior: 'smooth' });
      });
  }
});

// Toggle sidebar on three dots click
document.getElementById('appMenuToggle').addEventListener('click', function() {
    const sidebar = document.getElementById('appSidebar');
    sidebar.classList.toggle('active');
  });
  
  // Close sidebar when clicking outside
  document.addEventListener('click', function(event) {
    const sidebar = document.getElementById('appSidebar');
    const menuToggle = document.getElementById('appMenuToggle');
  
    if (!sidebar.contains(event.target) && !menuToggle.contains(event.target)) {
      sidebar.classList.remove('active');
    }
  });

  document.addEventListener("DOMContentLoaded", () => {
    const logoutBtn = document.getElementById("logout-btn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", async (e) => {
            e.preventDefault();
            
            // ✅ Clear token from cookies and localStorage
            document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
            localStorage.removeItem("token");
            localStorage.removeItem("customer");

            window.location.href = "/app/login"; // Redirect to login
        });
    }
});

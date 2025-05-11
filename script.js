document.addEventListener('DOMContentLoaded', () => {
  const LS_USERS_KEY = 'kitchenShareUsers';
  const LS_LOGGED_IN_USER_KEY = 'kitchenShareLoggedInUser';

  // --- Helper Functions ---
  function getUsers() {
    const users = localStorage.getItem(LS_USERS_KEY);
    return users ? JSON.parse(users) : [];
  }

  function saveUsers(users) {
    localStorage.setItem(LS_USERS_KEY, JSON.stringify(users));
  }

  function getLoggedInUser() {
    const user = localStorage.getItem(LS_LOGGED_IN_USER_KEY);
    return user ? JSON.parse(user) : null;
  }

  function setLoggedInUser(user) {
    localStorage.setItem(LS_LOGGED_IN_USER_KEY, JSON.stringify(user));
  }

  function clearLoggedInUser() {
    localStorage.removeItem(LS_LOGGED_IN_USER_KEY);
  }

  function displayErrorMessage(elementId, message) {
    const errorElement = document.getElementById(elementId);
    if (errorElement) {
      errorElement.textContent = message;
      errorElement.style.display = message ? 'block' : 'none';
    }
  }

  // --- Authentication UI Update ---
  function updateAuthUI() {
    const loggedInUser = getLoggedInUser();
    const currentPage = window.location.pathname.split('/').pop();

    // Handle general site header auth buttons (on index.html, listings.html etc.)
    const authButtonsContainer = document.querySelector('.auth-buttons'); // This is for the main site header
    if (authButtonsContainer) {
      if (loggedInUser) {
        let dashboardUrl = 'index.html'; // Fallback
        if (loggedInUser.userType === 'chef') {
          dashboardUrl = 'chef-dashboard.html';
        } else if (loggedInUser.userType === 'owner') {
          dashboardUrl = 'owner-dashboard.html';
        }
        authButtonsContainer.innerHTML = `
          <a href="${dashboardUrl}" class="btn btn-outline">Dashboard</a>
          <button id="logout-button" class="btn btn-primary">Log Out</button>
        `;
        const logoutButton = document.getElementById('logout-button');
        if (logoutButton) {
          logoutButton.addEventListener('click', handleLogout);
        }
      } else {
        authButtonsContainer.innerHTML = `
          <a href="login.html" class="btn btn-outline">Log In</a>
          <a href="signup.html" class="btn btn-primary">Sign Up</a>
        `;
      }
    }

    // Handle Owner Dashboard specific header
    if (currentPage === 'owner-dashboard.html') {
      if (loggedInUser) {
        const userNameTop = document.getElementById('dashboardUserNameTop'); // For owner-dashboard.html
        const userAvatarTop = document.getElementById('dashboardUserAvatarTop'); // For owner-dashboard.html
        const userNameDropdown = document.getElementById('dashboardUserFullNameDropdown'); // For owner-dashboard.html
        const userEmailDropdown = document.getElementById('dashboardUserEmailDropdown'); // For owner-dashboard.html
        const userAvatarDropdown = document.getElementById('dashboardUserAvatarDropdown'); // For owner-dashboard.html
        const logoutLink = document.getElementById('dashboard-logout-link'); // For owner-dashboard.html

        if (userNameTop) userNameTop.textContent = loggedInUser.fullName || 'User';
        // if (userAvatarTop && loggedInUser.avatarUrl) userAvatarTop.src = loggedInUser.avatarUrl;
        
        if (userNameDropdown) userNameDropdown.textContent = loggedInUser.fullName || 'User Name';
        if (userEmailDropdown) userEmailDropdown.textContent = loggedInUser.email || 'user@example.com';
        // if (userAvatarDropdown && loggedInUser.avatarUrl) userAvatarDropdown.src = loggedInUser.avatarUrl;

        if (logoutLink) {
          logoutLink.addEventListener('click', (e) => {
            e.preventDefault();
            handleLogout();
          });
        }
      }
    }

    // Handle Chef Dashboard specific header
    if (currentPage === 'chef-dashboard.html') {
        if (loggedInUser) {
            const userNameTopChef = document.getElementById('dashboardUserNameTop'); // For chef-dashboard.html
            const userAvatarTopChef = document.getElementById('dashboardUserAvatarTop'); // For chef-dashboard.html
            const userNameSidebarChef = document.getElementById('dashboardUserNameSidebar'); // For chef-dashboard.html
            const userAvatarSidebarChef = document.getElementById('dashboardUserAvatarSidebar'); // For chef-dashboard.html
            // Note: Chef dashboard has a different logout mechanism, typically part of a dropdown not explicitly ID'd here for logout.
            // If a specific logout button ID is added to chef-dashboard.html, it can be handled here.

            if (userNameTopChef) userNameTopChef.textContent = loggedInUser.fullName || 'Chef';
            // if (userAvatarTopChef && loggedInUser.avatarUrl) userAvatarTopChef.src = loggedInUser.avatarUrl;
            if (userNameSidebarChef) userNameSidebarChef.textContent = loggedInUser.fullName || 'Chef Name';
            // if (userAvatarSidebarChef && loggedInUser.avatarUrl) userAvatarSidebarChef.src = loggedInUser.avatarUrl;
        }
    }
  }

  // --- Page Protection ---
  function protectPage() {
    const loggedInUser = getLoggedInUser();
    const currentPage = window.location.pathname.split('/').pop();

    const protectedPages = ['chef-dashboard.html', 'owner-dashboard.html', 'list-kitchen.html', 'booking.html'];
    if (protectedPages.includes(currentPage) && !loggedInUser) {
      window.location.href = 'login.html';
      return; 
    }

    if (loggedInUser) {
      if (loggedInUser.userType === 'chef' && currentPage === 'owner-dashboard.html') {
        window.location.href = 'chef-dashboard.html';
      } else if (loggedInUser.userType === 'owner' && currentPage === 'chef-dashboard.html') {
        window.location.href = 'owner-dashboard.html';
      }
    }
  }


  // --- Event Handlers ---
  function handleSignup(event) {
    event.preventDefault();
    const form = event.target;
    const fullName = form.fullName.value;
    const email = form.email.value;
    const password = form.password.value;
    const confirmPassword = form.confirmPassword.value;
    const userType = form.userType.value;
    const terms = form.elements['terms-signup'].checked;

    displayErrorMessage('password-match-error', '');
    displayErrorMessage('signup-error', '');

    if (password !== confirmPassword) {
      displayErrorMessage('password-match-error', 'Passwords do not match.');
      return;
    }
    if (!terms) {
      displayErrorMessage('signup-error', 'You must agree to the Terms of Service and Privacy Policy.');
      return;
    }
    if (password.length < 6) {
        displayErrorMessage('signup-error', 'Password must be at least 6 characters long.');
        return;
    }


    const users = getUsers();
    if (users.find(user => user.email === email)) {
      displayErrorMessage('signup-error', 'An account with this email already exists.');
      return;
    }

    users.push({ fullName, email, password, userType }); 
    saveUsers(users);
    alert('Signup successful! Please log in.');
    window.location.href = 'login.html';
  }

  function handleLogin(event) {
    event.preventDefault();
    const form = event.target;
    const email = form.email.value;
    const password = form.password.value;
    
    displayErrorMessage('login-error', '');

    const users = getUsers();
    const user = users.find(u => u.email === email && u.password === password); 

    if (user) {
      setLoggedInUser({ email: user.email, fullName: user.fullName, userType: user.userType });
      if (user.userType === 'chef') {
        window.location.href = 'chef-dashboard.html';
      } else if (user.userType === 'owner') {
        window.location.href = 'owner-dashboard.html';
      } else {
        window.location.href = 'index.html'; 
      }
    } else {
      displayErrorMessage('login-error', 'Invalid email or password.');
    }
  }

  function handleLogout() {
    clearLoggedInUser();
    window.location.href = 'index.html'; 
  }

  // --- Mobile Menu Toggle (for main site header) ---
  const mobileMenuIcon = document.querySelector('.mobile-menu-icon');
  const mainNav = document.querySelector('.main-nav');

  if (mobileMenuIcon && mainNav) {
    mobileMenuIcon.addEventListener('click', () => {
      mainNav.classList.toggle('active');
      const icon = mobileMenuIcon.querySelector('i');
      if (icon.classList.contains('fa-bars')) {
        icon.classList.remove('fa-bars');
        icon.classList.add('fa-times');
      } else {
        icon.classList.remove('fa-times');
        icon.classList.add('fa-bars');
      }
    });

    mainNav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', (e) => {
        if (mainNav.classList.contains('active')) {
          mainNav.classList.remove('active');
          const icon = mobileMenuIcon.querySelector('i');
          icon.classList.remove('fa-times');
          icon.classList.add('fa-bars');
        }
        const href = link.getAttribute('href');
        if (href.startsWith('#') && href.length > 1) {
          const targetId = href.substring(1);
          const targetElement = document.getElementById(targetId);
          const onIndexPage = window.location.pathname.endsWith('index.html') || window.location.pathname === '/' || window.location.pathname.endsWith('/index.html');
          if (targetElement && onIndexPage) {
            e.preventDefault();
            targetElement.scrollIntoView({ behavior: 'smooth' });
          } 
        } else if (href.includes('#')) {
            const [page, anchor] = href.split('#');
            const onTargetPage = window.location.pathname.endsWith(page) || (page === 'index.html' && (window.location.pathname === '/' || window.location.pathname.endsWith('/index.html')));
            if (anchor && onTargetPage) {
                const targetElement = document.getElementById(anchor);
                if (targetElement) {
                    e.preventDefault();
                    targetElement.scrollIntoView({ behavior: 'smooth' });
                }
            }
        }
      });
    });
  }
  
  // --- Hero Carousel ---
  const carousel = document.querySelector('.hero .carousel');
  if (carousel) {
    const slides = carousel.querySelectorAll('.slide');
    const indicatorsContainer = carousel.querySelector('.slide-indicators');
    const prevButton = carousel.querySelector('.carousel-prev');
    const nextButton = carousel.querySelector('.carousel-next');
    let currentSlide = 0;
    let slideInterval;
    const slideDuration = 5000;

    function createIndicators() {
      if (!indicatorsContainer || slides.length === 0) return;
      indicatorsContainer.innerHTML = '';
      slides.forEach((_, index) => {
        const indicator = document.createElement('div');
        indicator.classList.add('indicator');
        if (index === 0) indicator.classList.add('active');
        indicator.addEventListener('click', () => {
          goToSlide(index);
          resetInterval();
        });
        indicatorsContainer.appendChild(indicator);
      });
    }
    
    function updateIndicators() {
      if (!indicatorsContainer) return;
      const indicators = indicatorsContainer.querySelectorAll('.indicator');
      indicators.forEach((indicator, index) => {
        indicator.classList.toggle('active', index === currentSlide);
      });
    }

    function goToSlide(slideIndex) {
      if (slides.length === 0) return;
      slides[currentSlide].classList.remove('active');
      currentSlide = (slideIndex + slides.length) % slides.length;
      slides[currentSlide].classList.add('active');
      updateIndicators();
    }

    function nextSlideFn() { goToSlide(currentSlide + 1); }
    function prevSlideFn() { goToSlide(currentSlide - 1); }

    function startInterval() {
      if (slides.length > 1) {
        slideInterval = setInterval(nextSlideFn, slideDuration);
      }
    }
    function resetInterval() { clearInterval(slideInterval); startInterval(); }

    if (slides.length > 0) {
      createIndicators();
      if (!slides[currentSlide].classList.contains('active')) {
         slides.forEach(s => s.classList.remove('active'));
         slides[currentSlide].classList.add('active');
      }
      updateIndicators();
      startInterval();

      if (prevButton) prevButton.addEventListener('click', () => { prevSlideFn(); resetInterval(); });
      if (nextButton) nextButton.addEventListener('click', () => { nextSlideFn(); resetInterval(); });
    }
  }
  
  // --- Copyright Year (for main site footer) ---
  const currentYearSpan = document.getElementById('currentYear');
  if (currentYearSpan) {
    currentYearSpan.textContent = new Date().getFullYear();
  }

  // --- Smooth scroll for nav links (general) ---
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      const onIndexPage = window.location.pathname.endsWith('index.html') || window.location.pathname === '/' || window.location.pathname.endsWith('/index.html');
      if (href.length > 1 && href.startsWith('#') && onIndexPage) {
        const targetElement = document.getElementById(href.substring(1));
        if (targetElement) {
          e.preventDefault();
          targetElement.scrollIntoView({ behavior: 'smooth' });
        }
      }
      const currentPage = window.location.pathname.split('/').pop();
      if ((currentPage === 'owner-dashboard.html' || currentPage === 'chef-dashboard.html') && href.startsWith('#')) {
        // Let dashboard-specific JS handle tab changes or internal links
        return; 
      }
    });
  });

  // --- Page Specific Initializations & Auth ---
  const currentPage = window.location.pathname.split('/').pop();

  if (['chef-dashboard.html', 'owner-dashboard.html', 'list-kitchen.html', 'booking.html'].includes(currentPage)) {
    protectPage();
  }
  
  updateAuthUI(); 

  if (currentPage === 'signup.html') {
    const signupForm = document.getElementById('signup-form');
    if (signupForm) signupForm.addEventListener('submit', handleSignup);
  } else if (currentPage === 'login.html') {
    const loginForm = document.getElementById('login-form');
    if (loginForm) loginForm.addEventListener('submit', handleLogin);
  }
});

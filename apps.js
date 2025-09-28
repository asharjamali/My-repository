// Constants
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzFPVGxI-75Ilkm2z_EMuI9ubPlp8-7dQmMzzdPiIunLPPzj3bcY1ohMdT_DfZ3zPwhTA/exec';
const CIRCUMFERENCE = 2 * Math.PI * 45; // Dynamic circumference for SVG circle (radius 45)

// Utility: Debounce function for scroll events
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Contact form submission to Google Sheets
const form = document.forms['submit-to-google-sheet'];
const msg = document.getElementById("msg");
if (form && msg) {
  form.addEventListener('submit', e => {
    e.preventDefault();
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }
    form.classList.add('submitting');
    fetch(SCRIPT_URL, { method: 'POST', body: new FormData(form) })
      .then(response => {
        if (!response.ok) throw new Error('Network response was not ok');
        form.classList.remove('submitting');
        msg.innerHTML = "Message sent successfully";
        msg.className = "success";
        setTimeout(() => { msg.innerHTML = ""; msg.className = ""; }, 5000);
        form.reset();
      })
      .catch(error => {
        form.classList.remove('submitting');
        msg.innerHTML = "Error sending message. Please try again.";
        msg.className = "error";
        setTimeout(() => { msg.innerHTML = ""; msg.className = ""; }, 5000);
        console.error('Error!', error.message);
      });
  });
}

// Mobile menu toggle
const menuIcon = document.querySelector('#menu-icon');
const navbar = document.querySelector('.navbar');
if (menuIcon && navbar) {
  menuIcon.setAttribute('aria-expanded', 'false');
  menuIcon.setAttribute('aria-controls', 'navbar');
  menuIcon.addEventListener('click', () => {
    const isExpanded = menuIcon.classList.toggle('bx-x');
    navbar.classList.toggle('active');
    menuIcon.setAttribute('aria-expanded', isExpanded ? 'true' : 'false');
  });
  // Close menu on Escape key
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && navbar.classList.contains('active')) {
      menuIcon.classList.remove('bx-x');
      navbar.classList.remove('active');
      menuIcon.setAttribute('aria-expanded', 'false');
    }
  });
}

// Center section on navigation click
const navLinks = document.querySelectorAll('header nav a');
if (navLinks.length) {
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = link.getAttribute('href')?.substring(1);
      const targetSection = targetId && document.getElementById(targetId);
      if (targetSection) {
        const sectionTop = targetSection.getBoundingClientRect().top + window.pageYOffset;
        const sectionHeight = targetSection.offsetHeight;
        const viewportHeight = window.innerHeight;
        const scrollPosition = sectionHeight < viewportHeight
          ? sectionTop - (viewportHeight - sectionHeight) / 2
          : sectionTop;
        window.scrollTo({
          top: scrollPosition,
          behavior: 'smooth'
        });
        navLinks.forEach(l => l.classList.remove('active'));
        link.classList.add('active');
        if (menuIcon && navbar) {
          menuIcon.classList.remove('bx-x');
          navbar.classList.remove('active');
          menuIcon.setAttribute('aria-expanded', 'false');
        }
      }
    });
  });
}

// Update active link on scroll (debounced)
const updateActiveLink = debounce(() => {
  const sections = document.querySelectorAll('section');
  sections.forEach(sec => {
    const top = window.scrollY;
    const offset = sec.offsetTop - window.innerHeight / 2;
    const height = sec.offsetHeight;
    const id = sec.getAttribute('id');
    if (id && top >= offset && top < offset + height) {
      navLinks.forEach(link => link.classList.remove('active'));
      const activeLink = document.querySelector(`header nav a[href*="${id}"]`);
      if (activeLink) activeLink.classList.add('active');
    }
  });
  const header = document.querySelector('header');
  if (header) {
    header.classList.toggle('sticky', window.scrollY > 100);
  }
}, 100);
window.addEventListener('scroll', updateActiveLink);

// Tabbed interface for About section
const tabButtons = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');
if (tabButtons.length && tabContents.length) {
  tabButtons.forEach((button, index) => {
    button.setAttribute('role', 'tab');
    button.setAttribute('aria-selected', 'false');
    button.addEventListener('click', () => {
      const tabId = button.dataset.tab;
      const content = tabId && document.getElementById(tabId);
      if (content) {
        tabButtons.forEach(btn => {
          btn.classList.remove('active');
          btn.setAttribute('aria-selected', 'false');
        });
        tabContents.forEach(content => content.classList.remove('active'));
        button.classList.add('active');
        button.setAttribute('aria-selected', 'true');
        content.classList.add('active');
      }
    });
    // Keyboard navigation for tabs
    button.addEventListener('keydown', e => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        e.preventDefault();
        const nextIndex = e.key === 'ArrowRight'
          ? (index + 1) % tabButtons.length
          : (index - 1 + tabButtons.length) % tabButtons.length;
        tabButtons[nextIndex].focus();
        tabButtons[nextIndex].click();
      }
    });
  });
}

// ScrollReveal animations
if (typeof ScrollReveal !== 'undefined') {
  const sr = ScrollReveal({
    distance: '80px',
    duration: 2000,
    delay: 200
  });
  sr.reveal('.home-content, .heading', { origin: 'top' });
  sr.reveal('.home-img, .services-container, .skillsmilliampere: 1000,
      .skills-container, .portfolio-box, .certificate-box, .contact form', { origin: 'bottom' });
  sr.reveal('.home-content h1, .about-img', { origin: 'left' });
  sr.reveal('.home-content p, .about-content, .skills-box, .about-tabs, .tab-content', { origin: 'right' });
} else {
  console.warn('ScrollReveal library not loaded.');
}

// Typed.js for dynamic text
if (typeof Typed !== 'undefined' && document.querySelector('.multiple-text')) {
  new Typed('.multiple-text', {
    strings: ['CSE Student at GUG', 'Frontend Developer', 'Data Analyst', 'Network Engineer', 'Data Engineer'],
    typeSpeed: 100,
    backSpeed: 100,
    backDelay: 1000,
    loop: true
  });
} else {
  console.warn('Typed.js library not loaded or .multiple-text element missing.');
}

// Animate skills progress circles on scroll
const skillsBoxes = document.querySelectorAll('.skills-box');
let hasAnimated = false;
const animateProgress = () => {
  if (hasAnimated) return;
  skillsBoxes.forEach(box => {
    const progress = parseFloat(box.dataset.progress) || 0;
    const circle = box.querySelector('.progress');
    if (circle && !isNaN(progress)) {
      const offset = CIRCUMFERENCE * (1 - progress / 100);
      circle.style.strokeDashoffset = offset;
    }
  });
  hasAnimated = true;
};
const skillsSection = document.querySelector('.skills');
if (skillsSection) {
  window.addEventListener('scroll', () => {
    const rect = skillsSection.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      animateProgress();
    }
  });
}

// Generate twinkling stars for home section only
const homeSection = document.querySelector('#home');
if (homeSection) {
  for (let i = 0; i < 20; i++) { // Reduced to 20 stars for performance
    const star = document.createElement('div');
    star.classList.add('star');
    star.style.left = `${Math.random() * 100}%`;
    star.style.top = `${Math.random() * 100}%`;
    star.style.animationDelay = `${Math.random() * 5}s`;
    homeSection.appendChild(star);
  }
}

// Section icon animation and color change on click
const headings = document.querySelectorAll('.heading');
const sectionColors = {
  home: '#2a3a4a', // Dark teal
  about: '#3a2a4a', // Dark purple
  services: '#4a2a3a', // Dark maroon
  skills: '#2a4a3a', // Dark green
  portfolio: '#3a4a2a', // Dark olive
  certificates: '#4a3a2a', // Dark brown
  contact: '#2a3a4a' // Dark blue
};
const sections = document.querySelectorAll('section');
headings.forEach(heading => {
  const icon = heading.querySelector('i');
  if (icon) {
    heading.addEventListener('click', () => {
      icon.classList.add('clicked');
      setTimeout(() => icon.classList.remove('clicked'), 400);
      sections.forEach(sec => {
        const secId = sec.getAttribute('id');
        sec.style.background = secId ? `var(--q${secId}-bg, #fff)` : '#fff';
      });
      const section = heading.closest('section');
      const sectionId = section?.getAttribute('id');
      if (section && sectionId && sectionColors[sectionId]) {
        section.style.background = sectionColors[sectionId];
      }
    });
  }
});
/**
 * HabitFlow Landing Page - JavaScript
 * Handles: Theme toggle, Mobile menu, Scroll animations, Navbar behavior
 */

(function() {
  'use strict';

  // ============================================
  // Theme Toggle (Dark/Light Mode)
  // ============================================
  const themeToggle = document.getElementById('themeToggle');
  const sunIcon = document.querySelector('.sun-icon');
  const moonIcon = document.querySelector('.moon-icon');
  
  // Get initial theme from localStorage or system preference
  function getInitialTheme() {
    const savedTheme = localStorage.getItem('habitflow-theme');
    if (savedTheme) {
      return savedTheme;
    }
    // Check system preference
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  
  // Apply theme to document
  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('habitflow-theme', theme);
    
    // Update icons
    if (theme === 'dark') {
      sunIcon.classList.add('hidden');
      moonIcon.classList.remove('hidden');
    } else {
      sunIcon.classList.remove('hidden');
      moonIcon.classList.add('hidden');
    }
  }
  
  // Initialize theme
  applyTheme(getInitialTheme());
  
  // Toggle theme on button click
  if (themeToggle) {
    themeToggle.addEventListener('click', function() {
      const currentTheme = document.documentElement.getAttribute('data-theme');
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      applyTheme(newTheme);
    });
  }
  
  // Listen for system theme changes
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function(e) {
    // Only auto-switch if user hasn't manually set a preference
    if (!localStorage.getItem('habitflow-theme')) {
      applyTheme(e.matches ? 'dark' : 'light');
    }
  });

  // ============================================
  // Mobile Menu Toggle
  // ============================================
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const navLinks = document.getElementById('navLinks');
  const menuIcon = document.querySelector('.menu-icon');
  const closeIcon = document.querySelector('.close-icon');
  
  if (mobileMenuBtn && navLinks) {
    mobileMenuBtn.addEventListener('click', function() {
      const isOpen = navLinks.classList.toggle('active');
      
      // Toggle icons
      if (isOpen) {
        menuIcon.classList.add('hidden');
        closeIcon.classList.remove('hidden');
      } else {
        menuIcon.classList.remove('hidden');
        closeIcon.classList.add('hidden');
      }
      
      // Update ARIA
      mobileMenuBtn.setAttribute('aria-expanded', isOpen);
    });
    
    // Close menu when clicking a nav link
    navLinks.querySelectorAll('.nav-link').forEach(function(link) {
      link.addEventListener('click', function() {
        navLinks.classList.remove('active');
        menuIcon.classList.remove('hidden');
        closeIcon.classList.add('hidden');
        mobileMenuBtn.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // ============================================
  // Navbar Scroll Behavior
  // ============================================
  const navbar = document.getElementById('navbar');
  let lastScrollY = window.scrollY;
  
  function handleNavbarScroll() {
    const currentScrollY = window.scrollY;
    
    if (navbar) {
      // Add scrolled class when scrolled down
      if (currentScrollY > 50) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    }
    
    lastScrollY = currentScrollY;
  }
  
  // Throttle scroll events
  let scrollTimeout;
  window.addEventListener('scroll', function() {
    if (!scrollTimeout) {
      scrollTimeout = setTimeout(function() {
        handleNavbarScroll();
        scrollTimeout = null;
      }, 10);
    }
  }, { passive: true });

  // ============================================
  // Smooth Scroll for Anchor Links
  // ============================================
  document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      
      // Skip if it's just "#"
      if (targetId === '#') return;
      
      const targetElement = document.querySelector(targetId);
      
      if (targetElement) {
        e.preventDefault();
        
        // Calculate offset for fixed navbar
        const navbarHeight = navbar ? navbar.offsetHeight : 0;
        const targetPosition = targetElement.getBoundingClientRect().top + window.scrollY - navbarHeight - 20;
        
        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      }
    });
  });

  // ============================================
  // Scroll Animations (Intersection Observer)
  // ============================================
  const animatedElements = document.querySelectorAll('.animate-on-scroll');
  
  // Check if user prefers reduced motion
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  if (!prefersReducedMotion && animatedElements.length > 0) {
    const observerOptions = {
      root: null,
      rootMargin: '0px 0px -50px 0px',
      threshold: 0.1
    };
    
    const observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          // Optionally stop observing after animation
          // observer.unobserve(entry.target);
        }
      });
    }, observerOptions);
    
    animatedElements.forEach(function(element) {
      observer.observe(element);
    });
  } else {
    // If reduced motion is preferred, show all elements immediately
    animatedElements.forEach(function(element) {
      element.classList.add('visible');
    });
  }

  // ============================================
  // Keyboard Navigation Enhancement
  // ============================================
  // Add visible focus states for keyboard users
  document.body.addEventListener('keydown', function(e) {
    if (e.key === 'Tab') {
      document.body.classList.add('keyboard-nav');
    }
  });
  
  document.body.addEventListener('mousedown', function() {
    document.body.classList.remove('keyboard-nav');
  });

})();

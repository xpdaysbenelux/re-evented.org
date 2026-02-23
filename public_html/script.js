/* ==========================================================================
   RE-EVENTED WEBSITE SCRIPTS
   ========================================================================== */

/* ===================== SCROLLING FUNCTIONALITY ===================== */

/**
 * Smooth scroll to a target element with header offset
 * @param {string} targetId - The ID of the target element
 */
function smoothScrollTo(targetId) {
  const targetElement = document.getElementById(targetId);
  if (!targetElement) {
    return;
  }

  const headerHeight = 80;
  const elementRect = targetElement.getBoundingClientRect();
  const absoluteElementTop = elementRect.top + window.pageYOffset;
  let targetPosition = absoluteElementTop - headerHeight;
  
  // Ensure we don't scroll above the top of the page
  if (targetPosition < 0) targetPosition = 0;
  
  window.scrollTo({
    top: targetPosition,
    behavior: 'smooth'
  });
}

/* ===================== UTILITY FUNCTIONS ===================== */

/**
 * Update the current year in footer elements
 */
function updateFooterYear() {
  const currentYear = new Date().getFullYear();
  
  // Update footer-year span elements
  const footerYearSpan = document.getElementById('footer-year');
  if (footerYearSpan) {
    footerYearSpan.textContent = currentYear;
  }
  
  // Update footer text that contains hardcoded years
  const footerText = document.querySelector('footer p');
  if (footerText) {
    footerText.innerHTML = footerText.innerHTML.replace(/© \d{4}/, `© ${currentYear}`);
    footerText.innerHTML = footerText.innerHTML.replace(/&copy; \d{4}/, `&copy; ${currentYear}`);
  }
}

/**
 * Update the current date for privacy policy
 */
function updateCurrentDate() {
  const currentDateElement = document.getElementById('current-date');
  if (!currentDateElement) return;
  
  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  currentDateElement.textContent = currentDate;
}

/**
 * Ensure all date-related elements are updated
 */
function ensureYearUpdated() {
  updateFooterYear();
  updateCurrentDate();
}

/* ===================== DATA PROTECTION FUNCTIONS ===================== */

const sensitiveData = {
  // Personal Names
  "peter": "UGV0ZXIgTGF0dGVu",
  "frederik": "RnJlZGVyaWsgVmFubmlldXdlbmh1eXNl",
  "dimitri": "RGltaXRyaSBCYXV3ZW5z",
  
  // Emails
  "email_info": "aW5mb0ByZS1ldmVudGVkLm9yZw==",
  
  // Re-Evented VZW (Belgium)
  "vzw_name": "UmUtRXZlbnRlZCBWWlc=",
  "vzw_address": "V2FhbGhvdmVzdHJhYXQgMTIsIDk0MDQgQXNwZWxhcmUsIEJlbGdpdW0=",
  "vzw_enterprise": "MTAwOS44NzQuOTE4",
  "vzw_vat": "QkUgMTAwOS44NzQuOTE4",
  "vzw_bank": "S0JD",
  "vzw_iban": "QkUzNTczNDA3OTQ2NTIzNw==",
  "vzw_bic": "S1JFREJFQkI=",
  
  // Re-Evented Stichting (Netherlands)
  "stichting_name": "UmUtRXZlbnRlZCBTdGljaHRpbmc=",
  "stichting_address": "TXVzc2NoZW5icm9la3N0cmFhdCA1MCwgNTYyMSBFRCBFaW5kaG92ZW4sIFRoZSBOZXRoZXJsYW5kcw==",
  "stichting_kvk": "Njc2NjY4OTI=",
  "stichting_vat": "TkwgODU3MTE5ODk4QjAx",
  "stichting_bank": "SU5H",
  "stichting_iban": "Tkw2NCBJTkdCIDAwMDcgNTkzMSA5Mg==",
  "stichting_bic": "SU5HQk5MMkE="
};

/**
 * Decode Base64 string
 */
function decodeData(encoded) {
  try {
    return atob(encoded);
  } catch (e) {
    console.error("Failed to decode data", e);
    return "";
  }
}

/**
 * Inject sensitive data into elements with [data-protect] attribute
 */
function injectSensitiveData() {
  const elements = document.querySelectorAll('[data-protect]');
  
  elements.forEach(element => {
    const key = element.getAttribute('data-protect');
    if (sensitiveData[key]) {
      const decoded = decodeData(sensitiveData[key]);
      
      // If it's an email link
      if (element.tagName === 'A' && key.startsWith('email')) {
        element.href = 'mailto:' + decoded;
        element.textContent = decoded;
      } else {
        element.textContent = decoded;
      }
      
      element.classList.add('no-copy');
    }
  });
}

/**
 * Protect email addresses from scraping by creating clickable mailto links
 */
function protectEmails() {
  // Legacy support for data-email if needed, but prefer data-protect="email_info"
  const emailElements = document.querySelectorAll('[data-email]');
  
  emailElements.forEach(element => {
    const email = element.getAttribute('data-email');
    if (!email) return;
    
    // Create a clickable email link that's harder to scrape
    const emailLink = document.createElement('a');
    emailLink.href = 'mailto:' + email;
    emailLink.textContent = email;
    emailLink.className = 'email-protected no-copy';
    emailLink.style.textDecoration = 'none';
    emailLink.style.color = 'inherit';
    
    // Replace the element content
    element.innerHTML = '';
    element.appendChild(emailLink);
  });
}

/**
 * Protect sensitive data from easy copying/scraping
 */
function protectSensitiveData() {
  // Inject base64 encoded data
  injectSensitiveData();

  // Legacy protection for data attributes (address, vat, etc.) if they still exist in HTML
  // We will migrate HTML to use data-protect, but keep this for safety
  const legacyAttributes = ['data-address', 'data-vat', 'data-bank', 'data-kvk', 'data-phone', 'data-name'];
  
  legacyAttributes.forEach(attr => {
    const elements = document.querySelectorAll(`[${attr}]`);
    elements.forEach(element => {
      const value = element.getAttribute(attr);
      if (value) {
        element.textContent = value;
        element.classList.add('protected-data', 'no-copy');
      }
    });
  });

  // Add CSS to make protected data harder to select/copy
  addProtectionStyles();
}

/**
 * Add CSS styles for data protection
 */
function addProtectionStyles() {
  if (document.getElementById('protection-styles')) return;
  
  const style = document.createElement('style');
  style.id = 'protection-styles';
  style.textContent = `
    .protected-data, .no-copy {
      user-select: none;
      -webkit-user-select: none;
      -moz-user-select: none;
      -ms-user-select: none;
      cursor: default;
    }
    .protected-data::selection, .no-copy::selection {
      background: transparent;
    }
    .protected-data::-moz-selection, .no-copy::-moz-selection {
      background: transparent;
    }
    /* Allow selection on email links if needed, or block it too */
    .email-protected {
      user-select: none;
      -webkit-user-select: none;
    }
    
    @media print {
      .no-copy {
        display: none; /* Optional: hide from print if strict */
      }
    }
  `;
  document.head.appendChild(style);
}

/* ===================== COOKIE CONSENT CLASS ===================== */

/**
 * Cookie consent management class
 */
class CookieConsent {
  constructor() {
    this.cookieName = 're-evented-cookie-consent';
    this.cookieExpiryDays = 365;
    this.init();
  }

  /**
   * Initialize cookie consent
   */
  init() {
    if (!this.hasConsent()) {
      this.showBanner();
    }
  }

  /**
   * Check if user has already given consent
   */
  hasConsent() {
    return document.cookie.split(';').some(item => 
      item.trim().startsWith(this.cookieName + '=')
    );
  }

  /**
   * Show cookie consent banner
   */
  showBanner() {
    const banner = document.createElement('div');
    banner.id = 'cookie-banner';
    banner.className = 'fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50 transform translate-y-full transition-transform duration-300';
    
    banner.innerHTML = `
      <div class="container mx-auto px-4 py-4">
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div class="flex-1">
            <p class="text-sm text-gray-700">
              We use cookies to enhance your browsing experience and analyze our traffic. 
              <a href="cookies-policy.html" class="text-green-highlight hover:text-primary underline">Learn more</a>
            </p>
          </div>
          <div class="flex gap-3">
            <button id="cookie-accept-all" class="cta-button px-4 py-2 text-sm font-medium button-angular">
              Accept All
            </button>
            <button id="cookie-accept-essential" class="cta-button-secondary px-4 py-2 text-sm font-medium button-angular">
              Essential Only
            </button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(banner);
    
    // Animate banner in
    setTimeout(() => {
      banner.classList.remove('translate-y-full');
    }, 100);

    // Add event listeners
    document.getElementById('cookie-accept-all').addEventListener('click', () => {
      this.acceptAll();
    });

    document.getElementById('cookie-accept-essential').addEventListener('click', () => {
      this.acceptEssential();
    });
  }

  /**
   * Accept all cookies
   */
  acceptAll() {
    this.setCookie('all');
    this.hideBanner();
    this.loadAnalytics();
  }

  /**
   * Accept only essential cookies
   */
  acceptEssential() {
    this.setCookie('essential');
    this.hideBanner();
  }

  /**
   * Set cookie with user preference
   */
  setCookie(preference) {
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + this.cookieExpiryDays);
    
    document.cookie = `${this.cookieName}=${preference}; expires=${expiryDate.toUTCString()}; path=/; SameSite=Lax`;
  }

  /**
   * Hide cookie banner
   */
  hideBanner() {
    const banner = document.getElementById('cookie-banner');
    if (!banner) return;
    
    banner.classList.add('translate-y-full');
    setTimeout(() => {
      banner.remove();
    }, 300);
  }

  /**
   * Load analytics scripts
   */
  loadAnalytics() {
    // Analytics loading logic can be added here
  }

  /**
   * Get current cookie preference
   */
  getPreference() {
    const cookie = document.cookie.split(';').find(item => 
      item.trim().startsWith(this.cookieName + '=')
    );
    return cookie ? cookie.split('=')[1] : null;
  }

  /**
   * Show cookie preferences modal
   */
  showPreferences() {
    const modal = document.createElement('div');
    modal.id = 'cookie-preferences-modal';
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 z-[9999] flex items-center justify-center p-4';
    
    modal.innerHTML = `
      <div class="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div class="p-6">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-semibold text-primary">Cookie Preferences</h3>
            <button id="close-preferences" class="text-gray-500 hover:text-gray-700">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
          
          <div class="space-y-4">
            <div class="border-b pb-4">
              <div class="flex items-center justify-between mb-2">
                <label class="font-medium text-primary">Essential Cookies</label>
                <input type="checkbox" checked disabled class="rounded border-gray-300">
              </div>
              <p class="text-sm text-gray-600">Required for the website to function properly. Cannot be disabled.</p>
            </div>
            
            <div class="border-b pb-4">
              <div class="flex items-center justify-between mb-2">
                <label class="font-medium text-primary">Analytics Cookies</label>
                <input type="checkbox" id="analytics-toggle" class="rounded border-gray-300">
              </div>
              <p class="text-sm text-gray-600">Help us understand how visitors use our website.</p>
            </div>
            
            <div class="border-b pb-4">
              <div class="flex items-center justify-between mb-2">
                <label class="font-medium text-primary">Functional Cookies</label>
                <input type="checkbox" id="functional-toggle" class="rounded border-gray-300">
              </div>
              <p class="text-sm text-gray-600">Enable enhanced functionality and personalization.</p>
            </div>
          </div>
          
          <div class="flex gap-3 mt-6">
            <button id="save-preferences" class="cta-button px-4 py-2 text-sm font-medium button-angular flex-1">
              Save Preferences
            </button>
            <button id="cancel-preferences" class="cta-button-secondary px-4 py-2 text-sm font-medium button-angular">
              Cancel
            </button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // Set current preferences
    this.setCurrentPreferences();

    // Add event listeners
    this.addPreferenceEventListeners(modal);
  }

  /**
   * Set current preferences in the modal
   */
  setCurrentPreferences() {
    const currentPreference = this.getPreference();
    const analyticsToggle = document.getElementById('analytics-toggle');
    const functionalToggle = document.getElementById('functional-toggle');
    
    if (currentPreference === 'all') {
      analyticsToggle.checked = true;
      functionalToggle.checked = true;
    } else if (currentPreference === 'essential') {
      analyticsToggle.checked = false;
      functionalToggle.checked = false;
    }
  }

  /**
   * Add event listeners to preference modal
   */
  addPreferenceEventListeners(modal) {
    document.getElementById('close-preferences').addEventListener('click', () => {
      this.hidePreferences();
    });

    document.getElementById('cancel-preferences').addEventListener('click', () => {
      this.hidePreferences();
    });

    document.getElementById('save-preferences').addEventListener('click', () => {
      this.savePreferences();
    });

    // Close modal when clicking outside
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        this.hidePreferences();
      }
    });
  }

  /**
   * Save user preferences
   */
  savePreferences() {
    const analytics = document.getElementById('analytics-toggle').checked;
    const functional = document.getElementById('functional-toggle').checked;
    
    if (analytics || functional) {
      this.setCookie('all');
      this.loadAnalytics();
    } else {
      this.setCookie('essential');
    }
    
    this.hidePreferences();
  }

  /**
   * Hide preferences modal
   */
  hidePreferences() {
    const modal = document.getElementById('cookie-preferences-modal');
    if (modal) {
      modal.remove();
    }
  }
}

/* ===================== INITIALIZATION ===================== */

// Initialize date updates with multiple fallbacks
ensureYearUpdated();
document.addEventListener('DOMContentLoaded', ensureYearUpdated);
setTimeout(ensureYearUpdated, 100);

// Main initialization when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  initializeMobileMenu();
  initializeBackToTopButton();
  initializeAnchorLinks();
  initializeCookieConsent();
  initializeDataProtection();
  initializeNewsletterSubscription();
});

/* ===================== INITIALIZATION FUNCTIONS ===================== */

/**
 * Initialize mobile menu functionality
 */
function initializeMobileMenu() {
  const mobileMenuButton = document.getElementById('mobile-menu-button');
  const mobileMenu = document.getElementById('mobile-menu');

  if (mobileMenuButton && mobileMenu) {
    mobileMenuButton.addEventListener('click', () => {
      mobileMenu.classList.toggle('hidden');
    });
  }
}

/**
 * Initialize back to top button functionality
 */
function initializeBackToTopButton() {
  const backToTopButton = document.getElementById('backToTopButton');
  if (!backToTopButton) return;
  
  window.addEventListener('scroll', () => {
    if (window.pageYOffset > 300) {
      backToTopButton.classList.add('visible');
    } else {
      backToTopButton.classList.remove('visible');
    }
  });
}

/**
 * Initialize smooth scrolling for anchor links
 */
function initializeAnchorLinks() {
  const allAnchorLinks = document.querySelectorAll('a[href^="#"]');
  
  allAnchorLinks.forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const hash = this.hash;
      if (!hash || hash === '#') return;
      
      e.preventDefault();
      
      // Close mobile menu if open
      const mobileMenu = document.getElementById('mobile-menu');
      if (mobileMenu && !mobileMenu.classList.contains('hidden')) {
        mobileMenu.classList.add('hidden');
      }
      
      // Extract the ID from the hash (remove the #)
      const targetId = hash.substring(1);
      smoothScrollTo(targetId);
    });
  });
}

/**
 * Initialize cookie consent functionality
 */
function initializeCookieConsent() {
  new CookieConsent();
  
  // Add event listener for cookie settings link
  const cookieSettingsLink = document.getElementById('cookie-settings-link');
  if (cookieSettingsLink) {
    cookieSettingsLink.addEventListener('click', (e) => {
      e.preventDefault();
      const cookieConsent = new CookieConsent();
      cookieConsent.showPreferences();
    });
  }
}

/**
 * Initialize data protection features
 */
function initializeDataProtection() {
  protectEmails();
  protectSensitiveData();
}

/* ===================== ENHANCED MOBILE MENU FUNCTIONALITY ===================== */

/**
 * Enhanced mobile menu with better accessibility and performance
 */
function initializeEnhancedMobileMenu() {
  const mobileMenuButton = document.getElementById('mobile-menu-button');
  const mobileMenu = document.getElementById('mobile-menu');
  
  if (!mobileMenuButton || !mobileMenu) return;
  
  // Track menu state
  let isMenuOpen = false;
  
  // Toggle menu function
  function toggleMenu() {
    isMenuOpen = !isMenuOpen;
    
    if (isMenuOpen) {
      mobileMenu.classList.add('active');
      mobileMenuButton.setAttribute('aria-expanded', 'true');
      mobileMenuButton.setAttribute('aria-label', 'Close mobile menu');
      
      // Focus trap for accessibility
      const firstLink = mobileMenu.querySelector('a');
      if (firstLink) {
        firstLink.focus();
      }
      
      // Prevent body scroll when menu is open
      document.body.style.overflow = 'hidden';
    } else {
      mobileMenu.classList.remove('active');
      mobileMenuButton.setAttribute('aria-expanded', 'false');
      mobileMenuButton.setAttribute('aria-label', 'Open mobile menu');
      
      // Restore body scroll
      document.body.style.overflow = '';
      
      // Return focus to button
      mobileMenuButton.focus();
    }
  }
  
  // Event listeners
  mobileMenuButton.addEventListener('click', toggleMenu);
  mobileMenuButton.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleMenu();
    }
  });
  
  // Close menu when clicking outside
  document.addEventListener('click', (e) => {
    if (isMenuOpen && !mobileMenu.contains(e.target) && !mobileMenuButton.contains(e.target)) {
      toggleMenu();
    }
  });
  
  // Close menu on escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isMenuOpen) {
      toggleMenu();
    }
  });
  
  // Close menu when window is resized to desktop
  window.addEventListener('resize', () => {
    if (window.innerWidth >= 768 && isMenuOpen) {
      toggleMenu();
    }
  });
}

/* ===================== PERFORMANCE OPTIMIZATIONS ===================== */

/**
 * Lazy load images with Intersection Observer
 */
function initializeLazyLoading() {
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
            img.classList.remove('loading-shimmer');
            observer.unobserve(img);
          }
        }
      });
    }, {
      rootMargin: '50px 0px',
      threshold: 0.01
    });
    
    // Observe images with data-src attribute
    document.querySelectorAll('img[data-src]').forEach(img => {
      img.classList.add('loading-shimmer');
      imageObserver.observe(img);
    });
  }
}

/**
 * Throttle function for performance
 */
function throttle(func, limit) {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

/* ===================== ENHANCED SCROLLING FUNCTIONALITY ===================== */

/**
 * Enhanced smooth scroll with better performance and accessibility
 */
function initializeEnhancedScrolling() {
  // Use passive listeners for better performance
  const scrollOptions = { passive: true };
  
  // Throttled scroll handler for back-to-top button
  const handleScroll = throttle(() => {
    const backToTopButton = document.querySelector('.back-to-top');
    if (backToTopButton) {
      if (window.pageYOffset > 300) {
        backToTopButton.classList.add('visible');
      } else {
        backToTopButton.classList.remove('visible');
      }
    }
  }, 100);
  
  window.addEventListener('scroll', handleScroll, scrollOptions);
  
  // Enhanced smooth scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const targetId = this.getAttribute('href').substring(1);
      const targetElement = document.getElementById(targetId);
      
      if (targetElement) {
        const headerHeight = 80;
        const elementPosition = targetElement.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerHeight;
        
        window.scrollTo({
          top: Math.max(0, offsetPosition),
          behavior: 'smooth'
        });
        
        // Update URL without page jump
        history.pushState(null, null, `#${targetId}`);
        
        // Focus the target element for accessibility
        setTimeout(() => {
          targetElement.focus();
        }, 1000);
      }
    });
  });
}

/* ===================== ACCESSIBILITY ENHANCEMENTS ===================== */

/**
 * Add skip link functionality
 */
function initializeSkipLink() {
  const skipLink = document.querySelector('.skip-to-content-link');
  const mainContent = document.getElementById('main-content');
  
  if (skipLink && mainContent) {
    skipLink.addEventListener('click', (e) => {
      e.preventDefault();
      mainContent.focus();
      mainContent.scrollIntoView({ behavior: 'smooth' });
    });
  }
}

/**
 * Add focus management for modals and overlays
 */
function initializeFocusManagement() {
  // Store the element that had focus before modal opened
  let previouslyFocusedElement = null;
  
  // Focus trap for modals
  function createFocusTrap(container) {
    const focusableElements = container.querySelectorAll(
      'a[href], button, textarea, input[type="text"], input[type="radio"], input[type="checkbox"], select'
    );
    
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    
    function handleTabKey(e) {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    }
    
    container.addEventListener('keydown', handleTabKey);
    
    // Focus first element
    if (firstElement) {
      firstElement.focus();
    }
    
    // Return cleanup function
    return () => {
      container.removeEventListener('keydown', handleTabKey);
    };
  }
  
  // Apply focus trap to cookie preferences modal
  const cookieModal = document.getElementById('cookie-preferences-modal');
  if (cookieModal) {
    let cleanupFocusTrap = null;
    
    // Store original show/hide functions
    const originalShow = window.showCookiePreferences;
    const originalHide = window.hideCookiePreferences;
    
    if (originalShow) {
      window.showCookiePreferences = function() {
        previouslyFocusedElement = document.activeElement;
        originalShow();
        cleanupFocusTrap = createFocusTrap(cookieModal);
      };
    }
    
    if (originalHide) {
      window.hideCookiePreferences = function() {
        originalHide();
        if (cleanupFocusTrap) {
          cleanupFocusTrap();
          cleanupFocusTrap = null;
        }
        if (previouslyFocusedElement) {
          previouslyFocusedElement.focus();
          previouslyFocusedElement = null;
        }
      };
    }
  }
}

/**
 * Add ARIA live regions for dynamic content
 */
function initializeLiveRegions() {
  // Create live region for announcements
  const liveRegion = document.createElement('div');
  liveRegion.setAttribute('aria-live', 'polite');
  liveRegion.setAttribute('aria-atomic', 'true');
  liveRegion.className = 'sr-only';
  document.body.appendChild(liveRegion);
  
  // Function to announce changes
  window.announceToScreenReader = function(message) {
    liveRegion.textContent = message;
    setTimeout(() => {
      liveRegion.textContent = '';
    }, 1000);
  };
}

/* ===================== ENHANCED INITIALIZATION ===================== */

/**
 * Enhanced initialization with error handling and performance monitoring
 */
function initializeEnhancedFeatures() {
  try {
    // Initialize all enhanced features
    initializeEnhancedMobileMenu();
    initializeLazyLoading();
    initializeEnhancedScrolling();
    initializeSkipLink();
    initializeFocusManagement();
    initializeLiveRegions();
    initializeNewsletterSubscription();
    
    // Enable scroll-triggered animations
    initializeScrollAnimations();
    
    // Performance monitoring
    if ('performance' in window) {
      window.addEventListener('load', () => {
        setTimeout(() => {
          const perfData = performance.getEntriesByType('navigation')[0];
          if (perfData && perfData.loadEventEnd) {
            console.log(`Page load time: ${perfData.loadEventEnd - perfData.loadEventStart}ms`);
          }
        }, 0);
      });
    }
    
    // Service Worker registration for offline support
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
          .then(registration => {
            console.log('SW registered: ', registration);
          })
          .catch(registrationError => {
            console.log('SW registration failed: ', registrationError);
          });
      });
    }
    
  } catch (error) {
    console.error('Error initializing enhanced features:', error);
  }
}

// Initialize enhanced features when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeEnhancedFeatures);
} else {
  initializeEnhancedFeatures();
}

/* ===================== NEWSLETTER SUBSCRIPTION ===================== */

/**
 * Initialize newsletter subscription functionality
 */
function initializeNewsletterSubscription() {
  const form = document.getElementById('newsletterForm');
  const emailInput = document.getElementById('newsletterEmail');
  const emailError = document.getElementById('emailError');
  const messageDiv = document.getElementById('newsletterMessage');

  if (!form || !emailInput) return;

  // Email validation function
  function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Show error message
  function showError(message) {
    emailError.textContent = message;
    emailError.classList.remove('hidden');
    emailInput.classList.add('border-red-500');
    messageDiv.classList.add('hidden');
  }

  // Hide error message
  function hideError() {
    emailError.classList.add('hidden');
    emailInput.classList.remove('border-red-500');
  }

  // Show success/error message
  function showMessage(message, isSuccess = true) {
    messageDiv.textContent = message;
    messageDiv.className = `mt-4 text-sm ${isSuccess ? 'text-green-600' : 'text-red-600'}`;
    messageDiv.classList.remove('hidden');
  }

  // Handle form submission
  form.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const email = emailInput.value.trim();
    
    // Clear previous messages
    hideError();
    messageDiv.classList.add('hidden');
    
    // Validate email
    if (!email) {
      showError('Email address is required');
      emailInput.focus();
      return;
    }
    
    if (!validateEmail(email)) {
      showError('Please enter a valid email address');
      emailInput.focus();
      return;
    }
    
    // Disable form during submission
    const submitButton = form.querySelector('button[type="submit"]');
    const originalText = submitButton.textContent;
    submitButton.disabled = true;
    submitButton.textContent = 'Subscribing...';
    
    try {
      const response = await fetch('subscribe.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email })
      });
      
      const data = await response.json();
      
      if (data.success) {
        showMessage(data.message, true);
        emailInput.value = '';
        form.reset();
      } else {
        showMessage(data.message, false);
      }
    } catch (error) {
      console.error('Newsletter subscription error:', error);
      showMessage('An error occurred. Please try again later.', false);
    } finally {
      // Re-enable form
      submitButton.disabled = false;
      submitButton.textContent = originalText;
    }
  });

  // Real-time email validation
  emailInput.addEventListener('blur', function() {
    const email = this.value.trim();
    if (email && !validateEmail(email)) {
      showError('Please enter a valid email address');
    } else {
      hideError();
    }
  });

  // Clear error on input
  emailInput.addEventListener('input', function() {
    if (this.value.trim()) {
      hideError();
    }
  });
}

// ===================== SCROLL-TRIGGERED ANIMATIONS =====================
function initializeScrollAnimations() {
  const animatedElements = document.querySelectorAll('.animate-fade-in, .animate-slide-in-up');
  if (!('IntersectionObserver' in window)) {
    // Fallback: show all if IntersectionObserver not supported
    animatedElements.forEach(el => el.style.opacity = 1);
    return;
  }
  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  animatedElements.forEach(el => {
    el.style.opacity = 0;
    observer.observe(el);
  });
} 
// Custom dropdown for API version selector - Only shows on API Reference pages
(function() {
  'use strict';

  function createVersionDropdown() {
    // Only run on API reference pages
    const currentPath = window.location.pathname;
    if (!currentPath.includes('/references/')) {
      return;
    }

    // Wait for Scalar to initialize
    const checkInterval = setInterval(() => {
      // Find the sidebar - look for common Scalar sidebar selectors
      const sidebar = document.querySelector('[data-sidebar]') || 
                     document.querySelector('[class*="sidebar"]') ||
                     document.querySelector('aside') ||
                     document.querySelector('nav');
      
      // Find the search bar - look for common search input selectors
      const searchBar = document.querySelector('input[type="search"]') ||
                       document.querySelector('input[placeholder*="Search" i]') ||
                       document.querySelector('input[placeholder*="Find" i]') ||
                       document.querySelector('[class*="search"] input') ||
                       document.querySelector('[role="search"] input');

      if (sidebar && searchBar) {
        clearInterval(checkInterval);
        
        // Check if dropdown already exists
        if (document.getElementById('api-version-selector')) {
          return;
        }
        
        // Create dropdown container
        const dropdownContainer = document.createElement('div');
        dropdownContainer.className = 'api-version-dropdown-container';
        
        // Create dropdown select
        const dropdown = document.createElement('select');
        dropdown.className = 'api-version-dropdown';
        dropdown.id = 'api-version-selector';
        dropdown.setAttribute('aria-label', 'Select API Version');
        
        // Add options - slugs are auto-generated from reference names
        // "API Reference" becomes "api-reference"
        // "API Reference v1" becomes "api-reference-v1"
        const versions = [
          { name: 'v2 (Latest)', slug: 'api-reference', default: true },
          { name: 'v1', slug: 'api-reference-v1', default: false }
          // Add v3 here when you create it:
          // { name: 'v3', slug: 'api-reference-v3', default: false }
        ];
        
        versions.forEach(version => {
          const option = document.createElement('option');
          option.value = version.slug;
          option.textContent = version.name;
          option.selected = version.default;
          dropdown.appendChild(option);
        });
        
        // Handle version change
        dropdown.addEventListener('change', function(e) {
          const selectedSlug = e.target.value;
          const currentPath = window.location.pathname;
          const hash = window.location.hash;
          
          // Navigate to the selected API reference
          const basePath = currentPath.split('/references')[0] || '';
          const newUrl = `${basePath}/references/${selectedSlug}${hash}`;
          
          window.location.href = newUrl;
        });
        
        dropdownContainer.appendChild(dropdown);
        
        // Insert after search bar in the sidebar
        const searchParent = searchBar.parentElement;
        if (searchParent) {
          // Insert dropdown container right after the search bar's parent
          searchParent.insertAdjacentElement('afterend', dropdownContainer);
        } else {
          // Fallback: insert at the beginning of sidebar
          sidebar.insertBefore(dropdownContainer, sidebar.firstChild);
        }
        
        // Update dropdown based on current URL
        function updateDropdownFromURL() {
          const currentPath = window.location.pathname;
          if (currentPath.includes('/references/')) {
            const match = currentPath.match(/\/references\/([^\/]+)/);
            if (match) {
              const currentSlug = match[1];
              // Map slugs: "api-reference" or "api-reference-v2" -> "api-reference"
              // "api-reference-v1" -> "api-reference-v1"
              if (currentSlug === 'api-reference' || currentSlug === 'api-reference-v2') {
                dropdown.value = 'api-reference';
              } else if (currentSlug === 'api-reference-v1') {
                dropdown.value = 'api-reference-v1';
              }
            }
          }
        }
        
        updateDropdownFromURL();
        
        // Listen for URL changes (for SPA navigation)
        let lastUrl = window.location.href;
        const urlCheckInterval = setInterval(() => {
          if (window.location.href !== lastUrl) {
            lastUrl = window.location.href;
            updateDropdownFromURL();
          }
        }, 100);
        
        // Clean up interval when page unloads
        window.addEventListener('beforeunload', () => {
          clearInterval(urlCheckInterval);
        });
      }
    }, 100);

    // Stop checking after 10 seconds
    setTimeout(() => {
      clearInterval(checkInterval);
    }, 10000);
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createVersionDropdown);
  } else {
    createVersionDropdown();
  }
  
  // Also run on navigation (for SPA)
  window.addEventListener('popstate', createVersionDropdown);
})();


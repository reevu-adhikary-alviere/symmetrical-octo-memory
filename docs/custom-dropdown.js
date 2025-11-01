// Custom dropdown for API version selector
(function() {
  'use strict';

  function createVersionDropdown() {
    // Wait for Scalar to initialize
    const checkInterval = setInterval(() => {
      const sidebar = document.querySelector('[data-sidebar]') || 
                     document.querySelector('.scalar-sidebar') ||
                     document.querySelector('aside') ||
                     document.querySelector('nav');
      
      const searchBar = document.querySelector('input[type="search"]') ||
                       document.querySelector('[placeholder*="Search"]') ||
                       document.querySelector('.search') ||
                       document.querySelector('[role="search"]');

      if (sidebar && searchBar) {
        clearInterval(checkInterval);
        
        // Create dropdown container
        const dropdownContainer = document.createElement('div');
        dropdownContainer.className = 'api-version-dropdown-container';
        
        // Create dropdown select
        const dropdown = document.createElement('select');
        dropdown.className = 'api-version-dropdown';
        dropdown.id = 'api-version-selector';
        dropdown.setAttribute('aria-label', 'Select API Version');
        
        // Add options - Slugs are auto-generated from reference names in scalar.config.json
        // Format: "API Reference v2" becomes "api-reference-v2"
        const versions = [
          { name: 'API Reference v2', slug: 'api-reference-v2', default: true },
          { name: 'API Reference v1', slug: 'api-reference-v1', default: false }
          // Add v3 here when you create it:
          // { name: 'API Reference v3', slug: 'api-reference-v3', default: false }
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
          // Scalar Docs uses routes like /references/api-reference-v2
          const basePath = currentPath.split('/references')[0] || '';
          const newUrl = `${basePath}/references/${selectedSlug}${hash}`;
          
          window.location.href = newUrl;
        });
        
        dropdownContainer.appendChild(dropdown);
        
        // Insert after search bar or at the top of sidebar
        if (searchBar && searchBar.parentNode) {
          // Try to insert after search bar
          const searchContainer = searchBar.closest('.search-container') || 
                                  searchBar.parentNode;
          if (searchContainer && searchContainer.nextSibling) {
            searchContainer.parentNode.insertBefore(dropdownContainer, searchContainer.nextSibling);
          } else {
            searchContainer.parentNode.appendChild(dropdownContainer);
          }
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
              dropdown.value = currentSlug;
            }
          }
        }
        
        updateDropdownFromURL();
        
        // Listen for URL changes (for SPA navigation)
        let lastUrl = window.location.href;
        setInterval(() => {
          if (window.location.href !== lastUrl) {
            lastUrl = window.location.href;
            updateDropdownFromURL();
          }
        }, 100);
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
})();


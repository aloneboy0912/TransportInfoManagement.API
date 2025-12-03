// Sidebar functionality
document.addEventListener('DOMContentLoaded', () => {
    const sidebar = document.getElementById('sidebar');
    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebarSearch = document.getElementById('sidebarSearch');

    // Toggle sidebar collapse
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', () => {
            sidebar.classList.toggle('collapsed');
            localStorage.setItem('sidebarCollapsed', sidebar.classList.contains('collapsed'));
        });
    }

    // Restore sidebar state
    if (localStorage.getItem('sidebarCollapsed') === 'true') {
        sidebar.classList.add('collapsed');
    }

    // Search functionality
    if (sidebarSearch) {
        sidebarSearch.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase().trim();
            const navSections = document.querySelectorAll('.nav-section');

            navSections.forEach(section => {
                const sectionItems = section.querySelectorAll('.nav-item');
                let hasVisibleItems = false;

                sectionItems.forEach(item => {
                    // Skip items hidden by RBAC
                    if (item.classList.contains('restricted-hidden')) {
                        return;
                    }

                    const text = item.textContent.toLowerCase();
                    const span = item.querySelector('span');

                    if (searchTerm === '') {
                        item.style.display = 'flex';
                        if (span) {
                            span.style.opacity = '1';
                            // Remove any existing highlights
                            const originalText = span.textContent.replace(/<mark[^>]*>.*?<\/mark>/gi, '');
                            span.textContent = originalText;
                        }
                        hasVisibleItems = true;
                    } else if (text.includes(searchTerm)) {
                        item.style.display = 'flex';
                        if (span) {
                            span.style.opacity = '1';
                            // Highlight matching text
                            const originalText = span.textContent.replace(/<mark[^>]*>.*?<\/mark>/gi, '');
                            const regex = new RegExp(`(${searchTerm})`, 'gi');
                            span.innerHTML = originalText.replace(regex, '<mark style="background: rgba(59, 130, 246, 0.3); color: white; padding: 0 2px; border-radius: 2px;">$1</mark>');
                        }
                        hasVisibleItems = true;
                    } else {
                        item.style.display = 'none';
                    }
                });

                // Show/hide section based on visible items
                const sectionHeader = section.querySelector('.nav-section-header');
                if (searchTerm === '') {
                    // Only show section if it has non-restricted items
                    const hasNonRestrictedItems = Array.from(sectionItems).some(item => !item.classList.contains('restricted-hidden'));
                    section.style.display = hasNonRestrictedItems ? 'block' : 'none';
                    if (sectionHeader) sectionHeader.style.display = hasNonRestrictedItems ? 'block' : 'none';
                } else {
                    section.style.display = hasVisibleItems ? 'block' : 'none';
                    if (sectionHeader) sectionHeader.style.display = hasVisibleItems ? 'block' : 'none';
                }
            });
        });

        // Clear search on escape
        sidebarSearch.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                sidebarSearch.value = '';
                sidebarSearch.dispatchEvent(new Event('input'));
                sidebarSearch.blur();
            }
        });
    }

    // Update main content margin when sidebar collapses
    const observer = new MutationObserver(() => {
        const mainContent = document.querySelector('.main-content');
        if (mainContent) {
            if (sidebar.classList.contains('collapsed')) {
                mainContent.style.marginLeft = '80px';
            } else {
                mainContent.style.marginLeft = '280px';
            }
        }
    });

    observer.observe(sidebar, {
        attributes: true,
        attributeFilter: ['class']
    });

    // Add tooltips when collapsed
    const updateTooltips = () => {
        const allNavItems = document.querySelectorAll('.nav-item');
        allNavItems.forEach(item => {
            if (sidebar.classList.contains('collapsed')) {
                const text = item.querySelector('span')?.textContent || '';
                const section = item.closest('.nav-section');
                const sectionTitle = section?.querySelector('.nav-section-title')?.textContent || '';
                item.setAttribute('title', sectionTitle ? `${sectionTitle} - ${text}` : text);
            } else {
                item.removeAttribute('title');
            }
        });
    };

    observer.observe(sidebar, {
        attributes: true,
        attributeFilter: ['class']
    });

    // Initial tooltip update
    updateTooltips();

    // Update tooltips on toggle
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', () => {
            setTimeout(updateTooltips, 300);
        });
    }
});

// Mobile menu toggle
const mobileMenuToggle = document.getElementById('mobileMenuToggle');
if (mobileMenuToggle) {
    mobileMenuToggle.addEventListener('click', () => {
        const sidebar = document.getElementById('sidebar');
        if (sidebar) {
            sidebar.classList.toggle('collapsed');
        }
    });
}

// Close sidebar on mobile when clicking outside
document.addEventListener('click', (e) => {
    const sidebar = document.getElementById('sidebar');
    const sidebarToggle = document.getElementById('sidebarToggle');
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');

    if (window.innerWidth <= 768 && sidebar &&
        !sidebar.contains(e.target) &&
        !sidebarToggle?.contains(e.target) &&
        !mobileMenuToggle?.contains(e.target)) {
        if (!sidebar.classList.contains('collapsed')) {
            sidebar.classList.add('collapsed');
        }
    }
});

// Close sidebar on mobile when route changes
document.addEventListener('click', (e) => {
    if (window.innerWidth <= 768) {
        const navItem = e.target.closest('.nav-item');
        if (navItem) {
            setTimeout(() => {
                const sidebar = document.getElementById('sidebar');
                if (sidebar && !sidebar.classList.contains('collapsed')) {
                    sidebar.classList.add('collapsed');
                }
            }, 100);
        }
    }
});


/**
 * Table of Contents Component
 * Handles the right sidebar table of contents navigation
 */

class TableOfContents {
    constructor() {
        this.currentDocument = null;
        this.activeHeading = null;
        this.headings = [];
        this.observer = null;
        
        this.init();
    }
    
    /**
     * Initialize the table of contents
     */
    init() {
        this.setupEventListeners();
    }
    
    /**
     * Generate table of contents for a document
     */
    generate(document) {
        this.currentDocument = document;
        const tocElement = document.getElementById('table-of-contents');
        if (!tocElement) return;
        
        // Wait for document body to be rendered
        setTimeout(() => {
            this.extractHeadings();
            this.renderTOC();
            this.setupScrollSpy();
        }, 100);
    }
    
    /**
     * Extract headings from document body
     */
    extractHeadings() {
        const bodyElement = document.getElementById('document-body');
        if (!bodyElement) return;
        
        const headingElements = bodyElement.querySelectorAll('h1, h2, h3, h4, h5, h6');
        this.headings = Array.from(headingElements).map((heading, index) => {
            // Ensure heading has an ID
            if (!heading.id) {
                heading.id = this.generateHeadingId(heading.textContent, index);
            }
            
            return {
                id: heading.id,
                text: heading.textContent.trim(),
                level: parseInt(heading.tagName.charAt(1)),
                element: heading,
                offsetTop: heading.offsetTop
            };
        });
    }
    
    /**
     * Generate a safe ID from heading text
     */
    generateHeadingId(text, index) {
        const baseId = text
            .toLowerCase()
            .replace(/[^\w\s-]/g, '') // Remove special characters
            .replace(/\s+/g, '-') // Replace spaces with hyphens
            .replace(/-+/g, '-') // Replace multiple hyphens with single
            .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
        
        return baseId || `heading-${index}`;
    }
    
    /**
     * Render the table of contents
     */
    renderTOC() {
        const tocElement = document.getElementById('table-of-contents');
        if (!tocElement) return;
        
        if (this.headings.length === 0) {
            tocElement.innerHTML = '<p class="toc-empty">No headings found</p>';
            return;
        }
        
        const tocList = document.createElement('ul');
        tocList.className = 'toc-list';
        
        this.headings.forEach(heading => {
            const listItem = this.createTOCItem(heading);
            tocList.appendChild(listItem);
        });
        
        tocElement.innerHTML = '';
        tocElement.appendChild(tocList);
    }
    
    /**
     * Create a table of contents item
     */
    createTOCItem(heading) {
        const listItem = document.createElement('li');
        listItem.className = 'toc-item';
        
        const link = document.createElement('a');
        link.href = `#${heading.id}`;
        link.className = `toc-link level-${heading.level}`;
        link.textContent = heading.text;
        link.dataset.headingId = heading.id;
        
        // Smooth scroll to heading
        link.addEventListener('click', (e) => {
            e.preventDefault();
            this.scrollToHeading(heading);
        });
        
        listItem.appendChild(link);
        return listItem;
    }
    
    /**
     * Scroll to a specific heading
     */
    scrollToHeading(heading) {
        const element = heading.element || document.getElementById(heading.id);
        if (!element) return;
        
        // Calculate offset for sticky header
        const headerHeight = 80; // Account for sticky header
        const elementTop = element.offsetTop - headerHeight;
        
        // Smooth scroll
        const mainContent = document.getElementById('main-content');
        if (mainContent) {
            mainContent.scrollTo({
                top: elementTop,
                behavior: 'smooth'
            });
        } else {
            window.scrollTo({
                top: elementTop,
                behavior: 'smooth'
            });
        }
        
        // Update active state
        this.setActiveHeading(heading.id);
        
        // Update URL hash
        history.replaceState(null, null, `#${heading.id}`);
    }
    
    /**
     * Set active heading in TOC
     */
    setActiveHeading(headingId) {
        this.activeHeading = headingId;
        
        // Remove active class from all links
        document.querySelectorAll('.toc-link').forEach(link => {
            link.classList.remove('active');
        });
        
        // Add active class to current link
        const activeLink = document.querySelector(`[data-heading-id="${headingId}"]`);
        if (activeLink) {
            activeLink.classList.add('active');
        }
    }
    
    /**
     * Setup scroll spy to highlight current section
     */
    setupScrollSpy() {
        // Clean up existing observer
        if (this.observer) {
            this.observer.disconnect();
        }
        
        if (this.headings.length === 0) return;
        
        const observerOptions = {
            rootMargin: '-20% 0px -35% 0px',
            threshold: 0
        };
        
        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const headingId = entry.target.id;
                
                if (entry.isIntersecting) {
                    this.setActiveHeading(headingId);
                }
            });
        }, observerOptions);
        
        // Observe all headings
        this.headings.forEach(heading => {
            if (heading.element) {
                this.observer.observe(heading.element);
            }
        });
    }
    
    /**
     * Clear table of contents
     */
    clear() {
        const tocElement = document.getElementById('table-of-contents');
        if (tocElement) {
            tocElement.innerHTML = '<p class="toc-empty">Select a document to view table of contents</p>';
        }
        
        this.headings = [];
        this.activeHeading = null;
        this.currentDocument = null;
        
        // Clean up observer
        if (this.observer) {
            this.observer.disconnect();
            this.observer = null;
        }
    }
    
    /**
     * Handle URL hash changes
     */
    handleHashChange() {
        const hash = window.location.hash.slice(1);
        if (hash && this.headings.length > 0) {
            const heading = this.headings.find(h => h.id === hash);
            if (heading) {
                setTimeout(() => {
                    this.scrollToHeading(heading);
                }, 100);
            }
        }
    }
    
    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Handle hash changes
        window.addEventListener('hashchange', () => {
            this.handleHashChange();
        });
        
        // Handle initial hash on page load
        window.addEventListener('load', () => {
            this.handleHashChange();
        });
    }
    
    /**
     * Get current active heading
     */
    getActiveHeading() {
        return this.activeHeading;
    }
    
    /**
     * Get all headings
     */
    getHeadings() {
        return [...this.headings];
    }
    
    /**
     * Jump to next heading
     */
    nextHeading() {
        if (this.headings.length === 0) return;
        
        const currentIndex = this.headings.findIndex(h => h.id === this.activeHeading);
        const nextIndex = currentIndex < this.headings.length - 1 ? currentIndex + 1 : 0;
        
        this.scrollToHeading(this.headings[nextIndex]);
    }
    
    /**
     * Jump to previous heading
     */
    previousHeading() {
        if (this.headings.length === 0) return;
        
        const currentIndex = this.headings.findIndex(h => h.id === this.activeHeading);
        const prevIndex = currentIndex > 0 ? currentIndex - 1 : this.headings.length - 1;
        
        this.scrollToHeading(this.headings[prevIndex]);
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TableOfContents;
} else {
    window.TableOfContents = TableOfContents;
}
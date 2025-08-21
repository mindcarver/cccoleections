/**
 * Navigation Tree Component
 * Handles the sidebar navigation structure and document selection
 */

class NavigationTree {
    constructor(documentService, onDocumentSelect) {
        this.documentService = documentService;
        this.onDocumentSelect = onDocumentSelect;
        this.currentLanguage = 'en';
        this.activeDocumentId = null;
        this.navigationStructure = [];
        
        this.init();
    }
    
    /**
     * Initialize the navigation tree
     */
    init() {
        this.render();
        this.setupEventListeners();
    }
    
    /**
     * Render the navigation tree
     */
    render() {
        const navElement = document.getElementById('nav-tree');
        if (!navElement) return;
        
        try {
            // Get navigation structure from document service
            this.navigationStructure = this.documentService.getNavigationStructure(this.currentLanguage);
            
            if (this.navigationStructure.length === 0) {
                navElement.innerHTML = '<div class="nav-empty">No documents available</div>';
                return;
            }
            
            navElement.innerHTML = '';
            
            this.navigationStructure.forEach(categoryGroup => {
                const categoryDiv = this.createCategorySection(categoryGroup);
                navElement.appendChild(categoryDiv);
            });
            
            // Update statistics
            this.updateStatistics();
            
        } catch (error) {
            console.error('Failed to render navigation tree:', error);
            navElement.innerHTML = '<div class="nav-error">Failed to load navigation</div>';
        }
    }
    
    /**
     * Create category section
     */
    createCategorySection(categoryGroup) {
        const { category, documents } = categoryGroup;
        
        const categoryDiv = document.createElement('div');
        categoryDiv.className = 'nav-category';
        categoryDiv.dataset.categoryId = category.id;
        
        // Category header
        const headerDiv = document.createElement('div');
        headerDiv.className = 'category-header';
        
        const iconSpan = document.createElement('span');
        iconSpan.className = 'category-icon';
        iconSpan.textContent = category.icon || '📁';
        
        const nameSpan = document.createElement('span');
        nameSpan.className = 'category-name';
        nameSpan.textContent = category.name;
        
        headerDiv.appendChild(iconSpan);
        headerDiv.appendChild(nameSpan);
        
        // Documents list
        const docsList = document.createElement('ul');
        docsList.className = 'nav-items';
        
        documents.forEach(doc => {
            const listItem = this.createDocumentItem(doc);
            docsList.appendChild(listItem);
        });
        
        categoryDiv.appendChild(headerDiv);
        categoryDiv.appendChild(docsList);
        
        return categoryDiv;
    }
    
    /**
     * Create document item
     */
    createDocumentItem(doc) {
        const listItem = document.createElement('li');
        listItem.className = 'nav-item';
        
        const link = document.createElement('a');
        link.href = '#';
        link.className = 'nav-link-item';
        link.dataset.docId = doc.id;
        link.textContent = doc.title;
        
        // Add difficulty indicator
        if (doc.difficulty) {
            const difficultySpan = document.createElement('span');
            difficultySpan.className = `difficulty-indicator difficulty-${doc.difficulty}`;
            difficultySpan.textContent = this.getDifficultyIcon(doc.difficulty);
            difficultySpan.title = `Difficulty: ${doc.difficulty}`;
            link.appendChild(difficultySpan);
        }
        
        // Add reading time
        if (doc.readingTime) {
            const timeSpan = document.createElement('span');
            timeSpan.className = 'reading-time';
            timeSpan.textContent = `${doc.readingTime}m`;
            timeSpan.title = `Reading time: ${doc.readingTime} minutes`;
            link.appendChild(timeSpan);
        }
        
        // Click handler
        link.addEventListener('click', (e) => {
            e.preventDefault();
            this.selectDocument(doc.id);
        });
        
        listItem.appendChild(link);
        return listItem;
    }
    
    /**
     * Get difficulty icon
     */
    getDifficultyIcon(difficulty) {
        const icons = {
            'beginner': '🟢',
            'intermediate': '🟡',
            'advanced': '🔴'
        };
        return icons[difficulty] || '⚪';
    }
    
    /**
     * Select a document
     */
    selectDocument(docId) {
        this.activeDocumentId = docId;
        
        // Update active state in navigation
        this.updateActiveState();
        
        // Get document and trigger callback
        const document = this.documentService.getDocumentById(docId);
        if (document && this.onDocumentSelect) {
            this.onDocumentSelect(document);
        }
    }
    
    /**
     * Update active state in navigation
     */
    updateActiveState() {
        // Remove active class from all links
        document.querySelectorAll('.nav-link-item').forEach(link => {
            link.classList.remove('active');
        });
        
        // Add active class to current document
        if (this.activeDocumentId) {
            const activeLink = document.querySelector(`[data-doc-id="${this.activeDocumentId}"]`);
            if (activeLink) {
                activeLink.classList.add('active');
            }
        }
    }
    
    /**
     * Update statistics in sidebar
     */
    updateStatistics() {
        const stats = this.documentService.getStatistics();
        
        const totalDocsElement = document.getElementById('total-docs');
        const totalCategoriesElement = document.getElementById('total-categories');
        
        if (totalDocsElement) {
            totalDocsElement.textContent = stats.totalDocuments;
        }
        
        if (totalCategoriesElement) {
            totalCategoriesElement.textContent = stats.totalCategories;
        }
    }
    
    /**
     * Filter navigation by search query
     */
    filterBySearch(query) {
        if (!query || query.trim() === '') {
            this.showAllItems();
            return;
        }
        
        const searchTerm = query.toLowerCase();
        const navItems = document.querySelectorAll('.nav-item');
        
        navItems.forEach(item => {
            const link = item.querySelector('.nav-link-item');
            const title = link.textContent.toLowerCase();
            
            if (title.includes(searchTerm)) {
                item.style.display = 'block';
            } else {
                item.style.display = 'none';
            }
        });
        
        // Hide empty categories
        document.querySelectorAll('.nav-category').forEach(category => {
            const visibleItems = category.querySelectorAll('.nav-item[style="display: block"], .nav-item:not([style])');
            const hasVisibleItems = Array.from(visibleItems).some(item => 
                !item.style.display || item.style.display !== 'none'
            );
            
            category.style.display = hasVisibleItems ? 'block' : 'none';
        });
    }
    
    /**
     * Show all navigation items
     */
    showAllItems() {
        document.querySelectorAll('.nav-item, .nav-category').forEach(item => {
            item.style.display = 'block';
        });
    }
    
    /**
     * Filter by category
     */
    filterByCategory(categoryId) {
        if (!categoryId || categoryId === 'all') {
            this.showAllItems();
            return;
        }
        
        document.querySelectorAll('.nav-category').forEach(category => {
            if (category.dataset.categoryId === categoryId) {
                category.style.display = 'block';
            } else {
                category.style.display = 'none';
            }
        });
    }
    
    /**
     * Set language and re-render
     */
    setLanguage(language) {
        this.currentLanguage = language;
        this.render();
        
        // Restore active state
        if (this.activeDocumentId) {
            this.updateActiveState();
        }
    }
    
    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Category collapse/expand (future enhancement)
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('category-header')) {
                this.toggleCategory(e.target.parentElement);
            }
        });
    }
    
    /**
     * Toggle category visibility
     */
    toggleCategory(categoryElement) {
        const docsList = categoryElement.querySelector('.nav-items');
        if (docsList) {
            const isVisible = docsList.style.display !== 'none';
            docsList.style.display = isVisible ? 'none' : 'block';
            categoryElement.classList.toggle('collapsed', isVisible);
        }
    }
    
    /**
     * Get current active document ID
     */
    getActiveDocumentId() {
        return this.activeDocumentId;
    }
    
    /**
     * Highlight document in navigation
     */
    highlightDocument(docId) {
        this.selectDocument(docId);
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NavigationTree;
} else {
    window.NavigationTree = NavigationTree;
}
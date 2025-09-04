/**
 * Filter Component for Claude Code Features Collection
 */

class FilterComponent {
    constructor(onFilterCallback) {
        this.onFilterCallback = onFilterCallback;
        this.filters = {
            category: 'all',
            status: 'all',
            sort: 'name'
        };
        
        // DOM elements
        this.categoryFilter = null;
        this.statusFilter = null;
        this.sortSelect = null;
        this.clearButton = null;
        
        this.init();
    }
    
    init() {
        this.categoryFilter = document.getElementById('category-filter');
        this.statusFilter = document.getElementById('status-filter');
        this.sortSelect = document.getElementById('sort-select');
        this.clearButton = document.getElementById('clear-filters');
        
        this.bindEvents();
        console.log('✅ Filter component initialized');
    }
    
    bindEvents() {
        // Category filter
        if (this.categoryFilter) {
            this.categoryFilter.addEventListener('change', (e) => {
                this.updateFilter('category', e.target.value);
            });
        }
        
        // Status filter
        if (this.statusFilter) {
            this.statusFilter.addEventListener('change', (e) => {
                this.updateFilter('status', e.target.value);
            });
        }
        
        // Sort select
        if (this.sortSelect) {
            this.sortSelect.addEventListener('change', (e) => {
                this.updateFilter('sort', e.target.value);
            });
        }
        
        // Clear button
        if (this.clearButton) {
            this.clearButton.addEventListener('click', () => {
                this.clearAllFilters();
            });
        }
    }
    
    updateFilter(filterType, value) {
        this.filters[filterType] = value;
        this.triggerFilterChange();
        this.updateClearButtonState();
    }
    
    initializeCategories(categories) {
        if (!this.categoryFilter) return;
        
        // Clear existing options except "All"
        const allOption = this.categoryFilter.querySelector('[value="all"]');
        this.categoryFilter.innerHTML = '';
        if (allOption) {
            this.categoryFilter.appendChild(allOption);
        } else {
            const defaultOption = document.createElement('option');
            defaultOption.value = 'all';
            defaultOption.textContent = 'All Categories';
            defaultOption.setAttribute('data-i18n', 'filters.all');
            this.categoryFilter.appendChild(defaultOption);
        }
        
        // Add category options
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = this.getCategoryDisplayName(category);
            this.categoryFilter.appendChild(option);
        });
    }
    
    getCategoryDisplayName(categoryId) {
        const categoryNames = {
            'core': 'Core Features',
            'interactive': 'Interactive',
            'ai-finance': 'AI Finance',
            'agents': 'Agents',
            'integrations': 'Integrations',
            'customization': 'Customization',
            'configuration': 'Configuration',
            'workflow': 'Workflow',
            'tools': 'Tools',
            'optimization': 'Optimization',
            'deployment': 'Deployment',
            'development': 'Development',
            'collaboration': 'Collaboration',
            'enterprise': 'Enterprise',
            'platform': 'Platform',
            'analysis': 'Analysis'
        };
        
        return categoryNames[categoryId] || categoryId;
    }
    
    triggerFilterChange() {
        if (this.onFilterCallback) {
            this.onFilterCallback(this.filters);
        }
    }
    
    updateClearButtonState() {
        if (!this.clearButton) return;
        
        const hasActiveFilters = 
            this.filters.category !== 'all' || 
            this.filters.status !== 'all' ||
            this.filters.sort !== 'name';
        
        this.clearButton.disabled = !hasActiveFilters;
        this.clearButton.style.opacity = hasActiveFilters ? '1' : '0.5';
    }
    
    clearAllFilters() {
        // Reset all filters
        this.filters = {
            category: 'all',
            status: 'all',
            sort: 'name'
        };
        
        // Update UI
        if (this.categoryFilter) this.categoryFilter.value = 'all';
        if (this.statusFilter) this.statusFilter.value = 'all';
        if (this.sortSelect) this.sortSelect.value = 'name';
        
        this.triggerFilterChange();
        this.updateClearButtonState();
    }
    
    getCurrentFilters() {
        return { ...this.filters };
    }
    
    setFilters(newFilters) {
        this.filters = { ...this.filters, ...newFilters };
        
        // Update UI elements
        if (this.categoryFilter && newFilters.category) {
            this.categoryFilter.value = newFilters.category;
        }
        if (this.statusFilter && newFilters.status) {
            this.statusFilter.value = newFilters.status;
        }
        if (this.sortSelect && newFilters.sort) {
            this.sortSelect.value = newFilters.sort;
        }
        
        this.triggerFilterChange();
        this.updateClearButtonState();
    }
    
    clear() {
        this.clearAllFilters();
    }
    
    destroy() {
        // Remove event listeners
        if (this.categoryFilter) {
            this.categoryFilter.removeEventListener('change', this.updateFilter);
        }
        if (this.statusFilter) {
            this.statusFilter.removeEventListener('change', this.updateFilter);
        }
        if (this.sortSelect) {
            this.sortSelect.removeEventListener('change', this.updateFilter);
        }
        if (this.clearButton) {
            this.clearButton.removeEventListener('click', this.clearAllFilters);
        }
        
        // Clear references
        this.categoryFilter = null;
        this.statusFilter = null;
        this.sortSelect = null;
        this.clearButton = null;
        this.onFilterCallback = null;
        
        console.log('🗑️ Filter component destroyed');
    }
}

window.FilterComponent = FilterComponent;
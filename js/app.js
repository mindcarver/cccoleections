/**
 * Claude Code Features Collection - Main Application
 * Entry point and application initialization
 */

class ClaudeCodeFeaturesApp {
    constructor() {
        this.initialized = false;
        this.features = [];
        this.filteredFeatures = [];
        this.currentLanguage = 'en';
        this.currentTheme = 'light';
        
        // Service instances
        this.dataService = null;
        this.i18nService = null;
        
        // Component instances
        this.cardComponent = null;
        this.modalComponent = null;
        this.searchComponent = null;
        this.filterComponent = null;
        
        // DOM elements
        this.elements = {
            featuresGrid: null,
            loadingState: null,
            emptyState: null,
            stats: {
                total: null,
                categories: null,
                new: null
            }
        };
        
        this.init();
    }
    
    /**
     * Initialize the application
     */
    async init() {
        try {
            console.log('🚀 Initializing Claude Code Features App...');
            
            // Initialize DOM elements
            this.initializeElements();
            
            // Initialize theme
            this.initializeTheme();
            
            // Initialize services
            await this.initializeServices();
            
            // Initialize components
            this.initializeComponents();
            
            // Load and display features
            await this.loadFeatures();
            
            // Initialize event listeners
            this.initializeEventListeners();
            
            this.initialized = true;
            console.log('✅ Application initialized successfully');
            
        } catch (error) {
            console.error('❌ Failed to initialize application:', error);
            this.showError('Failed to initialize application. Please refresh the page.');
        }
    }
    
    /**
     * Initialize DOM element references
     */
    initializeElements() {
        this.elements = {
            featuresGrid: document.getElementById('features-grid'),
            loadingState: document.getElementById('loading-state'),
            emptyState: document.getElementById('empty-state'),
            stats: {
                total: document.getElementById('total-features'),
                categories: document.getElementById('total-categories'),
                new: document.getElementById('new-features')
            }
        };
        
        // Validate required elements
        const requiredElements = [
            'featuresGrid', 'loadingState', 'emptyState'
        ];
        
        for (const elementKey of requiredElements) {
            if (!this.elements[elementKey]) {
                throw new Error(`Required element not found: ${elementKey}`);
            }
        }
    }
    
    /**
     * Initialize theme system
     */
    initializeTheme() {
        // Load saved theme preference
        const savedTheme = localStorage.getItem('claude-code-theme') || 'light';
        this.setTheme(savedTheme);
        
        // Initialize theme switcher
        const themeSwitcher = document.getElementById('theme-switcher');
        if (themeSwitcher) {
            themeSwitcher.addEventListener('click', () => {
                this.toggleTheme();
            });
        }
    }
    
    /**
     * Initialize services
     */
    async initializeServices() {
        // Initialize data service
        this.dataService = new DataService();
        
        // Initialize i18n service
        this.i18nService = new I18nService();
        await this.i18nService.init();
        
        // Set initial language
        const savedLanguage = localStorage.getItem('claude-code-language') || 'en';
        await this.setLanguage(savedLanguage);
    }
    
    /**
     * Initialize UI components
     */
    initializeComponents() {
        // Initialize modal component
        this.modalComponent = new ModalComponent();
        
        // Initialize card component
        this.cardComponent = new CardComponent(this.modalComponent);
        
        // Initialize search component
        this.searchComponent = new SearchComponent((query) => {
            this.handleSearch(query);
        });
        
        // Initialize filter component
        this.filterComponent = new FilterComponent((filters) => {
            this.handleFilter(filters);
        });
    }
    
    /**
     * Load features data
     */
    async loadFeatures() {
        try {
            this.showLoading(true);
            
            // Load features data
            this.features = await this.dataService.getAllFeatures();
            this.filteredFeatures = [...this.features];
            
            // Render features
            this.renderFeatures();
            
            // Update statistics
            this.updateStatistics();
            
            // Initialize filters with categories
            this.filterComponent.initializeCategories(this.getCategories());
            
            this.showLoading(false);
            
        } catch (error) {
            console.error('Failed to load features:', error);
            this.showError('Failed to load features. Please refresh the page.');
            this.showLoading(false);
        }
    }
    
    /**
     * Render features in the grid
     */
    renderFeatures() {
        if (!this.elements.featuresGrid) return;
        
        // Clear existing content
        this.elements.featuresGrid.innerHTML = '';
        
        // Show empty state if no features
        if (this.filteredFeatures.length === 0) {
            this.showEmptyState(true);
            return;
        }
        
        this.showEmptyState(false);
        
        // Render feature cards
        this.filteredFeatures.forEach((feature, index) => {
            const cardElement = this.cardComponent.render(feature, this.currentLanguage);
            this.elements.featuresGrid.appendChild(cardElement);
            
            // Add stagger animation delay
            cardElement.style.animationDelay = `${index * 50}ms`;
        });
    }
    
    /**
     * Handle search query
     */
    handleSearch(query) {
        if (!query.trim()) {
            this.filteredFeatures = [...this.features];
        } else {
            this.filteredFeatures = this.dataService.searchFeatures(this.features, query, this.currentLanguage);
        }
        
        // Apply current filters if any
        this.applyCurrentFilters();
        
        this.renderFeatures();
        this.updateStatistics();
    }
    
    /**
     * Handle filter changes
     */
    handleFilter(filters) {
        this.filteredFeatures = this.dataService.filterFeatures(this.features, filters);
        
        // Apply current search if any
        const currentSearchQuery = this.searchComponent.getCurrentQuery();
        if (currentSearchQuery) {
            this.filteredFeatures = this.dataService.searchFeatures(
                this.filteredFeatures, 
                currentSearchQuery, 
                this.currentLanguage
            );
        }
        
        this.renderFeatures();
        this.updateStatistics();
    }
    
    /**
     * Apply current active filters
     */
    applyCurrentFilters() {
        const currentFilters = this.filterComponent.getCurrentFilters();
        if (Object.keys(currentFilters).length > 0) {
            this.filteredFeatures = this.dataService.filterFeatures(this.filteredFeatures, currentFilters);
        }
    }
    
    /**
     * Update statistics display
     */
    updateStatistics() {
        const stats = this.calculateStatistics();
        
        if (this.elements.stats.total) {
            this.elements.stats.total.textContent = stats.total;
        }
        if (this.elements.stats.categories) {
            this.elements.stats.categories.textContent = stats.categories;
        }
        if (this.elements.stats.new) {
            this.elements.stats.new.textContent = stats.new;
        }
    }
    
    /**
     * Calculate statistics from features data
     */
    calculateStatistics() {
        const categories = this.getCategories();
        const newFeatures = this.features.filter(f => f.status === 'new');
        
        return {
            total: this.features.length,
            categories: categories.length,
            new: newFeatures.length
        };
    }
    
    /**
     * Get unique categories from features
     */
    getCategories() {
        const categories = new Set();
        this.features.forEach(feature => {
            if (feature.category) {
                categories.add(feature.category);
            }
        });
        return Array.from(categories);
    }
    
    /**
     * Toggle application theme
     */
    toggleTheme() {
        const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.setTheme(newTheme);
    }
    
    /**
     * Set application theme
     */
    setTheme(theme) {
        this.currentTheme = theme;
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('claude-code-theme', theme);
        
        // Update theme switcher icon
        const themeSwitcher = document.getElementById('theme-switcher');
        if (themeSwitcher) {
            const icon = themeSwitcher.querySelector('.theme-icon');
            if (icon) {
                icon.textContent = theme === 'light' ? '🌙' : '☀️';
            }
        }
    }
    
    /**
     * Set application language
     */
    async setLanguage(language) {
        this.currentLanguage = language;
        localStorage.setItem('claude-code-language', language);
        
        // Update language switcher
        this.updateLanguageSwitcher(language);
        
        // Apply translations
        await this.i18nService.setLanguage(language);
        
        // Re-render features if already loaded
        if (this.features.length > 0) {
            this.renderFeatures();
        }
    }
    
    /**
     * Update language switcher active state
     */
    updateLanguageSwitcher(language) {
        const langButtons = document.querySelectorAll('.lang-btn');
        langButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.lang === language);
        });
    }
    
    /**
     * Initialize global event listeners
     */
    initializeEventListeners() {
        // Language switcher
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('lang-btn')) {
                const language = e.target.dataset.lang;
                if (language && language !== this.currentLanguage) {
                    this.setLanguage(language);
                }
            }
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            this.handleKeyboardShortcuts(e);
        });
        
        // Window resize
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                this.handleWindowResize();
            }, 250);
        });
        
        // Clear filters button
        const clearFiltersBtn = document.getElementById('clear-filters');
        if (clearFiltersBtn) {
            clearFiltersBtn.addEventListener('click', () => {
                this.clearAllFilters();
            });
        }
        
        // Error handling
        window.addEventListener('error', (e) => {
            console.error('Global error:', e);
        });
        
        window.addEventListener('unhandledrejection', (e) => {
            console.error('Unhandled promise rejection:', e);
        });
    }
    
    /**
     * Handle keyboard shortcuts
     */
    handleKeyboardShortcuts(e) {
        // Ctrl/Cmd + K: Focus search
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            this.searchComponent.focus();
        }
        
        // Escape: Close modal
        if (e.key === 'Escape') {
            this.modalComponent.close();
        }
        
        // Ctrl/Cmd + D: Toggle theme
        if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
            e.preventDefault();
            this.toggleTheme();
        }
    }
    
    /**
     * Handle window resize
     */
    handleWindowResize() {
        // Re-calculate any responsive elements if needed
        // This is a placeholder for future responsive adjustments
    }
    
    /**
     * Clear all filters and search
     */
    clearAllFilters() {
        this.searchComponent.clear();
        this.filterComponent.clear();
        this.filteredFeatures = [...this.features];
        this.renderFeatures();
        this.updateStatistics();
    }
    
    /**
     * Show/hide loading state
     */
    showLoading(show) {
        if (this.elements.loadingState) {
            this.elements.loadingState.style.display = show ? 'block' : 'none';
        }
        if (this.elements.featuresGrid) {
            this.elements.featuresGrid.style.display = show ? 'none' : 'grid';
        }
    }
    
    /**
     * Show/hide empty state
     */
    showEmptyState(show) {
        if (this.elements.emptyState) {
            this.elements.emptyState.style.display = show ? 'block' : 'none';
        }
    }
    
    /**
     * Show error message
     */
    showError(message) {
        // Simple error display - could be enhanced with a toast system
        console.error('App Error:', message);
        
        // For now, show alert - in production, use a toast/notification system
        if (confirm(`Error: ${message}\n\nWould you like to reload the page?`)) {
            window.location.reload();
        }
    }
    
    /**
     * Get current application state
     */
    getState() {
        return {
            initialized: this.initialized,
            featuresCount: this.features.length,
            filteredCount: this.filteredFeatures.length,
            currentLanguage: this.currentLanguage,
            currentTheme: this.currentTheme
        };
    }
}

/**
 * Initialize application when DOM is ready
 */
document.addEventListener('DOMContentLoaded', () => {
    console.log('🌟 Claude Code Features Collection');
    console.log('📍 DOM Content Loaded - Starting App...');
    
    // Initialize app
    window.claudeCodeApp = new ClaudeCodeFeaturesApp();
    
    // Development helpers
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        console.log('🔧 Development mode enabled');
        window.app = window.claudeCodeApp; // Global access for debugging
    }
});

/**
 * Handle page visibility changes for performance optimization
 */
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        console.log('📴 Page hidden - pausing non-critical operations');
    } else {
        console.log('👁 Page visible - resuming operations');
    }
});

/**
 * Performance monitoring
 */
window.addEventListener('load', () => {
    if ('performance' in window) {
        const loadTime = performance.now();
        console.log(`⚡ Page loaded in ${Math.round(loadTime)}ms`);
        
        // Log performance metrics
        setTimeout(() => {
            const navigation = performance.getEntriesByType('navigation')[0];
            if (navigation) {
                console.log('📊 Performance Metrics:', {
                    DNS: Math.round(navigation.domainLookupEnd - navigation.domainLookupStart),
                    Connect: Math.round(navigation.connectEnd - navigation.connectStart),
                    Request: Math.round(navigation.responseStart - navigation.requestStart),
                    Response: Math.round(navigation.responseEnd - navigation.responseStart),
                    DOM: Math.round(navigation.domContentLoadedEventEnd - navigation.responseEnd),
                    Load: Math.round(navigation.loadEventEnd - navigation.loadEventStart)
                });
            }
        }, 0);
    }
});
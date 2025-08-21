/**
 * Claude Code Documentation Hub - Main Application Controller
 * Coordinates all components and manages application state
 */

class DocsApp {
    constructor() {
        // Service instances
        this.documentService = null;
        this.i18nService = null;
        
        // Component instances
        this.documentViewer = null;
        this.navigationTree = null;
        this.tableOfContents = null;
        this.documentSearch = null;
        
        // Application state
        this.currentLanguage = 'en';
        this.currentDocument = null;
        this.mobileMenuOpen = false;
        this.initialized = false;
        
        // Event handlers bound to this instance
        this.boundHandlers = {
            onResize: this.handleResize.bind(this),
            onPopState: this.handlePopState.bind(this),
            onKeydown: this.handleKeydown.bind(this)
        };
    }
    
    /**
     * Initialize the application
     */
    async init() {
        if (this.initialized) return;
        
        console.log('🚀 Initializing Claude Code Documentation Hub...');
        
        try {
            // Show loading state
            this.showGlobalLoading(true);
            
            // Initialize services
            await this.initializeServices();
            
            // Initialize components
            await this.initializeComponents();
            
            // Setup UI interactions
            this.setupUI();
            
            // Handle initial URL routing
            this.handleInitialRoute();
            
            // Setup global event listeners
            this.setupGlobalEventListeners();
            
            this.initialized = true;
            console.log('✅ Documentation Hub initialized successfully');
            
            // Hide loading state
            this.showGlobalLoading(false);
            
        } catch (error) {
            console.error('❌ Failed to initialize Documentation Hub:', error);
            this.showInitializationError(error.message);
        }
    }
    
    /**
     * Initialize all services
     */
    async initializeServices() {
        console.log('📦 Initializing services...');
        
        // Initialize DocumentService
        this.documentService = new DocumentService();
        await this.documentService.init();
        
        // Initialize I18nService
        this.i18nService = new I18nService();
        await this.i18nService.init();
        
        // Listen for language changes
        this.i18nService.addLanguageChangeObserver((newLang, prevLang) => {
            this.handleLanguageChange(newLang, prevLang);
        });
        
        this.currentLanguage = this.i18nService.getCurrentLanguage();
        console.log('✅ Services initialized');
    }
    
    /**
     * Initialize all components
     */
    async initializeComponents() {
        console.log('🧩 Initializing components...');
        
        // Initialize DocumentViewer
        this.documentViewer = new DocumentViewer();
        
        // Initialize NavigationTree
        this.navigationTree = new NavigationTree(
            this.documentService, 
            (document) => this.displayDocument(document)
        );
        
        // Initialize TableOfContents
        this.tableOfContents = new TableOfContents();
        
        // Initialize DocumentSearch
        this.documentSearch = new DocumentSearch(
            this.documentService,
            this.navigationTree,
            this.documentViewer
        );
        
        // Set initial language for all components
        this.setComponentLanguages(this.currentLanguage);
        
        console.log('✅ Components initialized');
    }
    
    /**
     * Setup UI interactions and event handlers
     */
    setupUI() {
        console.log('🎨 Setting up UI interactions...');
        
        // Language switcher buttons
        this.setupLanguageSwitcher();
        
        // Theme switcher
        this.setupThemeSwitcher();
        
        // Mobile menu toggle
        this.setupMobileMenu();
        
        // Welcome page interactions
        this.setupWelcomePageInteractions();
        
        console.log('✅ UI interactions setup complete');
    }
    
    /**
     * Setup language switcher functionality
     */
    setupLanguageSwitcher() {
        const langButtons = document.querySelectorAll('.lang-btn');
        
        langButtons.forEach(button => {
            button.addEventListener('click', async () => {
                const language = button.dataset.lang;
                await this.changeLanguage(language);
                
                // Update button states
                langButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
            });
        });
    }
    
    /**
     * Setup theme switcher functionality
     */
    setupThemeSwitcher() {
        const themeButton = document.getElementById('theme-switcher');
        if (!themeButton) return;
        
        // Load saved theme or default to light
        const savedTheme = Utils.localStorage.get('docs-theme', 'light');
        this.setTheme(savedTheme);
        
        themeButton.addEventListener('click', () => {
            const currentTheme = document.body.dataset.theme || 'light';
            const newTheme = currentTheme === 'light' ? 'dark' : 'light';
            this.setTheme(newTheme);
        });
    }
    
    /**
     * Setup mobile menu functionality
     */
    setupMobileMenu() {
        const mobileToggle = document.getElementById('mobile-menu-toggle');
        const sidebar = document.getElementById('sidebar');
        
        if (!mobileToggle || !sidebar) return;
        
        mobileToggle.addEventListener('click', () => {
            this.toggleMobileMenu();
        });
        
        // Close mobile menu when clicking outside
        document.addEventListener('click', (e) => {
            if (this.mobileMenuOpen && 
                !sidebar.contains(e.target) && 
                !mobileToggle.contains(e.target)) {
                this.closeMobileMenu();
            }
        });
        
        // Close mobile menu on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.mobileMenuOpen) {
                this.closeMobileMenu();
            }
        });
    }
    
    /**
     * Setup welcome page interactions
     */
    setupWelcomePageInteractions() {
        // Quick start links
        const quickStartLinks = document.querySelectorAll('[data-doc]');
        quickStartLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const docId = link.dataset.doc;
                if (docId) {
                    this.navigateToDocument(docId);
                }
            });
        });
        
        // Category browsing links
        const categoryLinks = document.querySelectorAll('[data-category]');
        categoryLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const categoryId = link.dataset.category;
                if (categoryId) {
                    this.browseCategory(categoryId);
                }
            });
        });
        
        // Populate recent updates
        this.populateRecentUpdates();
    }
    
    /**
     * Populate recent updates section
     */
    populateRecentUpdates() {
        const recentUpdatesList = document.getElementById('recent-updates-list');
        if (!recentUpdatesList) return;
        
        try {
            const recentDocs = this.documentService.getRecentDocuments(3);
            
            if (recentDocs.length === 0) {
                recentUpdatesList.innerHTML = '<li>No recent updates available</li>';
                return;
            }
            
            recentUpdatesList.innerHTML = recentDocs.map(doc => {
                const title = doc.title[this.currentLanguage] || doc.title.en;
                const date = Utils.formatDate(doc.source.lastUpdated);
                return `<li><a href="#" data-doc="${doc.id}">${title}</a> - ${date}</li>`;
            }).join('');
            
            // Add click handlers to recent update links
            recentUpdatesList.querySelectorAll('[data-doc]').forEach(link => {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    const docId = link.dataset.doc;
                    this.navigateToDocument(docId);
                });
            });
            
        } catch (error) {
            console.error('Failed to populate recent updates:', error);
            recentUpdatesList.innerHTML = '<li>Failed to load recent updates</li>';
        }
    }
    
    /**
     * Setup global event listeners
     */
    setupGlobalEventListeners() {
        window.addEventListener('resize', this.boundHandlers.onResize);
        window.addEventListener('popstate', this.boundHandlers.onPopState);
        document.addEventListener('keydown', this.boundHandlers.onKeydown);
    }
    
    /**
     * Handle initial URL routing
     */
    handleInitialRoute() {
        const urlParams = Utils.getUrlParams();
        
        if (urlParams.doc) {
            // Navigate to specific document
            this.navigateToDocument(urlParams.doc);
        } else if (urlParams.category) {
            // Browse specific category
            this.browseCategory(urlParams.category);
        } else {
            // Show welcome page
            this.showWelcomePage();
        }
    }
    
    /**
     * Navigate to a specific document
     */
    async navigateToDocument(docId) {
        try {
            const document = this.documentService.getDocumentById(docId);
            
            if (!document) {
                console.warn(`Document not found: ${docId}`);
                this.showDocumentNotFound(docId);
                return;
            }
            
            await this.displayDocument(document);
            
            // Update URL
            Utils.setUrlParam('doc', docId);
            
            // Close mobile menu if open
            this.closeMobileMenu();
            
        } catch (error) {
            console.error(`Failed to navigate to document ${docId}:`, error);
            this.showDocumentError(error.message);
        }
    }
    
    /**
     * Browse documents in a category
     */
    browseCategory(categoryId) {
        try {
            // Filter navigation tree by category
            this.navigationTree.filterByCategory(categoryId);
            
            // Update URL
            Utils.setUrlParam('category', categoryId);
            
            // Show welcome page with filtered navigation
            this.showWelcomePage();
            
            // Close mobile menu if open
            this.closeMobileMenu();
            
        } catch (error) {
            console.error(`Failed to browse category ${categoryId}:`, error);
        }
    }
    
    /**
     * Display a document
     */
    async displayDocument(document) {
        try {
            this.currentDocument = document;
            
            // Render document in viewer
            await this.documentViewer.renderDocument(document, this.currentLanguage);
            
            // Generate table of contents
            this.tableOfContents.generate(document);
            
            // Update navigation tree active state
            this.navigationTree.highlightDocument(document.id);
            
            console.log(`📄 Displayed document: ${document.id}`);
            
        } catch (error) {
            console.error('Failed to display document:', error);
            this.showDocumentError(error.message);
        }
    }
    
    /**
     * Show welcome page
     */
    showWelcomePage() {
        this.documentViewer.showWelcomeContent();
        this.tableOfContents.clear();
        this.currentDocument = null;
        
        // Clear URL parameters
        Utils.setUrlParam('doc', '');
        
        // Reset navigation filter
        this.navigationTree.showAllItems();
    }
    
    /**
     * Change application language
     */
    async changeLanguage(language) {
        try {
            // Update i18n service
            await this.i18nService.setLanguage(language);
            
        } catch (error) {
            console.error(`Failed to change language to ${language}:`, error);
        }
    }
    
    /**
     * Handle language change
     */
    handleLanguageChange(newLanguage, previousLanguage) {
        this.currentLanguage = newLanguage;
        
        // Update all components
        this.setComponentLanguages(newLanguage);
        
        // Re-render current document if any
        if (this.currentDocument) {
            this.documentViewer.renderDocument(this.currentDocument, newLanguage);
        }
        
        // Update welcome page content
        this.populateRecentUpdates();
        
        console.log(`🌐 Language changed from ${previousLanguage} to ${newLanguage}`);
    }
    
    /**
     * Set language for all components
     */
    setComponentLanguages(language) {
        if (this.documentViewer) {
            this.documentViewer.setLanguage(language);
        }
        
        if (this.navigationTree) {
            this.navigationTree.setLanguage(language);
        }
        
        if (this.documentSearch) {
            this.documentSearch.setLanguage(language);
        }
    }
    
    /**
     * Set application theme
     */
    setTheme(theme) {
        document.body.dataset.theme = theme;
        
        // Save theme preference
        Utils.localStorage.set('docs-theme', theme);
        
        // Update theme switcher icon
        const themeIcon = document.querySelector('.theme-icon');
        if (themeIcon) {
            themeIcon.textContent = theme === 'light' ? '🌙' : '☀️';
        }
        
        console.log(`🎨 Theme changed to: ${theme}`);
    }
    
    /**
     * Toggle mobile menu
     */
    toggleMobileMenu() {
        this.mobileMenuOpen = !this.mobileMenuOpen;
        
        const sidebar = document.getElementById('sidebar');
        if (sidebar) {
            sidebar.classList.toggle('mobile-open', this.mobileMenuOpen);
        }
        
        // Update toggle button state
        const toggle = document.getElementById('mobile-menu-toggle');
        if (toggle) {
            toggle.setAttribute('aria-expanded', this.mobileMenuOpen.toString());
        }
    }
    
    /**
     * Close mobile menu
     */
    closeMobileMenu() {
        if (!this.mobileMenuOpen) return;
        
        this.mobileMenuOpen = false;
        
        const sidebar = document.getElementById('sidebar');
        if (sidebar) {
            sidebar.classList.remove('mobile-open');
        }
        
        const toggle = document.getElementById('mobile-menu-toggle');
        if (toggle) {
            toggle.setAttribute('aria-expanded', 'false');
        }
    }
    
    /**
     * Handle window resize
     */
    handleResize() {
        // Close mobile menu on desktop
        if (window.innerWidth >= 768 && this.mobileMenuOpen) {
            this.closeMobileMenu();
        }
    }
    
    /**
     * Handle browser back/forward navigation
     */
    handlePopState() {
        this.handleInitialRoute();
    }
    
    /**
     * Handle global keyboard shortcuts
     */
    handleKeydown(e) {
        // Search shortcut (Ctrl/Cmd + K) is handled in DocumentSearch
        
        // Home shortcut (Escape)
        if (e.key === 'Escape' && !this.mobileMenuOpen) {
            this.showWelcomePage();
        }
    }
    
    /**
     * Show global loading state
     */
    showGlobalLoading(show) {
        const loading = document.getElementById('content-loading');
        if (loading) {
            loading.style.display = show ? 'flex' : 'none';
        }
    }
    
    /**
     * Show initialization error
     */
    showInitializationError(message) {
        const mainContent = document.getElementById('main-content');
        if (mainContent) {
            mainContent.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">⚠️</div>
                    <h3>Initialization Failed</h3>
                    <p>${Utils.escapeHtml(message)}</p>
                    <button class="button-primary" onclick="window.location.reload()">
                        Reload Page
                    </button>
                </div>
            `;
        }
    }
    
    /**
     * Show document not found error
     */
    showDocumentNotFound(docId) {
        this.documentViewer.showError(`Document "${docId}" not found`);
    }
    
    /**
     * Show document error
     */
    showDocumentError(message) {
        this.documentViewer.showError(message);
    }
    
    /**
     * Get application statistics
     */
    getStats() {
        return {
            initialized: this.initialized,
            currentLanguage: this.currentLanguage,
            currentDocument: this.currentDocument?.id || null,
            mobileMenuOpen: this.mobileMenuOpen,
            documentService: this.documentService?.getStatistics() || null,
            i18nService: this.i18nService?.getStats() || null,
            searchService: this.documentSearch?.getSearchStats() || null
        };
    }
    
    /**
     * Cleanup and destroy the application
     */
    destroy() {
        // Remove global event listeners
        window.removeEventListener('resize', this.boundHandlers.onResize);
        window.removeEventListener('popstate', this.boundHandlers.onPopState);
        document.removeEventListener('keydown', this.boundHandlers.onKeydown);
        
        // Clear services
        if (this.documentService) {
            this.documentService.clearCache();
        }
        
        if (this.i18nService) {
            this.i18nService.clearCache();
        }
        
        // Reset state
        this.initialized = false;
        this.currentDocument = null;
        this.mobileMenuOpen = false;
        
        console.log('🧹 Documentation Hub destroyed');
    }
}

// Initialize the application when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
    window.docsApp = new DocsApp();
    await window.docsApp.init();
});

// Handle page unload
window.addEventListener('beforeunload', () => {
    if (window.docsApp) {
        window.docsApp.destroy();
    }
});

// Export for debugging purposes
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DocsApp;
} else {
    window.DocsApp = DocsApp;
}
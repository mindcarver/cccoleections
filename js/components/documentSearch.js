/**
 * Document Search Component
 * Handles intelligent document search with suggestions and filtering
 */

class DocumentSearch {
    constructor(documentService, navigationTree, documentViewer) {
        this.documentService = documentService;
        this.navigationTree = navigationTree;
        this.documentViewer = documentViewer;
        this.currentLanguage = 'en';
        this.searchCache = new Map();
        this.searchHistory = [];
        this.maxHistorySize = 10;
        
        this.init();
    }
    
    /**
     * Initialize the search component
     */
    init() {
        this.setupEventListeners();
        this.loadSearchHistory();
    }
    
    /**
     * Setup event listeners for search inputs
     */
    setupEventListeners() {
        // Sidebar search
        const sidebarSearch = document.getElementById('sidebar-search-input');
        if (sidebarSearch) {
            sidebarSearch.addEventListener('input', (e) => {
                this.handleSearchInput(e.target.value);
            });
            
            sidebarSearch.addEventListener('keydown', (e) => {
                this.handleSearchKeydown(e);
            });
            
            sidebarSearch.addEventListener('focus', () => {
                this.showSuggestions();
            });
            
            sidebarSearch.addEventListener('blur', () => {
                // Delay hiding to allow clicking on suggestions
                setTimeout(() => this.hideSuggestions(), 150);
            });
        }
        
        // Header search (mobile)
        const headerSearch = document.getElementById('header-search-input');
        if (headerSearch) {
            headerSearch.addEventListener('input', (e) => {
                this.handleSearchInput(e.target.value);
            });
            
            headerSearch.addEventListener('keydown', (e) => {
                this.handleSearchKeydown(e);
            });
        }
        
        // Search suggestions click handling
        document.addEventListener('click', (e) => {
            if (e.target.closest('.search-suggestion')) {
                this.handleSuggestionClick(e.target.closest('.search-suggestion'));
            }
        });
        
        // Global keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + K to focus search
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                this.focusSearch();
            }
            
            // Escape to clear search
            if (e.key === 'Escape') {
                this.clearSearch();
            }
        });
    }
    
    /**
     * Handle search input changes
     */
    handleSearchInput(query) {
        const trimmedQuery = query.trim();
        
        if (trimmedQuery === '') {
            this.clearSearchResults();
            this.showAllDocuments();
            this.hideSuggestions();
            return;
        }
        
        // Debounce search
        clearTimeout(this.searchTimeout);
        this.searchTimeout = setTimeout(() => {
            this.performSearch(trimmedQuery);
        }, 300);
        
        // Show suggestions immediately for short queries
        if (trimmedQuery.length >= 2) {
            this.showSearchSuggestions(trimmedQuery);
        }
    }
    
    /**
     * Handle keyboard navigation in search
     */
    handleSearchKeydown(e) {
        const suggestions = document.querySelectorAll('.search-suggestion');
        const activeSuggestion = document.querySelector('.search-suggestion.active');
        
        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                this.navigateSuggestions('down', suggestions, activeSuggestion);
                break;
                
            case 'ArrowUp':
                e.preventDefault();
                this.navigateSuggestions('up', suggestions, activeSuggestion);
                break;
                
            case 'Enter':
                e.preventDefault();
                if (activeSuggestion) {
                    this.handleSuggestionClick(activeSuggestion);
                } else {
                    this.performSearch(e.target.value.trim());
                }
                break;
                
            case 'Escape':
                this.clearSearch();
                break;
        }
    }
    
    /**
     * Navigate through search suggestions with keyboard
     */
    navigateSuggestions(direction, suggestions, activeSuggestion) {
        if (suggestions.length === 0) return;
        
        let nextIndex = 0;
        
        if (activeSuggestion) {
            const currentIndex = Array.from(suggestions).indexOf(activeSuggestion);
            activeSuggestion.classList.remove('active');
            
            if (direction === 'down') {
                nextIndex = currentIndex < suggestions.length - 1 ? currentIndex + 1 : 0;
            } else {
                nextIndex = currentIndex > 0 ? currentIndex - 1 : suggestions.length - 1;
            }
        }
        
        suggestions[nextIndex].classList.add('active');
        suggestions[nextIndex].scrollIntoView({ block: 'nearest' });
    }
    
    /**
     * Perform document search
     */
    async performSearch(query) {
        if (!query || query.length < 2) return;
        
        try {
            // Check cache first
            const cacheKey = `${query}-${this.currentLanguage}`;
            if (this.searchCache.has(cacheKey)) {
                const results = this.searchCache.get(cacheKey);
                this.displaySearchResults(results, query);
                return;
            }
            
            // Perform search
            const results = this.documentService.searchDocuments(query, this.currentLanguage);
            
            // Cache results
            this.searchCache.set(cacheKey, results);
            
            // Add to search history
            this.addToSearchHistory(query);
            
            // Display results
            this.displaySearchResults(results, query);
            
            // Update navigation tree with filtered results
            this.filterNavigationTree(results);
            
        } catch (error) {
            console.error('Search failed:', error);
            this.showSearchError('Search failed. Please try again.');
        }
    }
    
    /**
     * Display search results
     */
    displaySearchResults(results, query) {
        console.log(`Search for "${query}" found ${results.length} results`);
        
        if (results.length === 0) {
            this.showNoResults(query);
            return;
        }
        
        // If only one result, navigate to it directly
        if (results.length === 1) {
            const document = results[0];
            this.navigationTree.selectDocument(document.id);
            this.hideSuggestions();
            this.clearSearchInput();
            return;
        }
        
        // Show search suggestions with results
        this.showSearchResultsSuggestions(results, query);
    }
    
    /**
     * Show search suggestions
     */
    showSearchSuggestions(query) {
        const suggestions = this.generateSearchSuggestions(query);
        this.renderSuggestions(suggestions);
    }
    
    /**
     * Generate search suggestions
     */
    generateSearchSuggestions(query) {
        const suggestions = [];
        const searchTerm = query.toLowerCase();
        
        // Recent searches
        const recentMatches = this.searchHistory
            .filter(term => term.toLowerCase().includes(searchTerm))
            .slice(0, 3);
        
        recentMatches.forEach(term => {
            suggestions.push({
                type: 'recent',
                text: term,
                icon: '🕒',
                action: () => this.performSearch(term)
            });
        });
        
        // Quick document matches
        const documents = this.documentService.getAllDocuments();
        const titleMatches = documents
            .filter(doc => {
                const title = doc.title[this.currentLanguage] || doc.title.en;
                return title.toLowerCase().includes(searchTerm);
            })
            .slice(0, 5);
        
        titleMatches.forEach(doc => {
            const title = doc.title[this.currentLanguage] || doc.title.en;
            suggestions.push({
                type: 'document',
                text: title,
                icon: '📄',
                docId: doc.id,
                action: () => this.selectDocument(doc.id)
            });
        });
        
        // Category suggestions
        const categories = this.documentService.getAllCategories();
        const categoryMatches = categories
            .filter(cat => {
                const name = cat.name[this.currentLanguage] || cat.name.en;
                return name.toLowerCase().includes(searchTerm);
            })
            .slice(0, 2);
        
        categoryMatches.forEach(category => {
            const name = category.name[this.currentLanguage] || category.name.en;
            suggestions.push({
                type: 'category',
                text: `Browse ${name}`,
                icon: category.icon || '📁',
                categoryId: category.id,
                action: () => this.browseCategory(category.id)
            });
        });
        
        return suggestions.slice(0, 8); // Limit total suggestions
    }
    
    /**
     * Show search results as suggestions
     */
    showSearchResultsSuggestions(results, query) {
        const suggestions = results.slice(0, 8).map(doc => {
            const title = doc.title[this.currentLanguage] || doc.title.en;
            const description = doc.description[this.currentLanguage] || doc.description.en;
            
            return {
                type: 'search-result',
                text: title,
                subtitle: description.substring(0, 60) + '...',
                icon: '🔍',
                docId: doc.id,
                action: () => this.selectDocument(doc.id)
            };
        });
        
        this.renderSuggestions(suggestions);
    }
    
    /**
     * Render search suggestions
     */
    renderSuggestions(suggestions) {
        const suggestionsContainer = document.getElementById('search-suggestions');
        if (!suggestionsContainer) return;
        
        if (suggestions.length === 0) {
            suggestionsContainer.style.display = 'none';
            return;
        }
        
        suggestionsContainer.innerHTML = '';
        
        suggestions.forEach((suggestion, index) => {
            const suggestionElement = document.createElement('div');
            suggestionElement.className = 'search-suggestion';
            suggestionElement.dataset.type = suggestion.type;
            
            if (suggestion.docId) {
                suggestionElement.dataset.docId = suggestion.docId;
            }
            
            if (suggestion.categoryId) {
                suggestionElement.dataset.categoryId = suggestion.categoryId;
            }
            
            suggestionElement.innerHTML = `
                <span class="suggestion-icon">${suggestion.icon}</span>
                <div class="suggestion-content">
                    <div class="suggestion-title">${Utils.escapeHtml(suggestion.text)}</div>
                    ${suggestion.subtitle ? `<div class="suggestion-subtitle">${Utils.escapeHtml(suggestion.subtitle)}</div>` : ''}
                </div>
            `;
            
            suggestionElement.addEventListener('click', () => {
                suggestion.action();
            });
            
            suggestionsContainer.appendChild(suggestionElement);
        });
        
        suggestionsContainer.style.display = 'block';
    }
    
    /**
     * Handle suggestion click
     */
    handleSuggestionClick(suggestionElement) {
        const type = suggestionElement.dataset.type;
        const docId = suggestionElement.dataset.docId;
        const categoryId = suggestionElement.dataset.categoryId;
        
        if (docId) {
            this.selectDocument(docId);
        } else if (categoryId) {
            this.browseCategory(categoryId);
        }
        
        this.hideSuggestions();
        this.clearSearchInput();
    }
    
    /**
     * Select and display a document
     */
    selectDocument(docId) {
        this.navigationTree.selectDocument(docId);
    }
    
    /**
     * Browse documents in a category
     */
    browseCategory(categoryId) {
        this.navigationTree.filterByCategory(categoryId);
    }
    
    /**
     * Filter navigation tree with search results
     */
    filterNavigationTree(results) {
        if (results.length === 0) {
            this.navigationTree.showAllItems();
            return;
        }
        
        // Create a set of result IDs for quick lookup
        const resultIds = new Set(results.map(doc => doc.id));
        
        // Show only matching documents in navigation
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            const link = item.querySelector('.nav-link-item');
            const docId = link.dataset.docId;
            
            if (resultIds.has(docId)) {
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
     * Show all documents (clear search filter)
     */
    showAllDocuments() {
        this.navigationTree.showAllItems();
    }
    
    /**
     * Clear search results and show default state
     */
    clearSearchResults() {
        this.hideSuggestions();
        this.showAllDocuments();
    }
    
    /**
     * Show no results message
     */
    showNoResults(query) {
        const suggestions = [{
            type: 'no-results',
            text: `No results found for "${query}"`,
            icon: '❌',
            action: () => this.clearSearch()
        }];
        
        this.renderSuggestions(suggestions);
    }
    
    /**
     * Show search error
     */
    showSearchError(message) {
        const suggestions = [{
            type: 'error',
            text: message,
            icon: '⚠️',
            action: () => this.clearSearch()
        }];
        
        this.renderSuggestions(suggestions);
    }
    
    /**
     * Show suggestions dropdown
     */
    showSuggestions() {
        const suggestionsContainer = document.getElementById('search-suggestions');
        if (suggestionsContainer && suggestionsContainer.children.length > 0) {
            suggestionsContainer.style.display = 'block';
        }
    }
    
    /**
     * Hide suggestions dropdown
     */
    hideSuggestions() {
        const suggestionsContainer = document.getElementById('search-suggestions');
        if (suggestionsContainer) {
            suggestionsContainer.style.display = 'none';
        }
        
        // Remove active state from suggestions
        document.querySelectorAll('.search-suggestion.active').forEach(suggestion => {
            suggestion.classList.remove('active');
        });
    }
    
    /**
     * Focus search input
     */
    focusSearch() {
        const searchInput = document.getElementById('sidebar-search-input') || 
                          document.getElementById('header-search-input');
        if (searchInput) {
            searchInput.focus();
            searchInput.select();
        }
    }
    
    /**
     * Clear search input and results
     */
    clearSearch() {
        this.clearSearchInput();
        this.clearSearchResults();
    }
    
    /**
     * Clear search input value
     */
    clearSearchInput() {
        const inputs = [
            document.getElementById('sidebar-search-input'),
            document.getElementById('header-search-input')
        ];
        
        inputs.forEach(input => {
            if (input) {
                input.value = '';
            }
        });
    }
    
    /**
     * Add query to search history
     */
    addToSearchHistory(query) {
        // Remove duplicates and add to beginning
        this.searchHistory = this.searchHistory.filter(term => term !== query);
        this.searchHistory.unshift(query);
        
        // Limit history size
        if (this.searchHistory.length > this.maxHistorySize) {
            this.searchHistory = this.searchHistory.slice(0, this.maxHistorySize);
        }
        
        this.saveSearchHistory();
    }
    
    /**
     * Save search history to localStorage
     */
    saveSearchHistory() {
        try {
            localStorage.setItem('docs-search-history', JSON.stringify(this.searchHistory));
        } catch (error) {
            console.warn('Failed to save search history:', error);
        }
    }
    
    /**
     * Load search history from localStorage
     */
    loadSearchHistory() {
        try {
            const saved = localStorage.getItem('docs-search-history');
            if (saved) {
                this.searchHistory = JSON.parse(saved);
            }
        } catch (error) {
            console.warn('Failed to load search history:', error);
            this.searchHistory = [];
        }
    }
    
    /**
     * Clear search history
     */
    clearSearchHistory() {
        this.searchHistory = [];
        this.saveSearchHistory();
    }
    
    /**
     * Set language for search
     */
    setLanguage(language) {
        this.currentLanguage = language;
        this.searchCache.clear(); // Clear cache when language changes
    }
    
    /**
     * Get search statistics
     */
    getSearchStats() {
        return {
            cacheSize: this.searchCache.size,
            historySize: this.searchHistory.length,
            mostSearched: this.getMostSearchedTerms()
        };
    }
    
    /**
     * Get most searched terms
     */
    getMostSearchedTerms() {
        const termCounts = {};
        this.searchHistory.forEach(term => {
            termCounts[term] = (termCounts[term] || 0) + 1;
        });
        
        return Object.entries(termCounts)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5)
            .map(([term, count]) => ({ term, count }));
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DocumentSearch;
} else {
    window.DocumentSearch = DocumentSearch;
}
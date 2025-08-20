/**
 * Search Component for Claude Code Features Collection
 */

class SearchComponent {
    constructor(onSearchCallback) {
        this.onSearchCallback = onSearchCallback;
        this.searchInput = null;
        this.suggestionsContainer = null;
        this.currentQuery = '';
        this.suggestions = [];
        this.selectedSuggestion = -1;
        
        // Debounced search function
        this.debouncedSearch = Utils.debounce(this.performSearch.bind(this), 300);
        
        this.init();
    }
    
    init() {
        this.searchInput = document.getElementById('search-input');
        this.suggestionsContainer = document.getElementById('search-suggestions');
        
        if (!this.searchInput) {
            console.warn('Search input element not found');
            return;
        }
        
        this.bindEvents();
        console.log('✅ Search component initialized');
    }
    
    bindEvents() {
        // Input event for real-time search
        this.searchInput.addEventListener('input', (e) => {
            const query = e.target.value;
            this.currentQuery = query;
            this.debouncedSearch(query);
        });
        
        // Keyboard navigation
        this.searchInput.addEventListener('keydown', (e) => {
            this.handleKeydown(e);
        });
        
        // Focus events
        this.searchInput.addEventListener('focus', () => {
            this.showSuggestions();
        });
        
        // Click outside to hide suggestions
        document.addEventListener('click', (e) => {
            if (!this.searchInput.contains(e.target) && 
                !this.suggestionsContainer?.contains(e.target)) {
                this.hideSuggestions();
            }
        });
    }
    
    performSearch(query) {
        // Update suggestions
        if (query.length >= 2) {
            this.updateSuggestions(query);
        } else {
            this.hideSuggestions();
        }
        
        // Trigger search callback
        if (this.onSearchCallback) {
            this.onSearchCallback(query);
        }
    }
    
    updateSuggestions(query) {
        // This would typically get suggestions from a data service
        // For now, we'll create some basic suggestions
        this.suggestions = this.generateSuggestions(query);
        this.renderSuggestions();
        
        if (this.suggestions.length > 0) {
            this.showSuggestions();
        } else {
            this.hideSuggestions();
        }
    }
    
    generateSuggestions(query) {
        // Basic suggestion generation - in a real app, this would use the data service
        const commonTerms = [
            'CLI operations', 'Natural language', 'File editing', 'Git integration',
            'Search', 'Analysis', 'Slash commands', 'Background commands',
            'Status line', 'Mention support', 'Sub-agents', 'MCP integration',
            'Multiple models', 'Hooks system', 'Custom commands', 'Permission',
            'Context management', 'Debugging', 'Testing', 'Documentation',
            'Refactoring', 'IDE integration', 'Performance', 'Security'
        ];
        
        const queryLower = query.toLowerCase();
        return commonTerms
            .filter(term => term.toLowerCase().includes(queryLower))
            .slice(0, 5);
    }
    
    renderSuggestions() {
        if (!this.suggestionsContainer) return;
        
        this.suggestionsContainer.innerHTML = '';
        
        this.suggestions.forEach((suggestion, index) => {
            const item = document.createElement('div');
            item.className = 'suggestion-item';
            item.textContent = suggestion;
            item.setAttribute('role', 'option');
            item.setAttribute('data-index', index.toString());
            
            item.addEventListener('click', () => {
                this.selectSuggestion(suggestion);
            });
            
            this.suggestionsContainer.appendChild(item);
        });
        
        this.selectedSuggestion = -1;
    }
    
    selectSuggestion(suggestion) {
        this.searchInput.value = suggestion;
        this.currentQuery = suggestion;
        this.hideSuggestions();
        this.performSearch(suggestion);
        this.searchInput.focus();
    }
    
    showSuggestions() {
        if (this.suggestionsContainer && this.suggestions.length > 0) {
            this.suggestionsContainer.classList.add('show');
            this.suggestionsContainer.style.display = 'block';
        }
    }
    
    hideSuggestions() {
        if (this.suggestionsContainer) {
            this.suggestionsContainer.classList.remove('show');
            this.suggestionsContainer.style.display = 'none';
        }
        this.selectedSuggestion = -1;
    }
    
    handleKeydown(e) {
        const suggestionsVisible = this.suggestionsContainer?.classList.contains('show');
        
        if (!suggestionsVisible) return;
        
        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                this.navigateSuggestions(1);
                break;
                
            case 'ArrowUp':
                e.preventDefault();
                this.navigateSuggestions(-1);
                break;
                
            case 'Enter':
                e.preventDefault();
                if (this.selectedSuggestion >= 0) {
                    this.selectSuggestion(this.suggestions[this.selectedSuggestion]);
                } else {
                    this.hideSuggestions();
                }
                break;
                
            case 'Escape':
                this.hideSuggestions();
                break;
        }
    }
    
    navigateSuggestions(direction) {
        const maxIndex = this.suggestions.length - 1;
        
        // Remove current highlight
        this.highlightSuggestion(this.selectedSuggestion, false);
        
        // Calculate new index
        this.selectedSuggestion += direction;
        
        if (this.selectedSuggestion < 0) {
            this.selectedSuggestion = maxIndex;
        } else if (this.selectedSuggestion > maxIndex) {
            this.selectedSuggestion = 0;
        }
        
        // Add new highlight
        this.highlightSuggestion(this.selectedSuggestion, true);
        
        // Update input value
        if (this.selectedSuggestion >= 0) {
            this.searchInput.value = this.suggestions[this.selectedSuggestion];
        }
    }
    
    highlightSuggestion(index, highlight) {
        if (!this.suggestionsContainer || index < 0) return;
        
        const items = this.suggestionsContainer.querySelectorAll('.suggestion-item');
        if (items[index]) {
            if (highlight) {
                items[index].classList.add('highlighted');
                items[index].setAttribute('aria-selected', 'true');
            } else {
                items[index].classList.remove('highlighted');
                items[index].setAttribute('aria-selected', 'false');
            }
        }
    }
    
    focus() {
        if (this.searchInput) {
            this.searchInput.focus();
            this.searchInput.select();
        }
    }
    
    clear() {
        if (this.searchInput) {
            this.searchInput.value = '';
            this.currentQuery = '';
            this.hideSuggestions();
            this.performSearch('');
        }
    }
    
    getCurrentQuery() {
        return this.currentQuery;
    }
    
    setQuery(query) {
        if (this.searchInput) {
            this.searchInput.value = query;
            this.currentQuery = query;
            this.performSearch(query);
        }
    }
    
    destroy() {
        // Remove event listeners
        if (this.searchInput) {
            this.searchInput.removeEventListener('input', this.debouncedSearch);
            this.searchInput.removeEventListener('keydown', this.handleKeydown);
        }
        
        // Clear references
        this.searchInput = null;
        this.suggestionsContainer = null;
        this.onSearchCallback = null;
        
        console.log('🗑️ Search component destroyed');
    }
}

window.SearchComponent = SearchComponent;
/**
 * Data Service for Claude Code Features Collection
 * Handles data loading, caching, searching, and filtering
 */

class DataService {
    constructor() {
        this.features = [];
        this.categories = [];
        this.cache = new Map();
        this.initialized = false;
    }
    
    /**
     * Initialize the data service
     */
    async init() {
        if (this.initialized) return;
        
        try {
            await Promise.all([
                this.loadFeatures(),
                this.loadCategories()
            ]);
            
            this.initialized = true;
            console.log('✅ DataService initialized successfully');
            
        } catch (error) {
            console.error('❌ Failed to initialize DataService:', error);
            throw error;
        }
    }
    
    /**
     * Load features data from JSON
     */
    async loadFeatures() {
        try {
            const cacheKey = 'features-data';
            
            // Check cache first
            if (this.cache.has(cacheKey)) {
                this.features = this.cache.get(cacheKey);
                return this.features;
            }
            
            const response = await fetch('./data/features.json');
            if (!response.ok) {
                throw new Error(`Failed to load features: ${response.status}`);
            }
            
            const data = await response.json();
            this.features = data.features || [];
            
            // Cache the data
            this.cache.set(cacheKey, this.features);
            
            console.log(`📊 Loaded ${this.features.length} features`);
            return this.features;
            
        } catch (error) {
            console.error('Failed to load features:', error);
            throw error;
        }
    }
    
    /**
     * Load categories data from JSON
     */
    async loadCategories() {
        try {
            const cacheKey = 'categories-data';
            
            // Check cache first
            if (this.cache.has(cacheKey)) {
                this.categories = this.cache.get(cacheKey);
                return this.categories;
            }
            
            const response = await fetch('./data/categories.json');
            if (!response.ok) {
                throw new Error(`Failed to load categories: ${response.status}`);
            }
            
            const data = await response.json();
            this.categories = data.categories || [];
            
            // Cache the data
            this.cache.set(cacheKey, this.categories);
            
            console.log(`📂 Loaded ${this.categories.length} categories`);
            return this.categories;
            
        } catch (error) {
            console.error('Failed to load categories:', error);
            throw error;
        }
    }
    
    /**
     * Get all features
     */
    getAllFeatures() {
        return [...this.features];
    }
    
    /**
     * Get feature by ID
     */
    getFeatureById(id) {
        return this.features.find(feature => feature.id === id);
    }
    
    /**
     * Get features by category
     */
    getFeaturesByCategory(categoryId) {
        return this.features.filter(feature => feature.category === categoryId);
    }
    
    /**
     * Get features by status
     */
    getFeaturesByStatus(status) {
        return this.features.filter(feature => feature.status === status);
    }
    
    /**
     * Get all categories
     */
    getAllCategories() {
        return [...this.categories];
    }
    
    /**
     * Get category by ID
     */
    getCategoryById(id) {
        return this.categories.find(category => category.id === id);
    }
    
    /**
     * Search features with intelligent matching
     */
    searchFeatures(features, query, language = 'en') {
        if (!query || query.trim() === '') {
            return features;
        }
        
        const searchTerm = query.toLowerCase().trim();
        const searchResults = [];
        
        features.forEach(feature => {
            let score = 0;
            const title = feature.title[language] || feature.title.en || '';
            const description = feature.description[language] || feature.description.en || '';
            const details = feature.details[language] || feature.details.en || '';
            const tags = feature.tags || [];
            const examples = feature.examples || [];
            
            // Title match (highest priority)
            if (title.toLowerCase().includes(searchTerm)) {
                score += 100;
                // Exact title match gets even higher score
                if (title.toLowerCase() === searchTerm) {
                    score += 50;
                }
            }
            
            // Description match
            if (description.toLowerCase().includes(searchTerm)) {
                score += 80;
            }
            
            // Tags match
            tags.forEach(tag => {
                if (tag.toLowerCase().includes(searchTerm)) {
                    score += 60;
                    // Exact tag match
                    if (tag.toLowerCase() === searchTerm) {
                        score += 20;
                    }
                }
            });
            
            // Examples match
            examples.forEach(example => {
                if (example.toLowerCase().includes(searchTerm)) {
                    score += 40;
                }
            });
            
            // Details match (lower priority)
            if (details.toLowerCase().includes(searchTerm)) {
                score += 20;
            }
            
            // Category match
            const category = this.getCategoryById(feature.category);
            if (category) {
                const categoryName = category.id.toLowerCase();
                if (categoryName.includes(searchTerm)) {
                    score += 30;
                }
            }
            
            // Fuzzy matching for typos and partial matches
            const fuzzyScore = this.calculateFuzzyScore(searchTerm, title, description, tags);
            score += fuzzyScore;
            
            // Only include results with meaningful scores
            if (score > 0) {
                searchResults.push({
                    ...feature,
                    searchScore: score
                });
            }
        });
        
        // Sort by score (highest first) and return
        return searchResults
            .sort((a, b) => b.searchScore - a.searchScore)
            .map(result => {
                const { searchScore, ...feature } = result;
                return feature;
            });
    }
    
    /**
     * Calculate fuzzy matching score
     */
    calculateFuzzyScore(searchTerm, title, description, tags) {
        let fuzzyScore = 0;
        
        // Character-level fuzzy matching
        const titleScore = Utils.fuzzySearch(searchTerm, title) * 30;
        const descScore = Utils.fuzzySearch(searchTerm, description) * 20;
        
        // Tag fuzzy matching
        let tagScore = 0;
        tags.forEach(tag => {
            tagScore = Math.max(tagScore, Utils.fuzzySearch(searchTerm, tag) * 25);
        });
        
        fuzzyScore = titleScore + descScore + tagScore;
        
        // Only return meaningful fuzzy scores
        return fuzzyScore > 10 ? fuzzyScore : 0;
    }
    
    /**
     * Filter features based on criteria
     */
    filterFeatures(features, filters) {
        let filtered = [...features];
        
        // Filter by category
        if (filters.category && filters.category !== 'all') {
            filtered = filtered.filter(feature => feature.category === filters.category);
        }
        
        // Filter by status
        if (filters.status && filters.status !== 'all') {
            filtered = filtered.filter(feature => feature.status === filters.status);
        }
        
        // Filter by tags
        if (filters.tags && filters.tags.length > 0) {
            filtered = filtered.filter(feature => {
                return filters.tags.some(tag => 
                    feature.tags && feature.tags.includes(tag)
                );
            });
        }
        
        // Filter by version
        if (filters.version && filters.version !== 'all') {
            filtered = filtered.filter(feature => feature.version === filters.version);
        }
        
        return filtered;
    }
    
    /**
     * Sort features based on criteria
     */
    sortFeatures(features, sortBy, language = 'en') {
        const sorted = [...features];
        
        return sorted.sort((a, b) => {
            switch (sortBy) {
                case 'name':
                    const titleA = (a.title[language] || a.title.en || '').toLowerCase();
                    const titleB = (b.title[language] || b.title.en || '').toLowerCase();
                    return titleA.localeCompare(titleB);
                
                case 'category':
                    const catA = a.category || '';
                    const catB = b.category || '';
                    if (catA !== catB) {
                        return catA.localeCompare(catB);
                    }
                    // Secondary sort by name if categories are the same
                    const nameA = (a.title[language] || a.title.en || '').toLowerCase();
                    const nameB = (b.title[language] || b.title.en || '').toLowerCase();
                    return nameA.localeCompare(nameB);
                
                case 'status':
                    const statusOrder = { 'new': 0, 'beta': 1, 'stable': 2 };
                    const statusA = statusOrder[a.status] ?? 3;
                    const statusB = statusOrder[b.status] ?? 3;
                    if (statusA !== statusB) {
                        return statusA - statusB;
                    }
                    // Secondary sort by name if status is the same
                    const sNameA = (a.title[language] || a.title.en || '').toLowerCase();
                    const sNameB = (b.title[language] || b.title.en || '').toLowerCase();
                    return sNameA.localeCompare(sNameB);
                
                case 'version':
                    return (b.version || '').localeCompare(a.version || '');
                
                default:
                    return 0;
            }
        });
    }
    
    /**
     * Get unique values for a field
     */
    getUniqueValues(field) {
        const values = new Set();
        
        this.features.forEach(feature => {
            const value = feature[field];
            if (value) {
                if (Array.isArray(value)) {
                    value.forEach(v => values.add(v));
                } else {
                    values.add(value);
                }
            }
        });
        
        return Array.from(values).sort();
    }
    
    /**
     * Get feature statistics
     */
    getStatistics() {
        const stats = {
            totalFeatures: this.features.length,
            categoriesCount: this.categories.length,
            statusCounts: {},
            versionCounts: {},
            tagCounts: {}
        };
        
        // Count by status
        this.features.forEach(feature => {
            const status = feature.status || 'unknown';
            stats.statusCounts[status] = (stats.statusCounts[status] || 0) + 1;
        });
        
        // Count by version
        this.features.forEach(feature => {
            const version = feature.version || 'unknown';
            stats.versionCounts[version] = (stats.versionCounts[version] || 0) + 1;
        });
        
        // Count by tags
        this.features.forEach(feature => {
            if (feature.tags) {
                feature.tags.forEach(tag => {
                    stats.tagCounts[tag] = (stats.tagCounts[tag] || 0) + 1;
                });
            }
        });
        
        return stats;
    }
    
    /**
     * Get search suggestions based on current query
     */
    getSearchSuggestions(query, limit = 5) {
        if (!query || query.length < 2) {
            return [];
        }
        
        const suggestions = new Set();
        const queryLower = query.toLowerCase();
        
        // Collect suggestions from titles
        this.features.forEach(feature => {
            const titleEn = feature.title.en || '';
            const titleZh = feature.title.zh || '';
            
            [titleEn, titleZh].forEach(title => {
                if (title.toLowerCase().includes(queryLower)) {
                    suggestions.add(title);
                }
            });
        });
        
        // Collect suggestions from tags
        this.features.forEach(feature => {
            if (feature.tags) {
                feature.tags.forEach(tag => {
                    if (tag.toLowerCase().includes(queryLower)) {
                        suggestions.add(tag);
                    }
                });
            }
        });
        
        // Convert to array and limit results
        return Array.from(suggestions)
            .filter(suggestion => suggestion.toLowerCase() !== queryLower)
            .sort((a, b) => a.length - b.length) // Shorter suggestions first
            .slice(0, limit);
    }
    
    /**
     * Clear cache
     */
    clearCache() {
        this.cache.clear();
        console.log('🧹 DataService cache cleared');
    }
    
    /**
     * Get cache statistics
     */
    getCacheStats() {
        return {
            cacheSize: this.cache.size,
            cacheKeys: Array.from(this.cache.keys())
        };
    }
    
    /**
     * Validate feature data structure
     */
    validateFeature(feature) {
        const required = ['id', 'category', 'title', 'description', 'status'];
        const missing = required.filter(field => !feature[field]);
        
        if (missing.length > 0) {
            console.warn(`Feature ${feature.id || 'unknown'} missing required fields:`, missing);
            return false;
        }
        
        return true;
    }
    
    /**
     * Export data in various formats
     */
    exportData(format = 'json') {
        const data = {
            features: this.features,
            categories: this.categories,
            stats: this.getStatistics(),
            timestamp: new Date().toISOString()
        };
        
        switch (format) {
            case 'json':
                return JSON.stringify(data, null, 2);
            
            case 'csv':
                return this.convertToCSV(this.features);
            
            default:
                throw new Error(`Unsupported export format: ${format}`);
        }
    }
    
    /**
     * Convert features to CSV format
     */
    convertToCSV(features) {
        if (features.length === 0) return '';
        
        const headers = ['ID', 'Title (EN)', 'Title (ZH)', 'Category', 'Status', 'Version', 'Tags'];
        const csvRows = [headers.join(',')];
        
        features.forEach(feature => {
            const row = [
                feature.id,
                `"${feature.title.en || ''}"`,
                `"${feature.title.zh || ''}"`,
                feature.category,
                feature.status,
                feature.version || '',
                `"${(feature.tags || []).join(', ')}"`
            ];
            csvRows.push(row.join(','));
        });
        
        return csvRows.join('\n');
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DataService;
} else {
    window.DataService = DataService;
}
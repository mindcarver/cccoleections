/**
 * Document Service for Claude Code Documentation Hub
 * Handles document data loading, caching, and management
 */

class DocumentService {
    constructor() {
        this.documents = [];
        this.categories = [];
        this.cache = new Map();
        this.initialized = false;
    }
    
    /**
     * Initialize the document service
     */
    async init() {
        if (this.initialized) return;
        
        try {
            await this.loadDocuments();
            this.initialized = true;
            console.log('✅ DocumentService initialized successfully');
            
        } catch (error) {
            console.error('❌ Failed to initialize DocumentService:', error);
            throw error;
        }
    }
    
    /**
     * Load documents data from JSON
     */
    async loadDocuments() {
        try {
            const cacheKey = 'documents-data';
            
            // Check cache first
            if (this.cache.has(cacheKey)) {
                const data = this.cache.get(cacheKey);
                this.documents = data.documents;
                this.categories = data.categories;
                return;
            }
            
            const response = await fetch('./data/documents.json');
            if (!response.ok) {
                throw new Error(`Failed to load documents: ${response.status}`);
            }
            
            const data = await response.json();
            this.documents = data.documents || [];
            this.categories = data.categories || [];
            
            // Cache the data
            this.cache.set(cacheKey, { documents: this.documents, categories: this.categories });
            
            console.log(`📚 Loaded ${this.documents.length} documents in ${this.categories.length} categories`);
            
        } catch (error) {
            console.error('Failed to load documents:', error);
            throw error;
        }
    }
    
    /**
     * Get all documents
     */
    getAllDocuments() {
        return [...this.documents];
    }
    
    /**
     * Get document by ID
     */
    getDocumentById(id) {
        return this.documents.find(doc => doc.id === id);
    }
    
    /**
     * Get documents by category
     */
    getDocumentsByCategory(categoryId) {
        return this.documents.filter(doc => doc.category === categoryId);
    }
    
    /**
     * Get all categories
     */
    getAllCategories() {
        return [...this.categories].sort((a, b) => a.order - b.order);
    }
    
    /**
     * Get category by ID
     */
    getCategoryById(id) {
        return this.categories.find(category => category.id === id);
    }
    
    /**
     * Search documents
     */
    searchDocuments(query, language = 'en') {
        if (!query || query.trim() === '') {
            return this.documents;
        }
        
        const searchTerm = query.toLowerCase().trim();
        const searchResults = [];
        
        this.documents.forEach(doc => {
            let score = 0;
            const title = doc.title[language] || doc.title.en || '';
            const description = doc.description[language] || doc.description.en || '';
            const overview = doc.content.overview[language] || doc.content.overview.en || '';
            const tags = doc.metadata.tags || [];
            
            // Title match (highest priority)
            if (title.toLowerCase().includes(searchTerm)) {
                score += 100;
                if (title.toLowerCase() === searchTerm) {
                    score += 50;
                }
            }
            
            // Description match
            if (description.toLowerCase().includes(searchTerm)) {
                score += 80;
            }
            
            // Overview match
            if (overview.toLowerCase().includes(searchTerm)) {
                score += 60;
            }
            
            // Tags match
            tags.forEach(tag => {
                if (tag.toLowerCase().includes(searchTerm)) {
                    score += 40;
                    if (tag.toLowerCase() === searchTerm) {
                        score += 20;
                    }
                }
            });
            
            // Search in sections content
            if (doc.content.sections) {
                doc.content.sections.forEach(section => {
                    const sectionContent = section.content[language] || section.content.en || '';
                    if (sectionContent.toLowerCase().includes(searchTerm)) {
                        score += 30;
                    }
                });
            }
            
            // Category match
            const category = this.getCategoryById(doc.category);
            if (category) {
                const categoryName = category.name[language] || category.name.en || '';
                if (categoryName.toLowerCase().includes(searchTerm)) {
                    score += 20;
                }
            }
            
            if (score > 0) {
                searchResults.push({
                    ...doc,
                    searchScore: score
                });
            }
        });
        
        return searchResults
            .sort((a, b) => b.searchScore - a.searchScore)
            .map(result => {
                const { searchScore, ...doc } = result;
                return doc;
            });
    }
    
    /**
     * Get recent documents
     */
    getRecentDocuments(limit = 5) {
        return [...this.documents]
            .sort((a, b) => new Date(b.source.lastUpdated) - new Date(a.source.lastUpdated))
            .slice(0, limit);
    }
    
    /**
     * Get documents by difficulty
     */
    getDocumentsByDifficulty(difficulty) {
        return this.documents.filter(doc => doc.metadata.difficulty === difficulty);
    }
    
    /**
     * Get documents by tags
     */
    getDocumentsByTags(tags) {
        if (!Array.isArray(tags) || tags.length === 0) {
            return this.documents;
        }
        
        return this.documents.filter(doc => {
            return tags.some(tag => 
                doc.metadata.tags && doc.metadata.tags.includes(tag)
            );
        });
    }
    
    /**
     * Get navigation structure for sidebar
     */
    getNavigationStructure(language = 'en') {
        const structure = [];
        
        this.categories.forEach(category => {
            const categoryDocs = this.getDocumentsByCategory(category.id)
                .sort((a, b) => (a.priority || 999) - (b.priority || 999));
            
            if (categoryDocs.length > 0) {
                structure.push({
                    category: {
                        id: category.id,
                        name: category.name[language] || category.name.en,
                        icon: category.icon,
                        description: category.description[language] || category.description.en
                    },
                    documents: categoryDocs.map(doc => ({
                        id: doc.id,
                        title: doc.title[language] || doc.title.en,
                        difficulty: doc.metadata.difficulty,
                        readingTime: doc.metadata.readingTime
                    }))
                });
            }
        });
        
        return structure;
    }
    
    /**
     * Get statistics
     */
    getStatistics() {
        const stats = {
            totalDocuments: this.documents.length,
            totalCategories: this.categories.length,
            difficultyBreakdown: {},
            averageReadingTime: 0,
            totalTags: new Set()
        };
        
        // Calculate difficulty breakdown
        this.documents.forEach(doc => {
            const difficulty = doc.metadata.difficulty || 'unknown';
            stats.difficultyBreakdown[difficulty] = (stats.difficultyBreakdown[difficulty] || 0) + 1;
            
            // Collect tags
            if (doc.metadata.tags) {
                doc.metadata.tags.forEach(tag => stats.totalTags.add(tag));
            }
        });
        
        // Calculate average reading time
        const totalReadingTime = this.documents.reduce((sum, doc) => sum + (doc.metadata.readingTime || 0), 0);
        stats.averageReadingTime = Math.round(totalReadingTime / this.documents.length);
        stats.totalTags = stats.totalTags.size;
        
        return stats;
    }
    
    /**
     * Get next/previous document in category
     */
    getAdjacentDocuments(currentDocId) {
        const currentDoc = this.getDocumentById(currentDocId);
        if (!currentDoc) return { prev: null, next: null };
        
        const categoryDocs = this.getDocumentsByCategory(currentDoc.category)
            .sort((a, b) => (a.priority || 999) - (b.priority || 999));
        
        const currentIndex = categoryDocs.findIndex(doc => doc.id === currentDocId);
        
        return {
            prev: currentIndex > 0 ? categoryDocs[currentIndex - 1] : null,
            next: currentIndex < categoryDocs.length - 1 ? categoryDocs[currentIndex + 1] : null
        };
    }
    
    /**
     * Validate document structure
     */
    validateDocument(doc) {
        const required = ['id', 'category', 'title', 'description', 'content', 'source', 'metadata'];
        const missing = required.filter(field => !doc[field]);
        
        if (missing.length > 0) {
            console.warn(`Document ${doc.id || 'unknown'} missing required fields:`, missing);
            return false;
        }
        
        return true;
    }
    
    /**
     * Clear cache
     */
    clearCache() {
        this.cache.clear();
        console.log('🧹 DocumentService cache cleared');
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DocumentService;
} else {
    window.DocumentService = DocumentService;
}
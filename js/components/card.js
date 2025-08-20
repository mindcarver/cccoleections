/**
 * Card Component for Claude Code Features Collection
 * Renders individual feature cards with interactive functionality
 */

class CardComponent {
    constructor(modalComponent = null) {
        this.modalComponent = modalComponent;
        this.cardInstances = new Map();
    }
    
    /**
     * Render a feature card
     */
    render(feature, language = 'en') {
        const cardElement = this.createElement(feature, language);
        this.bindEvents(cardElement, feature);
        
        // Store reference for potential updates
        this.cardInstances.set(feature.id, {
            element: cardElement,
            feature: feature
        });
        
        return cardElement;
    }
    
    /**
     * Create card DOM element
     */
    createElement(feature, language) {
        const card = document.createElement('div');
        card.className = 'feature-card';
        card.setAttribute('data-feature-id', feature.id);
        card.setAttribute('data-category', feature.category);
        card.setAttribute('data-status', feature.status);
        card.setAttribute('role', 'button');
        card.setAttribute('tabindex', '0');
        card.setAttribute('aria-label', `Feature: ${feature.title[language] || feature.title.en}`);
        
        // Get title and description in current language
        const title = feature.title[language] || feature.title.en || 'Untitled';
        const description = feature.description[language] || feature.description.en || 'No description';
        
        // Get category information
        const categoryIcon = this.getCategoryIcon(feature.category);
        const categoryName = this.getCategoryName(feature.category, language);
        
        card.innerHTML = `
            <div class="card-header">
                <h3 class="card-title">${Utils.escapeHtml(title)}</h3>
                <span class="card-status status-${feature.status}">${this.getStatusLabel(feature.status, language)}</span>
            </div>
            
            <div class="card-content">
                <p class="card-description">${Utils.escapeHtml(description)}</p>
                
                ${this.renderTags(feature.tags)}
            </div>
            
            <div class="card-footer">
                <div class="card-category">
                    <span class="category-icon">${categoryIcon}</span>
                    <span class="category-name">${categoryName}</span>
                </div>
                <div class="card-version">${feature.version || 'N/A'}</div>
            </div>
        `;
        
        return card;
    }
    
    /**
     * Render tags for a feature
     */
    renderTags(tags) {
        if (!tags || tags.length === 0) {
            return '';
        }
        
        const tagElements = tags
            .slice(0, 4) // Limit to 4 tags for display
            .map(tag => `<span class="card-tag">${Utils.escapeHtml(tag)}</span>`)
            .join('');
        
        const moreCount = tags.length - 4;
        const moreTag = moreCount > 0 ? `<span class="card-tag card-tag-more">+${moreCount}</span>` : '';
        
        return `
            <div class="card-tags">
                ${tagElements}
                ${moreTag}
            </div>
        `;
    }
    
    /**
     * Bind events to card element
     */
    bindEvents(cardElement, feature) {
        // Click handler
        const clickHandler = (e) => {
            e.preventDefault();
            this.handleCardClick(feature);
        };
        
        cardElement.addEventListener('click', clickHandler);
        
        // Keyboard handler
        const keyHandler = (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.handleCardClick(feature);
            }
        };
        
        cardElement.addEventListener('keydown', keyHandler);
        
        // Hover effects
        cardElement.addEventListener('mouseenter', () => {
            this.handleCardHover(cardElement, true);
        });
        
        cardElement.addEventListener('mouseleave', () => {
            this.handleCardHover(cardElement, false);
        });
        
        // Focus effects
        cardElement.addEventListener('focus', () => {
            cardElement.classList.add('focused');
        });
        
        cardElement.addEventListener('blur', () => {
            cardElement.classList.remove('focused');
        });
    }
    
    /**
     * Handle card click
     */
    handleCardClick(feature) {
        // Track interaction
        this.trackInteraction('card-click', feature);
        
        // Show modal if available
        if (this.modalComponent) {
            this.modalComponent.show(feature);
        } else {
            console.log('Card clicked:', feature);
        }
    }
    
    /**
     * Handle card hover
     */
    handleCardHover(cardElement, isHovering) {
        if (isHovering) {
            cardElement.classList.add('hovered');
        } else {
            cardElement.classList.remove('hovered');
        }
    }
    
    /**
     * Get category icon
     */
    getCategoryIcon(categoryId) {
        const iconMap = {
            'core': '🛠️',
            'interactive': '⚡',
            'agents': '🤖',
            'integrations': '🔗',
            'customization': '🎨',
            'configuration': '⚙️',
            'workflow': '🔄',
            'tools': '🔧',
            'optimization': '🚀',
            'deployment': '📦',
            'development': '💻',
            'collaboration': '👥',
            'enterprise': '🏢',
            'platform': '🌐',
            'analysis': '🔍'
        };
        
        return iconMap[categoryId] || '📋';
    }
    
    /**
     * Get category name
     */
    getCategoryName(categoryId, language = 'en') {
        // This could be enhanced to use actual category data
        const categoryNames = {
            'en': {
                'core': 'Core Features',
                'interactive': 'Interactive',
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
            },
            'zh': {
                'core': '核心功能',
                'interactive': '交互功能',
                'agents': '代理系统',
                'integrations': '集成功能',
                'customization': '自定义',
                'configuration': '配置管理',
                'workflow': '工作流程',
                'tools': '开发工具',
                'optimization': '优化功能',
                'deployment': '部署功能',
                'development': '开发功能',
                'collaboration': '协作功能',
                'enterprise': '企业功能',
                'platform': '平台支持',
                'analysis': '分析功能'
            }
        };
        
        return categoryNames[language]?.[categoryId] || categoryId;
    }
    
    /**
     * Get status label
     */
    getStatusLabel(status, language = 'en') {
        const statusLabels = {
            'en': {
                'stable': 'Stable',
                'beta': 'Beta',
                'new': 'New'
            },
            'zh': {
                'stable': '稳定',
                'beta': '测试版',
                'new': '新功能'
            }
        };
        
        return statusLabels[language]?.[status] || status;
    }
    
    /**
     * Update card language
     */
    updateCardLanguage(featureId, language) {
        const instance = this.cardInstances.get(featureId);
        if (!instance) return;
        
        const { element, feature } = instance;
        const newCard = this.createElement(feature, language);
        
        // Replace the old element with the new one
        element.parentNode.replaceChild(newCard, element);
        
        // Bind events to the new element
        this.bindEvents(newCard, feature);
        
        // Update the stored reference
        this.cardInstances.set(featureId, {
            element: newCard,
            feature: feature
        });
    }
    
    /**
     * Update all cards to new language
     */
    updateAllCardsLanguage(language) {
        this.cardInstances.forEach((instance, featureId) => {
            this.updateCardLanguage(featureId, language);
        });
    }
    
    /**
     * Highlight matching text in card
     */
    highlightCard(featureId, searchTerm) {
        const instance = this.cardInstances.get(featureId);
        if (!instance) return;
        
        const { element } = instance;
        
        if (searchTerm) {
            element.classList.add('highlighted');
            this.highlightText(element, searchTerm);
        } else {
            element.classList.remove('highlighted');
            this.removeHighlight(element);
        }
    }
    
    /**
     * Highlight text in element
     */
    highlightText(element, searchTerm) {
        const textElements = element.querySelectorAll('.card-title, .card-description');
        
        textElements.forEach(textElement => {
            const originalText = textElement.textContent;
            const regex = new RegExp(`(${Utils.escapeHtml(searchTerm)})`, 'gi');
            const highlightedText = originalText.replace(regex, '<mark>$1</mark>');
            
            if (highlightedText !== originalText) {
                textElement.innerHTML = highlightedText;
            }
        });
    }
    
    /**
     * Remove highlight from element
     */
    removeHighlight(element) {
        const marks = element.querySelectorAll('mark');
        marks.forEach(mark => {
            mark.replaceWith(mark.textContent);
        });
    }
    
    /**
     * Show loading state for card
     */
    showLoadingState(cardElement) {
        cardElement.classList.add('loading');
        cardElement.setAttribute('aria-busy', 'true');
    }
    
    /**
     * Hide loading state for card
     */
    hideLoadingState(cardElement) {
        cardElement.classList.remove('loading');
        cardElement.removeAttribute('aria-busy');
    }
    
    /**
     * Track user interactions for analytics
     */
    trackInteraction(action, feature) {
        // Simple interaction tracking
        const event = {
            action: action,
            featureId: feature.id,
            category: feature.category,
            timestamp: new Date().toISOString()
        };
        
        // In a real application, this would send to analytics service
        console.log('📊 Interaction tracked:', event);
        
        // Store in localStorage for basic analytics
        try {
            const interactions = JSON.parse(localStorage.getItem('claude-code-interactions') || '[]');
            interactions.push(event);
            
            // Keep only last 100 interactions
            if (interactions.length > 100) {
                interactions.splice(0, interactions.length - 100);
            }
            
            localStorage.setItem('claude-code-interactions', JSON.stringify(interactions));
        } catch (error) {
            console.warn('Failed to store interaction:', error);
        }
    }
    
    /**
     * Animate card entrance
     */
    animateEntrance(cardElement, delay = 0) {
        cardElement.style.opacity = '0';
        cardElement.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            cardElement.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
            cardElement.style.opacity = '1';
            cardElement.style.transform = 'translateY(0)';
        }, delay);
    }
    
    /**
     * Clean up card instance
     */
    destroy(featureId) {
        const instance = this.cardInstances.get(featureId);
        if (instance) {
            const { element } = instance;
            
            // Remove event listeners
            element.replaceWith(element.cloneNode(true));
            
            // Remove from instances map
            this.cardInstances.delete(featureId);
        }
    }
    
    /**
     * Clean up all card instances
     */
    destroyAll() {
        this.cardInstances.forEach((instance, featureId) => {
            this.destroy(featureId);
        });
        
        this.cardInstances.clear();
    }
    
    /**
     * Get card statistics
     */
    getStats() {
        return {
            totalCards: this.cardInstances.size,
            cardIds: Array.from(this.cardInstances.keys())
        };
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CardComponent;
} else {
    window.CardComponent = CardComponent;
}
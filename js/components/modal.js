/**
 * Modal Component for Claude Code Features Collection
 * Handles feature detail modal display and interaction
 */

class ModalComponent {
    constructor() {
        this.isOpen = false;
        this.currentFeature = null;
        this.currentLanguage = 'en';
        
        // DOM elements
        this.overlay = null;
        this.modal = null;
        this.title = null;
        this.content = null;
        this.closeButton = null;
        
        // Event handlers
        this.keydownHandler = this.handleKeydown.bind(this);
        this.clickHandler = this.handleOverlayClick.bind(this);
        
        this.init();
    }
    
    /**
     * Initialize the modal component
     */
    init() {
        this.overlay = document.getElementById('modal-overlay');
        this.modal = this.overlay?.querySelector('.modal');
        this.title = document.getElementById('modal-title');
        this.content = document.getElementById('modal-content');
        this.closeButton = document.getElementById('modal-close');
        
        if (!this.overlay || !this.modal || !this.title || !this.content || !this.closeButton) {
            console.warn('Modal elements not found in DOM');
            return;
        }
        
        this.bindEvents();
        console.log('✅ Modal component initialized');
    }
    
    /**
     * Bind event listeners
     */
    bindEvents() {
        // Close button
        this.closeButton.addEventListener('click', () => {
            this.close();
        });
        
        // Overlay click to close
        this.overlay.addEventListener('click', this.clickHandler);
        
        // Prevent modal content clicks from closing
        this.modal.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    }
    
    /**
     * Show modal with feature details
     */
    show(feature, language = 'en') {
        if (!this.overlay || !feature) {
            console.warn('Cannot show modal: missing elements or feature data');
            return;
        }
        
        this.currentFeature = feature;
        this.currentLanguage = language;
        
        // Update modal content
        this.updateContent(feature, language);
        
        // Show modal
        this.overlay.style.display = 'flex';
        this.overlay.setAttribute('aria-hidden', 'false');
        this.isOpen = true;
        
        // Focus management
        this.trapFocus();
        
        // Prevent body scroll
        document.body.style.overflow = 'hidden';
        
        // Add keyboard listener
        document.addEventListener('keydown', this.keydownHandler);
        
        // Animate in
        setTimeout(() => {
            this.overlay.classList.add('show');
        }, 10);
        
        console.log('📖 Modal opened for feature:', feature.id);
    }
    
    /**
     * Close modal
     */
    close() {
        if (!this.isOpen || !this.overlay) return;
        
        // Animate out
        this.overlay.classList.remove('show');
        
        // Hide after animation
        setTimeout(() => {
            this.overlay.style.display = 'none';
            this.overlay.setAttribute('aria-hidden', 'true');
            this.isOpen = false;
            
            // Restore body scroll
            document.body.style.overflow = '';
            
            // Remove keyboard listener
            document.removeEventListener('keydown', this.keydownHandler);
            
            // Clear current feature
            this.currentFeature = null;
            
            console.log('📖 Modal closed');
        }, 250);
    }
    
    /**
     * Update modal content
     */
    updateContent(feature, language) {
        // Update title
        const title = feature.title[language] || feature.title.en || 'Untitled';
        this.title.textContent = title;
        
        // Build content HTML
        const contentHtml = this.buildContentHtml(feature, language);
        this.content.innerHTML = contentHtml;
        
        // Update modal attributes
        this.modal.setAttribute('aria-labelledby', 'modal-title');
    }
    
    /**
     * Build modal content HTML
     */
    buildContentHtml(feature, language) {
        const description = feature.description[language] || feature.description.en || 'No description';
        const details = feature.details[language] || feature.details.en || '';
        
        return `
            <div class="modal-meta">
                <div class="modal-meta-item">
                    <div class="modal-meta-label" data-i18n="modal.category">Category</div>
                    <div class="modal-meta-value">
                        <span class="category-icon">${this.getCategoryIcon(feature.category)}</span>
                        ${this.getCategoryName(feature.category, language)}
                    </div>
                </div>
                
                <div class="modal-meta-item">
                    <div class="modal-meta-label" data-i18n="modal.status">Status</div>
                    <div class="modal-meta-value">
                        <span class="card-status status-${feature.status}">
                            ${this.getStatusLabel(feature.status, language)}
                        </span>
                    </div>
                </div>
                
                <div class="modal-meta-item">
                    <div class="modal-meta-label" data-i18n="modal.version">Version</div>
                    <div class="modal-meta-value">${feature.version || 'N/A'}</div>
                </div>
            </div>
            
            <div class="modal-description">
                ${Utils.escapeHtml(description)}
            </div>
            
            ${details ? `
                <div class="modal-details">
                    <p>${Utils.escapeHtml(details)}</p>
                </div>
            ` : ''}
            
            ${this.renderTags(feature.tags, language)}
            
            ${this.renderExamples(feature.examples, language)}
        `;
    }
    
    /**
     * Render tags section
     */
    renderTags(tags, language) {
        if (!tags || tags.length === 0) return '';
        
        const tagElements = tags
            .map(tag => `<span class="card-tag">${Utils.escapeHtml(tag)}</span>`)
            .join('');
        
        return `
            <div class="modal-section">
                <h4 data-i18n="modal.tags">Tags</h4>
                <div class="card-tags">
                    ${tagElements}
                </div>
            </div>
        `;
    }
    
    /**
     * Render examples section
     */
    renderExamples(examples, language) {
        if (!examples || examples.length === 0) return '';
        
        const exampleElements = examples
            .map(example => `<div class="example-code">${Utils.escapeHtml(example)}</div>`)
            .join('');
        
        return `
            <div class="modal-examples">
                <h4 data-i18n="modal.examples">Examples</h4>
                ${exampleElements}
            </div>
        `;
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
     * Handle keyboard events
     */
    handleKeydown(e) {
        if (!this.isOpen) return;
        
        switch (e.key) {
            case 'Escape':
                e.preventDefault();
                this.close();
                break;
                
            case 'Tab':
                this.handleTabKey(e);
                break;
        }
    }
    
    /**
     * Handle tab key for focus trapping
     */
    handleTabKey(e) {
        const focusableElements = this.modal.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        
        if (focusableElements.length === 0) return;
        
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        
        if (e.shiftKey && document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
        }
    }
    
    /**
     * Handle overlay click
     */
    handleOverlayClick(e) {
        if (e.target === this.overlay) {
            this.close();
        }
    }
    
    /**
     * Trap focus within modal
     */
    trapFocus() {
        // Focus the close button initially
        setTimeout(() => {
            this.closeButton?.focus();
        }, 100);
    }
    
    /**
     * Update modal language
     */
    updateLanguage(language) {
        if (!this.isOpen || !this.currentFeature) return;
        
        this.currentLanguage = language;
        this.updateContent(this.currentFeature, language);
    }
    
    /**
     * Check if modal is currently open
     */
    isModalOpen() {
        return this.isOpen;
    }
    
    /**
     * Get current feature
     */
    getCurrentFeature() {
        return this.currentFeature;
    }
    
    /**
     * Add copy-to-clipboard functionality for examples
     */
    addCopyFunctionality() {
        const examples = this.content.querySelectorAll('.example-code');
        
        examples.forEach(example => {
            const copyButton = document.createElement('button');
            copyButton.className = 'copy-button';
            copyButton.textContent = '📋';
            copyButton.title = 'Copy to clipboard';
            copyButton.setAttribute('aria-label', 'Copy example to clipboard');
            
            copyButton.addEventListener('click', async () => {
                const text = example.textContent;
                const success = await Utils.copyToClipboard(text);
                
                if (success) {
                    copyButton.textContent = '✅';
                    setTimeout(() => {
                        copyButton.textContent = '📋';
                    }, 2000);
                } else {
                    copyButton.textContent = '❌';
                    setTimeout(() => {
                        copyButton.textContent = '📋';
                    }, 2000);
                }
            });
            
            example.style.position = 'relative';
            example.appendChild(copyButton);
        });
    }
    
    /**
     * Destroy the modal component
     */
    destroy() {
        if (this.isOpen) {
            this.close();
        }
        
        // Remove event listeners
        if (this.closeButton) {
            this.closeButton.removeEventListener('click', this.close);
        }
        
        if (this.overlay) {
            this.overlay.removeEventListener('click', this.clickHandler);
        }
        
        document.removeEventListener('keydown', this.keydownHandler);
        
        // Clear references
        this.overlay = null;
        this.modal = null;
        this.title = null;
        this.content = null;
        this.closeButton = null;
        this.currentFeature = null;
        
        console.log('🗑️ Modal component destroyed');
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ModalComponent;
} else {
    window.ModalComponent = ModalComponent;
}
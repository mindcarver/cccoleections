/**
 * Document Viewer Component
 * Handles rendering and display of full documentation content
 */

class DocumentViewer {
    constructor() {
        this.currentDocument = null;
        this.currentLanguage = 'en';
        this.markedOptions = {
            highlight: function(code, lang) {
                if (lang && hljs.getLanguage(lang)) {
                    try {
                        return hljs.highlight(code, { language: lang }).value;
                    } catch (err) {
                        console.warn('Highlight.js error:', err);
                    }
                }
                return hljs.highlightAuto(code).value;
            },
            breaks: true,
            gfm: true
        };
        
        // Configure marked
        if (typeof marked !== 'undefined') {
            marked.setOptions(this.markedOptions);
        }
        
        this.init();
    }
    
    /**
     * Initialize the document viewer
     */
    init() {
        this.setupEventListeners();
        this.initializeCodeCopying();
    }
    
    /**
     * Render a document
     */
    async renderDocument(document, language = 'en') {
        try {
            this.currentDocument = document;
            this.currentLanguage = language;
            
            // Show loading state
            this.showLoading(true);
            
            // Hide welcome content and show document content
            this.hideWelcomeContent();
            this.showDocumentContent();
            
            // Render document header
            this.renderHeader(document, language);
            
            // Render document body
            await this.renderBody(document, language);
            
            // Render document footer
            this.renderFooter(document, language);
            
            // Update browser history
            this.updateHistory(document);
            
            // Generate table of contents
            this.generateTableOfContents();
            
            // Setup code syntax highlighting
            this.highlightCode();
            
            this.showLoading(false);
            
            // Scroll to top
            const mainContent = Utils.safeGetElement('main-content');
            if (mainContent) {
                mainContent.scrollTop = 0;
            }
            
        } catch (error) {
            console.error('Failed to render document:', error);
            this.showError('Failed to load document content');
            this.showLoading(false);
        }
    }
    
    /**
     * Render document header
     */
    renderHeader(doc, language) {
        const categoryElement = Utils.safeGetElement('document-category');
        const difficultyElement = Utils.safeGetElement('document-difficulty');
        const readingTimeElement = Utils.safeGetElement('document-reading-time');
        const titleElement = Utils.safeGetElement('document-title');
        const descriptionElement = Utils.safeGetElement('document-description');
        const tagsElement = Utils.safeGetElement('document-tags');
        
        if (categoryElement) {
            categoryElement.textContent = doc.category.charAt(0).toUpperCase() + doc.category.slice(1);
        }
        
        if (difficultyElement) {
            difficultyElement.textContent = doc.metadata.difficulty.charAt(0).toUpperCase() + doc.metadata.difficulty.slice(1);
        }
        
        if (readingTimeElement) {
            readingTimeElement.textContent = `${doc.metadata.readingTime} min read`;
        }
        
        if (titleElement) {
            titleElement.textContent = doc.title[language] || doc.title.en;
        }
        
        if (descriptionElement) {
            descriptionElement.textContent = doc.description[language] || doc.description.en;
        }
        
        if (tagsElement) {
            tagsElement.innerHTML = '';
            if (doc.metadata.tags) {
                doc.metadata.tags.forEach(tag => {
                    const tagElement = document.createElement('span');
                    tagElement.className = 'document-tag';
                    tagElement.textContent = tag;
                    tagsElement.appendChild(tagElement);
                });
            }
        }
    }
    
    /**
     * Render document body
     */
    async renderBody(doc, language) {
        const bodyElement = Utils.safeGetElement('document-body');
        if (!bodyElement) return;
        
        bodyElement.innerHTML = '';
        
        // Render overview
        if (doc.content.overview) {
            const overviewText = doc.content.overview[language] || doc.content.overview.en;
            if (overviewText) {
                const overviewDiv = document.createElement('div');
                overviewDiv.className = 'document-overview';
                overviewDiv.innerHTML = this.parseMarkdown(overviewText);
                bodyElement.appendChild(overviewDiv);
            }
        }
        
        // Render sections
        if (doc.content.sections && doc.content.sections.length > 0) {
            doc.content.sections.forEach(section => {
                const sectionDiv = document.createElement('div');
                sectionDiv.className = 'document-section';
                sectionDiv.id = `section-${section.id}`;
                
                const sectionContent = section.content[language] || section.content.en;
                if (sectionContent) {
                    sectionDiv.innerHTML = this.parseMarkdown(sectionContent);
                }
                
                bodyElement.appendChild(sectionDiv);
            });
        }
        
        // Render code examples
        if (doc.codeExamples && doc.codeExamples.length > 0) {
            const examplesSection = this.createCodeExamplesSection(doc.codeExamples);
            bodyElement.appendChild(examplesSection);
        }
        
        // Render best practices
        if (doc.bestPractices && doc.bestPractices.length > 0) {
            const practicesSection = this.createBestPracticesSection(doc.bestPractices);
            bodyElement.appendChild(practicesSection);
        }
        
        // Render common issues
        if (doc.commonIssues && doc.commonIssues.length > 0) {
            const issuesSection = this.createCommonIssuesSection(doc.commonIssues);
            bodyElement.appendChild(issuesSection);
        }
    }
    
    /**
     * Create code examples section
     */
    createCodeExamplesSection(examples) {
        const section = document.createElement('div');
        section.className = 'code-examples-section';
        
        const title = document.createElement('h2');
        title.textContent = 'Code Examples';
        title.id = 'code-examples';
        section.appendChild(title);
        
        examples.forEach((example, index) => {
            const exampleDiv = document.createElement('div');
            exampleDiv.className = 'code-example';
            
            const header = document.createElement('div');
            header.className = 'code-example-header';
            
            const titleSpan = document.createElement('span');
            titleSpan.className = 'code-example-title';
            titleSpan.textContent = example.title;
            
            const langSpan = document.createElement('span');
            langSpan.className = 'code-example-language';
            langSpan.textContent = example.language;
            
            header.appendChild(titleSpan);
            header.appendChild(langSpan);
            
            const body = document.createElement('div');
            body.className = 'code-example-body';
            
            const pre = document.createElement('pre');
            const code = document.createElement('code');
            code.className = `language-${example.language}`;
            code.textContent = example.code;
            
            pre.appendChild(code);
            body.appendChild(pre);
            
            // Add copy button
            const copyBtn = document.createElement('button');
            copyBtn.className = 'copy-code-btn';
            copyBtn.textContent = 'Copy';
            copyBtn.onclick = () => this.copyCodeToClipboard(example.code, copyBtn);
            body.appendChild(copyBtn);
            
            exampleDiv.appendChild(header);
            exampleDiv.appendChild(body);
            section.appendChild(exampleDiv);
        });
        
        return section;
    }
    
    /**
     * Create best practices section
     */
    createBestPracticesSection(practices) {
        const section = document.createElement('div');
        section.className = 'best-practices';
        
        const title = document.createElement('h2');
        title.textContent = 'Best Practices';
        title.id = 'best-practices';
        section.appendChild(title);
        
        practices.forEach(practice => {
            const practiceDiv = document.createElement('div');
            practiceDiv.className = 'practice-item';
            
            const practiceTitle = document.createElement('h4');
            practiceTitle.className = 'practice-title';
            practiceTitle.textContent = practice.title;
            
            const practiceDesc = document.createElement('p');
            practiceDesc.className = 'practice-description';
            practiceDesc.textContent = practice.description;
            
            practiceDiv.appendChild(practiceTitle);
            practiceDiv.appendChild(practiceDesc);
            section.appendChild(practiceDiv);
        });
        
        return section;
    }
    
    /**
     * Create common issues section
     */
    createCommonIssuesSection(issues) {
        const section = document.createElement('div');
        section.className = 'common-issues';
        
        const title = document.createElement('h2');
        title.textContent = 'Common Issues';
        title.id = 'common-issues';
        section.appendChild(title);
        
        issues.forEach(issue => {
            const issueDiv = document.createElement('div');
            issueDiv.className = 'issue-item';
            
            const issueTitle = document.createElement('h4');
            issueTitle.className = 'issue-title';
            issueTitle.textContent = issue.issue;
            
            const issueSolution = document.createElement('p');
            issueSolution.className = 'issue-solution';
            issueSolution.textContent = issue.solution;
            
            issueDiv.appendChild(issueTitle);
            issueDiv.appendChild(issueSolution);
            section.appendChild(issueDiv);
        });
        
        return section;
    }
    
    /**
     * Render document footer with source attribution
     */
    renderFooter(doc, language) {
        const attributionElement = document.getElementById('source-attribution');
        if (!attributionElement || !doc.source) return;
        
        attributionElement.innerHTML = `
            <div class="source-title">Source Information</div>
            <div class="source-info">
                <strong>Author:</strong> ${Utils.escapeHtml(doc.source.author)}
            </div>
            <div class="source-info">
                <strong>Original URL:</strong> 
                <a href="${doc.source.originalUrl}" target="_blank" rel="noopener noreferrer" class="source-link">
                    ${Utils.escapeHtml(doc.source.originalUrl)}
                </a>
            </div>
            <div class="source-info">
                <strong>Last Updated:</strong> ${Utils.formatDate(doc.source.lastUpdated)}
            </div>
            <div class="source-info">
                <strong>License:</strong> ${Utils.escapeHtml(doc.source.license || 'Not specified')}
            </div>
            <div class="source-info">
                <strong>Copyright:</strong> ${Utils.escapeHtml(doc.source.copyright)}
            </div>
        `;
    }
    
    /**
     * Parse markdown content
     */
    parseMarkdown(content) {
        if (typeof marked !== 'undefined') {
            return marked.parse(content);
        } else {
            // Fallback for basic markdown parsing
            return content
                .replace(/^## (.*$)/gim, '<h2>$1</h2>')
                .replace(/^### (.*$)/gim, '<h3>$1</h3>')
                .replace(/^# (.*$)/gim, '<h1>$1</h1>')
                .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
                .replace(/\*(.*)\*/gim, '<em>$1</em>')
                .replace(/`([^`]+)`/gim, '<code>$1</code>')
                .replace(/\n/gim, '<br>');
        }
    }
    
    /**
     * Generate table of contents
     */
    generateTableOfContents() {
        const tocElement = document.getElementById('table-of-contents');
        if (!tocElement) return;
        
        const bodyElement = document.getElementById('document-body');
        if (!bodyElement) return;
        
        const headings = bodyElement.querySelectorAll('h1, h2, h3, h4, h5, h6');
        
        if (headings.length === 0) {
            tocElement.innerHTML = '<p class="toc-empty">No headings found</p>';
            return;
        }
        
        const tocList = document.createElement('ul');
        tocList.className = 'toc-list';
        
        headings.forEach((heading, index) => {
            // Create ID for heading if it doesn't have one
            if (!heading.id) {
                heading.id = `heading-${index}`;
            }
            
            const listItem = document.createElement('li');
            listItem.className = 'toc-item';
            
            const link = document.createElement('a');
            link.href = `#${heading.id}`;
            link.className = `toc-link level-${heading.tagName.toLowerCase().charAt(1)}`;
            link.textContent = heading.textContent;
            
            // Smooth scroll to heading
            link.addEventListener('click', (e) => {
                e.preventDefault();
                heading.scrollIntoView({ behavior: 'smooth', block: 'start' });
                
                // Update active state
                document.querySelectorAll('.toc-link').forEach(l => l.classList.remove('active'));
                link.classList.add('active');
                
                // Update URL hash
                history.replaceState(null, null, `#${heading.id}`);
            });
            
            listItem.appendChild(link);
            tocList.appendChild(listItem);
        });
        
        tocElement.innerHTML = '';
        tocElement.appendChild(tocList);
        
        // Highlight active section on scroll
        this.setupScrollSpy();
    }
    
    /**
     * Setup scroll spy for table of contents
     */
    setupScrollSpy() {
        const headings = document.querySelectorAll('#document-body h1, #document-body h2, #document-body h3, #document-body h4, #document-body h5, #document-body h6');
        const tocLinks = document.querySelectorAll('.toc-link');
        
        if (headings.length === 0 || tocLinks.length === 0) return;
        
        const observerOptions = {
            rootMargin: '-20% 0px -35% 0px',
            threshold: 0
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const id = entry.target.id;
                const tocLink = document.querySelector(`.toc-link[href="#${id}"]`);
                
                if (entry.isIntersecting) {
                    // Remove active class from all links
                    tocLinks.forEach(link => link.classList.remove('active'));
                    // Add active class to current link
                    if (tocLink) {
                        tocLink.classList.add('active');
                    }
                }
            });
        }, observerOptions);
        
        headings.forEach(heading => observer.observe(heading));
    }
    
    /**
     * Setup code syntax highlighting
     */
    highlightCode() {
        if (typeof hljs !== 'undefined') {
            document.querySelectorAll('pre code').forEach((block) => {
                hljs.highlightElement(block);
            });
        }
    }
    
    /**
     * Initialize code copying functionality
     */
    initializeCodeCopying() {
        // This will be called after document render
    }
    
    /**
     * Copy code to clipboard
     */
    async copyCodeToClipboard(code, button) {
        try {
            await Utils.copyToClipboard(code);
            
            // Visual feedback
            const originalText = button.textContent;
            button.textContent = 'Copied!';
            button.style.background = 'var(--color-success)';
            button.style.color = 'white';
            
            setTimeout(() => {
                button.textContent = originalText;
                button.style.background = '';
                button.style.color = '';
            }, 2000);
            
        } catch (error) {
            console.error('Failed to copy code:', error);
            button.textContent = 'Failed';
            setTimeout(() => {
                button.textContent = 'Copy';
            }, 2000);
        }
    }
    
    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Reading mode toggle
        const readingModeBtn = document.getElementById('toggle-reading-mode');
        if (readingModeBtn) {
            readingModeBtn.addEventListener('click', () => {
                document.body.classList.toggle('reading-mode');
                const isReading = document.body.classList.contains('reading-mode');
                readingModeBtn.querySelector('span:last-child').textContent = 
                    isReading ? 'Exit Reading' : 'Reading Mode';
            });
        }
        
        // Copy link button
        const copyLinkBtn = document.getElementById('copy-link');
        if (copyLinkBtn) {
            copyLinkBtn.addEventListener('click', () => {
                const url = window.location.href;
                Utils.copyToClipboard(url).then(() => {
                    const icon = copyLinkBtn.querySelector('.icon');
                    const text = copyLinkBtn.querySelector('span:last-child');
                    icon.textContent = '✓';
                    text.textContent = 'Copied!';
                    setTimeout(() => {
                        icon.textContent = '🔗';
                        text.textContent = 'Copy Link';
                    }, 2000);
                });
            });
        }
        
        // Print button
        const printBtn = document.getElementById('print-doc');
        if (printBtn) {
            printBtn.addEventListener('click', () => {
                window.print();
            });
        }
    }
    
    /**
     * Show welcome content
     */
    showWelcomeContent() {
        const welcome = document.getElementById('welcome-content');
        const documentContent = document.getElementById('document-content');
        const emptyState = document.getElementById('empty-state');
        
        if (welcome) welcome.style.display = 'block';
        if (documentContent) documentContent.style.display = 'none';
        if (emptyState) emptyState.style.display = 'none';
    }
    
    /**
     * Hide welcome content
     */
    hideWelcomeContent() {
        const welcome = document.getElementById('welcome-content');
        if (welcome) welcome.style.display = 'none';
    }
    
    /**
     * Show document content
     */
    showDocumentContent() {
        const documentContent = document.getElementById('document-content');
        const emptyState = document.getElementById('empty-state');
        
        if (documentContent) documentContent.style.display = 'block';
        if (emptyState) emptyState.style.display = 'none';
    }
    
    /**
     * Show empty state
     */
    showEmptyState() {
        const welcome = document.getElementById('welcome-content');
        const documentContent = document.getElementById('document-content');
        const emptyState = document.getElementById('empty-state');
        
        if (welcome) welcome.style.display = 'none';
        if (documentContent) documentContent.style.display = 'none';
        if (emptyState) emptyState.style.display = 'block';
    }
    
    /**
     * Show/hide loading state
     */
    showLoading(show) {
        const loading = document.getElementById('content-loading');
        if (loading) {
            loading.style.display = show ? 'flex' : 'none';
        }
    }
    
    /**
     * Show error message
     */
    showError(message) {
        console.error('DocumentViewer Error:', message);
        this.showEmptyState();
        
        const emptyTitle = document.querySelector('#empty-state h3');
        const emptyMessage = document.querySelector('#empty-state p');
        
        if (emptyTitle) emptyTitle.textContent = 'Error Loading Document';
        if (emptyMessage) emptyMessage.textContent = message;
    }
    
    /**
     * Update browser history
     */
    updateHistory(doc) {
        const url = new URL(window.location);
        url.searchParams.set('doc', doc.id);
        history.pushState({ docId: doc.id }, '', url);
    }
    
    /**
     * Get current document
     */
    getCurrentDocument() {
        return this.currentDocument;
    }
    
    /**
     * Set language
     */
    setLanguage(language) {
        this.currentLanguage = language;
        if (this.currentDocument) {
            this.renderDocument(this.currentDocument, language);
        }
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DocumentViewer;
} else {
    window.DocumentViewer = DocumentViewer;
}
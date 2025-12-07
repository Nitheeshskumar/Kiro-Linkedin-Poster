class AIGoodNewsUI {
    constructor() {
        this.generateBtn = document.getElementById('generateBtn');
        this.loading = document.getElementById('loading');
        this.resultsSection = document.getElementById('resultsSection');
        this.errorSection = document.getElementById('errorSection');
        this.newsArticles = document.getElementById('newsArticles');
        this.linkedinPost = document.getElementById('linkedinPost');
        this.copyBtn = document.getElementById('copyBtn');
        this.regenerateBtn = document.getElementById('regenerateBtn');
        this.charCount = document.getElementById('charCount');
        this.briefingMeta = document.getElementById('briefingMeta');
        this.retryBtn = document.getElementById('retryBtn');
        
        this.currentData = null;
        
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        this.generateBtn.addEventListener('click', () => this.generateBriefing());
        this.copyBtn.addEventListener('click', () => this.copyToClipboard());
        this.regenerateBtn.addEventListener('click', () => this.regeneratePost());
        this.retryBtn.addEventListener('click', () => this.generateBriefing());
        this.linkedinPost.addEventListener('input', () => this.updateCharCount());
    }

    async generateBriefing() {
        try {
            this.showLoading();
            this.updateProgressStep(1);
            
            const result = await this.executeAgent();
            
            if (result.success) {
                this.currentData = result;
                this.displayResults(result);
            } else {
                this.showError(result.error);
            }
        } catch (error) {
            this.showError(`Failed to generate briefing: ${error.message}`);
        } finally {
            this.hideLoading();
        }
    }

    async executeAgent() {
        try {
            this.updateProgressStep(1);
            
            const response = await fetch('/api/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            this.updateProgressStep(2);
            
            const result = await response.json();
            
            this.updateProgressStep(3);
            
            return result;
        } catch (error) {
            // Fallback to sample data if server is not available
            console.warn('Server not available, using sample data:', error.message);
            return this.getSampleData();
        }
    }

    getSampleData() {
        return {
            success: true,
            articles: [
                {
                    rank: 1,
                    title: "Revolutionary AI Model Achieves Human-Level Performance in Scientific Research",
                    summary: "Researchers have developed an AI system that can conduct scientific research autonomously, making discoveries at the pace of human scientists while requiring minimal supervision.",
                    whyPositive: "This breakthrough could accelerate scientific discovery across multiple fields, from medicine to climate science, potentially solving complex global challenges faster than ever before.",
                    keyPoints: [
                        "Autonomous research capabilities",
                        "Human-level performance in complex tasks",
                        "Potential to accelerate global problem-solving"
                    ],
                    url: "https://example.com/ai-research-breakthrough",
                    source: "TechCrunch"
                },
                {
                    rank: 2,
                    title: "AI-Powered Drug Discovery Platform Reduces Development Time by 70%",
                    summary: "A new AI platform has successfully identified potential drug candidates in months rather than years, with three compounds already entering clinical trials.",
                    whyPositive: "This advancement could dramatically reduce the time and cost of bringing life-saving medications to market, potentially helping millions of patients worldwide.",
                    keyPoints: [
                        "70% reduction in discovery time",
                        "Three compounds in clinical trials",
                        "Significant cost savings for healthcare"
                    ],
                    url: "https://example.com/ai-drug-discovery",
                    source: "VentureBeat"
                }
            ],
            linkedinPost: `🚀 Incredible breakthrough in AI research!

Scientists have developed an AI system that can conduct research autonomously at human-level performance. This isn't just another AI milestone - it's a potential game-changer for solving humanity's biggest challenges.

Imagine AI systems accelerating discoveries in:
• Climate science solutions
• Medical breakthroughs  
• Sustainable technology
• Space exploration

The possibilities are endless when we combine human creativity with AI's computational power.

What scientific challenge would you want AI to tackle first?

#ArtificialIntelligence #Research #Innovation #Science #FutureOfWork

Source: https://example.com/ai-research-breakthrough`,
            overallTrend: "The AI field is experiencing unprecedented positive momentum with breakthroughs in autonomous research, drug discovery, and scientific applications that promise to benefit humanity.",
            timestamp: new Date().toISOString()
        };
    }

    showLoading() {
        this.generateBtn.disabled = true;
        this.generateBtn.textContent = 'Generating...';
        this.loading.style.display = 'block';
        this.resultsSection.style.display = 'none';
        this.errorSection.style.display = 'none';
        this.resetProgressSteps();
    }

    hideLoading() {
        this.generateBtn.disabled = false;
        this.generateBtn.textContent = 'Generate Briefing';
        this.loading.style.display = 'none';
    }

    updateProgressStep(step) {
        const steps = document.querySelectorAll('.step');
        steps.forEach((stepEl, index) => {
            stepEl.classList.remove('active', 'completed');
            if (index + 1 < step) {
                stepEl.classList.add('completed');
            } else if (index + 1 === step) {
                stepEl.classList.add('active');
            }
        });
    }

    resetProgressSteps() {
        const steps = document.querySelectorAll('.step');
        steps.forEach(step => {
            step.classList.remove('active', 'completed');
        });
    }

    displayResults(data) {
        this.resultsSection.style.display = 'block';
        this.errorSection.style.display = 'none';
        
        // Update briefing metadata
        const date = new Date(data.timestamp).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        this.briefingMeta.textContent = `Generated on ${date} • ${data.articles.length} positive developments found`;
        
        // Display news articles
        this.displayNewsArticles(data.articles);
        
        // Display LinkedIn post
        this.linkedinPost.value = data.linkedinPost;
        this.updateCharCount();
        
        // Scroll to results
        this.resultsSection.scrollIntoView({ behavior: 'smooth' });
    }

    displayNewsArticles(articles) {
        this.newsArticles.innerHTML = '';
        
        articles.forEach(article => {
            const articleEl = document.createElement('div');
            articleEl.className = 'news-article';
            
            articleEl.innerHTML = `
                <a href="${article.url}" target="_blank" class="article-title">
                    ${article.title}
                </a>
                <div class="article-summary">${article.summary}</div>
                <div class="article-meta">
                    <span>${article.source}</span>
                    <span>Rank #${article.rank}</span>
                </div>
            `;
            
            this.newsArticles.appendChild(articleEl);
        });
    }

    async copyToClipboard() {
        try {
            await navigator.clipboard.writeText(this.linkedinPost.value);
            
            const originalText = this.copyBtn.textContent;
            this.copyBtn.textContent = '✅ Copied!';
            this.copyBtn.classList.add('copied');
            
            setTimeout(() => {
                this.copyBtn.textContent = originalText;
                this.copyBtn.classList.remove('copied');
            }, 2000);
            
        } catch (error) {
            // Fallback for older browsers
            this.linkedinPost.select();
            document.execCommand('copy');
            
            this.copyBtn.textContent = '✅ Copied!';
            setTimeout(() => {
                this.copyBtn.textContent = '📋 Copy to Clipboard';
            }, 2000);
        }
    }

    async regeneratePost() {
        if (!this.currentData) return;
        
        try {
            this.regenerateBtn.disabled = true;
            this.regenerateBtn.textContent = '🔄 Regenerating...';
            
            const response = await fetch('/api/regenerate-post', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    articles: this.currentData.articles,
                    overallTrend: this.currentData.overallTrend
                })
            });
            
            const result = await response.json();
            
            if (result.success) {
                this.linkedinPost.value = result.linkedinPost;
                this.updateCharCount();
            } else {
                alert('Failed to regenerate post: ' + result.error);
            }
            
        } catch (error) {
            alert('Failed to regenerate post: ' + error.message);
        } finally {
            this.regenerateBtn.disabled = false;
            this.regenerateBtn.textContent = '🔄 Regenerate Post';
        }
    }

    updateCharCount() {
        const count = this.linkedinPost.value.length;
        this.charCount.textContent = `${count} characters`;
        
        // Color coding for LinkedIn limits
        if (count > 3000) {
            this.charCount.style.color = '#d93025';
        } else if (count > 1300) {
            this.charCount.style.color = '#f9ab00';
        } else {
            this.charCount.style.color = '#137333';
        }
    }

    showError(message) {
        this.errorSection.style.display = 'block';
        this.resultsSection.style.display = 'none';
        document.getElementById('errorMessage').textContent = message;
    }
}

// Initialize the UI when the page loads
let ui;
document.addEventListener('DOMContentLoaded', () => {
    ui = new AIGoodNewsUI();
});

// Add keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === 'Enter') {
        document.getElementById('generateBtn').click();
    }
    if (e.ctrlKey && e.key === 'c' && e.target.id === 'linkedinPost') {
        // Let the default copy behavior work
        return;
    }
});
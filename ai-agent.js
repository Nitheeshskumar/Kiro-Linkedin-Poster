const https = require('https');
const fs = require('fs');

class AIGoodNewsAgent {
    constructor() {
        this.geminiApiKey = process.env.GEMINI_API_KEY;
        this.newsApiKey = process.env.NEWS_API_KEY;
        this.seenArticles = this.loadSeenArticles();
    }

    loadSeenArticles() {
        try {
            if (fs.existsSync('seen-articles.json')) {
                return JSON.parse(fs.readFileSync('seen-articles.json', 'utf8'));
            }
        } catch (error) {
            console.log('No previous articles found, starting fresh');
        }
        return [];
    }

    saveSeenArticles() {
        fs.writeFileSync('seen-articles.json', JSON.stringify(this.seenArticles, null, 2));
    }

    async searchAINews() {
        console.log('🔍 Searching for AI news...');
        
        const sources = [
            'techcrunch.com',
            'venturebeat.com',
            'theverge.com',
            'wired.com',
            'arstechnica.com',
            'technologyreview.com'
        ];

        const keywords = [
            'artificial intelligence breakthrough',
            'AI advancement',
            'machine learning progress',
            'AI startup funding',
            'AI research breakthrough',
            'generative AI innovation'
        ];

        let allArticles = [];

        // Use NewsAPI if available, otherwise use DuckDuckGo
        if (this.newsApiKey) {
            allArticles = await this.searchWithNewsAPI(keywords);
        } else {
            allArticles = await this.searchWithDuckDuckGo(keywords);
        }

        // Filter out seen articles
        const newArticles = allArticles.filter(article => 
            !this.seenArticles.includes(article.url)
        );

        console.log(`📰 Found ${newArticles.length} new articles`);
        return newArticles;
    }

    async searchWithNewsAPI(keywords) {
        const articles = [];
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        
        for (const keyword of keywords) {
            try {
                const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(keyword)}&from=${yesterday.toISOString().split('T')[0]}&sortBy=relevancy&language=en&apiKey=${this.newsApiKey}`;
                
                const response = await this.makeHttpRequest(url);
                const data = JSON.parse(response);
                
                if (data.articles) {
                    articles.push(...data.articles.map(article => ({
                        title: article.title,
                        description: article.description,
                        url: article.url,
                        source: article.source.name,
                        publishedAt: article.publishedAt,
                        content: article.content
                    })));
                }
            } catch (error) {
                console.error(`Error searching for ${keyword}:`, error.message);
            }
        }
        
        return articles;
    }

    async searchWithDuckDuckGo(keywords) {
        const articles = [];
        
        for (const keyword of keywords) {
            try {
                const url = `https://api.duckduckgo.com/?q=${encodeURIComponent(keyword + ' site:techcrunch.com OR site:venturebeat.com OR site:theverge.com')}&format=json&no_html=1`;
                
                const response = await this.makeHttpRequest(url);
                const data = JSON.parse(response);
                
                if (data.RelatedTopics) {
                    for (const topic of data.RelatedTopics) {
                        if (topic.FirstURL && topic.Text) {
                            articles.push({
                                title: this.extractTitle(topic.Text),
                                description: topic.Text,
                                url: topic.FirstURL,
                                source: this.extractDomain(topic.FirstURL),
                                publishedAt: new Date().toISOString(),
                                content: topic.Text
                            });
                        }
                    }
                }
            } catch (error) {
                console.error(`Error searching DuckDuckGo for ${keyword}:`, error.message);
            }
        }
        
        return articles;
    }

    async analyzeWithGemini(articles) {
        console.log('🤖 Analyzing articles with Gemini...');
        
        if (!this.geminiApiKey) {
            console.log('⚠️ No Gemini API key found, using fallback analysis');
            return this.fallbackAnalysis(articles);
        }

        const prompt = `
Analyze these AI news articles and identify the most positive, breakthrough-worthy developments. 
Focus on genuine progress, innovations, and positive impacts of AI technology.

Articles:
${articles.map((article, i) => `
${i + 1}. Title: ${article.title}
   Description: ${article.description}
   Source: ${article.source}
`).join('\n')}

Please:
1. Rank the articles by their positive impact and innovation level
2. Identify the top 3 most significant positive developments
3. Explain why each is noteworthy and positive for the AI field
4. Provide a brief summary of each article's key points

Format your response as JSON with this structure:
{
  "topArticles": [
    {
      "rank": 1,
      "title": "...",
      "summary": "...",
      "whyPositive": "...",
      "keyPoints": ["...", "..."],
      "originalIndex": 0
    }
  ],
  "overallTrend": "Brief analysis of the overall positive trends in AI"
}
`;

        try {
            const analysis = await this.callGeminiAPI(prompt);
            return JSON.parse(analysis);
        } catch (error) {
            console.error('Gemini analysis failed:', error.message);
            return this.fallbackAnalysis(articles);
        }
    }

    async callGeminiAPI(prompt) {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${this.geminiApiKey}`;
        
        const requestBody = JSON.stringify({
            contents: [{
                parts: [{
                    text: prompt
                }]
            }],
            generationConfig: {
                temperature: 0.7,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 2048
            }
        });

        const response = await this.makeHttpRequest(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        }, requestBody);

        const data = JSON.parse(response);
        
        if (data.candidates && data.candidates[0] && data.candidates[0].content) {
            return data.candidates[0].content.parts[0].text;
        }
        
        throw new Error('Invalid Gemini API response');
    }

    fallbackAnalysis(articles) {
        // Simple fallback analysis without AI
        const positiveKeywords = ['breakthrough', 'innovation', 'advancement', 'progress', 'success', 'achievement', 'improvement'];
        
        const scored = articles.map((article, index) => {
            let score = 0;
            const text = (article.title + ' ' + article.description).toLowerCase();
            
            positiveKeywords.forEach(keyword => {
                if (text.includes(keyword)) score += 1;
            });
            
            return { ...article, score, originalIndex: index };
        });

        const topArticles = scored
            .sort((a, b) => b.score - a.score)
            .slice(0, 3)
            .map((article, rank) => ({
                rank: rank + 1,
                title: article.title,
                summary: article.description,
                whyPositive: "This development represents positive progress in AI technology",
                keyPoints: [
                    "Advances the field of artificial intelligence",
                    "Demonstrates practical applications of AI",
                    "Shows continued innovation in the sector"
                ],
                originalIndex: article.originalIndex
            }));

        return {
            topArticles,
            overallTrend: "The AI field continues to show positive developments with new breakthroughs and innovations emerging regularly."
        };
    }

    async generateLinkedInPost(analysis, articles) {
        console.log('✍️ Generating LinkedIn post...');
        
        if (!this.geminiApiKey) {
            return this.generateFallbackPost(analysis, articles);
        }

        const topArticle = analysis.topArticles[0];
        const originalArticle = articles[topArticle.originalIndex];

        const prompt = `
Create an engaging LinkedIn post about this positive AI development:

Title: ${topArticle.title}
Summary: ${topArticle.summary}
Why it's positive: ${topArticle.whyPositive}
Key points: ${topArticle.keyPoints.join(', ')}
Source: ${originalArticle.source}

Guidelines:
- Start with an engaging hook that captures attention
- Highlight the positive impact and innovation
- Keep it professional but enthusiastic
- Include relevant hashtags (3-5 maximum)
- End with a question to encourage engagement
- Keep under 1300 characters for optimal LinkedIn performance
- Include the source link at the end

Make it sound authentic and optimistic about AI's future.
`;

        try {
            const post = await this.callGeminiAPI(prompt);
            return this.formatLinkedInPost(post, originalArticle.url);
        } catch (error) {
            console.error('LinkedIn post generation failed:', error.message);
            return this.generateFallbackPost(analysis, articles);
        }
    }

    generateFallbackPost(analysis, articles) {
        const topArticle = analysis.topArticles[0];
        const originalArticle = articles[topArticle.originalIndex];
        
        const post = `🚀 Exciting developments in AI! 

${topArticle.title}

${topArticle.summary}

This is exactly the kind of positive progress we need to see in artificial intelligence - innovation that moves the field forward and creates real value.

What are your thoughts on this development? How do you see AI evolving in your industry?

#ArtificialIntelligence #AI #Innovation #Technology #FutureOfWork

Source: ${originalArticle.url}`;

        return post;
    }

    formatLinkedInPost(post, sourceUrl) {
        // Ensure the post includes the source URL if not already present
        if (!post.includes('http') && sourceUrl) {
            post += `\n\nSource: ${sourceUrl}`;
        }
        
        return post;
    }

    async run() {
        try {
            console.log('🤖 AI Good News Agent starting...');
            
            // Step 1: Search for AI news
            const articles = await this.searchAINews();
            
            if (articles.length === 0) {
                return {
                    success: false,
                    error: 'No new AI articles found in the last 24 hours'
                };
            }

            // Step 2: Analyze with Gemini
            const analysis = await this.analyzeWithGemini(articles);
            
            // Step 3: Generate LinkedIn post
            const linkedinPost = await this.generateLinkedInPost(analysis, articles);
            
            // Step 4: Mark articles as seen
            articles.forEach(article => {
                if (!this.seenArticles.includes(article.url)) {
                    this.seenArticles.push(article.url);
                }
            });
            this.saveSeenArticles();
            
            console.log('✅ AI Good News Agent completed successfully');
            
            return {
                success: true,
                articles: analysis.topArticles.map(article => ({
                    ...article,
                    url: articles[article.originalIndex].url,
                    source: articles[article.originalIndex].source
                })),
                linkedinPost,
                overallTrend: analysis.overallTrend,
                timestamp: new Date().toISOString()
            };
            
        } catch (error) {
            console.error('❌ AI Good News Agent failed:', error.message);
            return {
                success: false,
                error: error.message
            };
        }
    }

    makeHttpRequest(url, options = {}, body = null) {
        return new Promise((resolve, reject) => {
            const urlObj = new URL(url);
            const requestOptions = {
                hostname: urlObj.hostname,
                port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
                path: urlObj.pathname + urlObj.search,
                method: options.method || 'GET',
                headers: options.headers || {}
            };

            const req = https.request(requestOptions, (res) => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => {
                    if (res.statusCode >= 200 && res.statusCode < 300) {
                        resolve(data);
                    } else {
                        reject(new Error(`HTTP ${res.statusCode}: ${res.statusMessage}`));
                    }
                });
            });

            req.on('error', reject);
            
            if (body) {
                req.write(body);
            }
            
            req.end();
        });
    }

    extractTitle(text) {
        const sentences = text.split(/[.!?]/);
        return sentences[0].trim().substring(0, 100);
    }

    extractDomain(url) {
        try {
            return new URL(url).hostname.replace('www.', '');
        } catch {
            return 'unknown';
        }
    }
}

module.exports = AIGoodNewsAgent;
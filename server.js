require('dotenv').config();
const express = require('express');
const AIGoodNewsAgent = require('./ai-agent');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;

// Serve static files
app.use(express.static('.'));
app.use(express.json());

// API endpoint to execute the AI Good News Agent
app.post('/api/generate', async (req, res) => {
    try {
        console.log('🚀 Starting AI Good News Agent...');
        
        const agent = new AIGoodNewsAgent();
        const result = await agent.run();
        
        if (result.success) {
            console.log(`✅ Successfully generated briefing with ${result.articles.length} articles`);
            res.json(result);
        } else {
            console.error('❌ Agent execution failed:', result.error);
            res.status(500).json(result);
        }
    } catch (error) {
        console.error('❌ Server error:', error.message);
        res.status(500).json({
            success: false,
            error: `Server error: ${error.message}`
        });
    }
});

// API endpoint to regenerate LinkedIn post
app.post('/api/regenerate-post', async (req, res) => {
    try {
        const { articles, overallTrend } = req.body;
        
        if (!articles || articles.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'No articles provided for regeneration'
            });
        }

        console.log('🔄 Regenerating LinkedIn post...');
        
        const agent = new AIGoodNewsAgent();
        const analysis = { topArticles: articles, overallTrend };
        const mockArticles = articles.map(article => ({
            title: article.title,
            description: article.summary,
            url: article.url,
            source: article.source
        }));
        
        const newPost = await agent.generateLinkedInPost(analysis, mockArticles);
        
        res.json({
            success: true,
            linkedinPost: newPost
        });
        
    } catch (error) {
        console.error('❌ Post regeneration failed:', error.message);
        res.status(500).json({
            success: false,
            error: `Regeneration failed: ${error.message}`
        });
    }
});

function executeLinkedInAgent() {
    return new Promise((resolve) => {
        let output = '';
        let posts = [];
        let currentPost = null;
        
        const child = spawn('node', ['linkedin-ai-news-agent.js'], {
            stdio: ['pipe', 'pipe', 'pipe']
        });
        
        child.stdout.on('data', (data) => {
            const text = data.toString();
            output += text;
            
            // Parse the output to extract posts
            const lines = text.split('\n');
            for (const line of lines) {
                if (line.includes('POST ') && line.includes('(') && line.includes(')')) {
                    // Start of a new post
                    if (currentPost) {
                        posts.push(currentPost);
                    }
                    
                    const styleMatch = line.match(/\(([^)]+)\)/);
                    const charMatch = line.match(/(\d+) characters/);
                    
                    currentPost = {
                        content: '',
                        style: styleMatch ? styleMatch[1].toLowerCase() : 'unknown',
                        characterCount: charMatch ? parseInt(charMatch[1]) : 0,
                        hashtags: [],
                        sourceUrl: '',
                        article: { title: '', source: '' }
                    };
                } else if (currentPost && line.trim() && !line.includes('────')) {
                    // Add content to current post
                    if (line.includes('Source: http')) {
                        currentPost.sourceUrl = line.replace('Source: ', '').trim();
                    } else if (line.includes('#')) {
                        // Extract hashtags
                        const hashtagMatches = line.match(/#\w+/g);
                        if (hashtagMatches) {
                            currentPost.hashtags = hashtagMatches;
                        }
                    } else if (!line.includes('📊') && !line.includes('🏷️') && !line.includes('········')) {
                        currentPost.content += line + '\n';
                    }
                }
            }
        });
        
        child.stderr.on('data', (data) => {
            console.error('Agent stderr:', data.toString());
        });
        
        child.on('close', (code) => {
            // Add the last post if exists
            if (currentPost) {
                posts.push(currentPost);
            }
            
            if (code === 0 && posts.length > 0) {
                // Clean up post content
                posts = posts.map(post => ({
                    ...post,
                    content: post.content.trim(),
                    article: {
                        title: 'AI News Article',
                        source: post.sourceUrl ? new URL(post.sourceUrl).hostname : 'unknown'
                    }
                }));
                
                resolve({
                    success: true,
                    posts: posts,
                    rawOutput: output
                });
            } else {
                resolve({
                    success: false,
                    error: `Agent execution failed with code ${code}. Check console for details.`,
                    rawOutput: output
                });
            }
        });
        
        child.on('error', (error) => {
            resolve({
                success: false,
                error: `Failed to start agent: ${error.message}`
            });
        });
    });
}

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Start the server
app.listen(PORT, () => {
    console.log(`🌐 LinkedIn AI News Agent UI running at http://localhost:${PORT}`);
    console.log('📱 Open your browser and navigate to the URL above');
    console.log('🚀 Click "Generate AI News Posts" to start');
});

module.exports = app;
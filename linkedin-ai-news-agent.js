/**
 * LinkedIn AI News Agent
 *
 * Automatically discovers AI-related news using DuckDuckGo and generates
 * LinkedIn posts that users can copy and paste. Integrates with Kiro's
 * agent hook system for seamless automation.
 */

// Core imports for HTTP requests and utilities
const https = require("https");
const fs = require("fs");
const path = require("path");

/**
 * Configuration object for AI keywords and agent behavior
 * Supports customization of focus areas, post styles, and search parameters
 */
const CONFIG = {
  // AI-related search keywords and topics
  aiKeywords: [
    "artificial intelligence",
    "machine learning",
    "OpenAI",
    "ChatGPT",
    "neural networks",
    "deep learning",
    "AI startups",
    "generative AI",
    "AI ethics",
    "AI regulation",
  ],

  // Search and filtering parameters
  search: {
    maxResults: 10,
    timeframe: "d", // 'd' = past day, 'w' = past week, 'm' = past month
    minRelevanceScore: 0.4,
    requestTimeout: 15000,
    rateLimitDelay: 1000, // 1 second between requests
  },

  // LinkedIn post generation settings
  posts: {
    maxCharacters: 3000,
    optimalCharacters: 1600,
    maxHashtags: 5,
    styles: ["news_share", "question", "insight", "list"],
    defaultStyle: "news_share",
  },

  // Source quality preferences
  sources: {
    preferred: [
      "techcrunch.com",
      "wired.com",
      "technologyreview.com",
      "venturebeat.com",
      "theverge.com",
      "arstechnica.com",
    ],
    excluded: ["spam-site.com", "clickbait-news.com"],
  },

  // Caching and performance settings
  cache: {
    enabled: true,
    duration: 3600000, // 1 hour in milliseconds
    maxEntries: 100,
  },

  // Error handling and retry configuration
  errorHandling: {
    maxRetries: 3,
    retryDelay: 2000,
    exponentialBackoff: true,
  },
};

/**
 * Main LinkedIn AI News Agent class
 * Orchestrates the entire workflow from news discovery to post generation
 */
class LinkedInAINewsAgent {
  constructor(config = CONFIG) {
    this.config = config;
    this.cache = new Map();
    this.lastRequestTime = 0;
    this.initialized = false;
  }

  /**
   * Main entry point for the agent workflow
   * Combines search and post generation into single workflow with comprehensive error handling
   * Implements requirements 1.4, 4.1, 4.2 for workflow orchestration and output formatting
   */
  async run() {
    const startTime = Date.now();
    let articles = [];
    let posts = [];

    try {
      console.log("🤖 LinkedIn AI News Agent starting...");
      console.log("⏰ Started at:", new Date().toLocaleString());

      // Initialize agent if not already done
      this.initialize();

      // Step 1: Discover AI news using DuckDuckGo search
      console.log("\n📡 Step 1: Searching for AI news...");
      try {
        articles = await this.searchAINews();
        console.log(`📰 Found ${articles.length} relevant articles`);

        if (articles.length === 0) {
          console.log("⚠️ No articles found. This could be due to:");
          console.log("   • Limited recent AI news");
          console.log("   • API rate limiting");
          console.log("   • Network connectivity issues");
          console.log(
            "💡 Try running again in a few minutes or check your internet connection."
          );
          return this.createEmptyResult("No articles found");
        }
      } catch (searchError) {
        console.error("❌ Search failed:", searchError.message);
        console.log("🔄 Attempting recovery with cached data or fallback...");

        // Try to recover with any cached articles or provide helpful error message
        articles = this.getCachedArticles() || [];
        if (articles.length === 0) {
          throw new Error(
            `News search failed: ${searchError.message}. Please check your internet connection and try again.`
          );
        }
        console.log(`📦 Using ${articles.length} cached articles as fallback`);
      }

      // Step 2: Generate LinkedIn posts from discovered articles
      console.log("\n✍️ Step 2: Generating LinkedIn posts...");
      try {
        posts = await this.generateLinkedInPosts(articles);
        console.log(`📝 Generated ${posts.length} LinkedIn posts`);

        if (posts.length === 0) {
          console.log("⚠️ No posts could be generated. This could be due to:");
          console.log("   • Articles lacking sufficient content");
          console.log("   • Content filtering removing all articles");
          console.log("   • Post generation errors");
          return this.createPartialResult(
            articles,
            [],
            "Post generation failed"
          );
        }
      } catch (postError) {
        console.error("❌ Post generation failed:", postError.message);
        console.log("📄 Articles were found but posts could not be generated");
        return this.createPartialResult(
          articles,
          [],
          `Post generation error: ${postError.message}`
        );
      }

      // Step 3: Format and display posts for easy copying (Requirements 4.1, 4.2)
      console.log("\n📋 Step 3: Formatting output...");
      try {
        this.displayPosts(posts);
        this.displaySummary(articles, posts, startTime);
      } catch (displayError) {
        console.error("❌ Display formatting failed:", displayError.message);
        // Still return the data even if display fails
        console.log("📊 Raw posts data available despite display error");
      }

      console.log("\n✅ Agent workflow completed successfully");
      return this.createSuccessResult(articles, posts, startTime);
    } catch (error) {
      console.error("\n❌ Agent workflow failed:", error.message);
      console.log("🔍 Error details:", {
        message: error.message,
        stack: error.stack?.split("\n")[0], // First line of stack trace
        articlesFound: articles.length,
        postsGenerated: posts.length,
        runtime: `${Date.now() - startTime}ms`,
      });

      // Provide recovery suggestions
      console.log("\n🛠️ Troubleshooting suggestions:");
      console.log("   • Check your internet connection");
      console.log("   • Verify DuckDuckGo API is accessible");
      console.log("   • Try running the agent again in a few minutes");
      console.log("   • Check the console for specific error details");

      return this.createErrorResult(error, articles, posts, startTime);
    }
  }

  /**
   * Searches DuckDuckGo for AI-related news articles
   * Implements requirements 1.1 and 1.2 for news discovery and filtering
   * Includes caching and error recovery for improved reliability
   */
  async searchAINews() {
    console.log("🔍 Starting AI news search...");

    let allArticles = [];

    try {
      // Try recent timeframe first (past day)
      console.log("📅 Searching for news from the past day...");
      allArticles = await this.performSearch("d");

      // If no recent articles found, expand to past week (requirement 1.4)
      if (allArticles.length === 0) {
        console.log("📅 No recent articles found, expanding to past week...");
        allArticles = await this.performSearch("w");
      }

      // Cache successful results
      if (allArticles.length > 0) {
        this.cacheArticles(allArticles, "ai_news_search");
      }
    } catch (searchError) {
      console.error("❌ Search operation failed:", searchError.message);

      // Try to use cached articles as fallback
      console.log("🔄 Attempting to use cached articles...");
      allArticles = this.getCachedArticles();

      if (allArticles.length === 0) {
        throw new Error(
          `Search failed and no cached articles available: ${searchError.message}`
        );
      }

      console.log(`📦 Using ${allArticles.length} cached articles as fallback`);
    }

    // Filter and rank articles by quality and relevance
    const filteredArticles = this.filterAndRankArticles(allArticles);

    console.log(
      `✅ Search completed: ${filteredArticles.length} quality articles found`
    );
    return filteredArticles;
  }

  /**
   * Performs DuckDuckGo search for a specific timeframe
   */
  async performSearch(timeframe = "d") {
    const articles = [];

    // Search with multiple AI keywords for comprehensive coverage
    for (const keyword of this.config.aiKeywords) {
      try {
        await AgentUtils.enforceRateLimit.call(this);

        console.log(`🔎 Searching for: "${keyword}"`);
        const searchResults = await this.duckDuckGoSearch(keyword, timeframe);

        if (searchResults && searchResults.length > 0) {
          articles.push(...searchResults);
          console.log(`  ✓ Found ${searchResults.length} results`);
        } else {
          console.log(`  ⚠️ No results for "${keyword}"`);
        }
      } catch (error) {
        console.error(`❌ Search failed for "${keyword}":`, error.message);
        // Continue with other keywords even if one fails
      }
    }

    return articles;
  }

  /**
   * Makes HTTP request to DuckDuckGo API
   */
  async duckDuckGoSearch(query, timeframe = "d") {
    return new Promise((resolve, reject) => {
      // Construct search URL with proper encoding
      const encodedQuery = encodeURIComponent(query);
      const searchUrl = `https://api.duckduckgo.com/?q=${encodedQuery}&format=json&no_html=1&skip_disambig=1`;

      console.log(`🌐 Requesting: ${searchUrl}`);

      const request = https.get(
        searchUrl,
        {
          timeout: this.config.search.requestTimeout,
          headers: {
            "User-Agent": "Kiro-LinkedIn-Agent/1.0",
            Accept: "application/json",
          },
        },
        (response) => {
          let data = "";

          response.on("data", (chunk) => {
            data += chunk;
          });

          response.on("end", () => {
            try {
              if (response.statusCode !== 200) {
                throw new Error(
                  `HTTP ${response.statusCode}: ${response.statusMessage}`
                );
              }

              // Handle empty responses
              if (!data || data.trim().length === 0) {
                console.log("⚠️ Empty response from API");
                resolve([]);
                return;
              }

              const jsonData = JSON.parse(data);

              // Log useful data found
              if (jsonData.RelatedTopics && jsonData.RelatedTopics.length > 0) {
                console.log(
                  `📊 Found ${jsonData.RelatedTopics.length} related topics`
                );
              }
              if (jsonData.AbstractText) {
                console.log(
                  `📝 Abstract available: ${jsonData.AbstractText.substring(
                    0,
                    80
                  )}...`
                );
              }

              const articles = this.parseSearchResults(jsonData, query);
              resolve(articles);
            } catch (parseError) {
              console.error(
                "❌ Failed to parse search results:",
                parseError.message
              );
              console.error("Raw response:", data.substring(0, 500));
              resolve([]); // Return empty array instead of rejecting
            }
          });
        }
      );

      request.on("timeout", () => {
        request.destroy();
        reject(new Error("Request timeout"));
      });

      request.on("error", (error) => {
        reject(new Error(`Request failed: ${error.message}`));
      });
    });
  }

  /**
   * Parses DuckDuckGo API response and extracts article information
   */
  parseSearchResults(data, originalQuery) {
    const articles = [];

    try {
      // Check for direct abstract result
      if (
        data.AbstractURL &&
        data.AbstractText &&
        data.AbstractText.length > 50
      ) {
        const article = {
          title: data.Heading || this.extractTitleFromText(data.AbstractText),
          url: data.AbstractURL,
          summary: data.AbstractText,
          source: this.extractDomain(data.AbstractURL),
          publishedDate: new Date(), // DuckDuckGo doesn't provide exact dates
          relevanceScore: 0.9, // High relevance for direct results
          keyPoints: [],
          searchQuery: originalQuery,
        };

        // Only add if it seems news-related or informative
        if (this.isNewsWorthy(article.summary)) {
          articles.push(article);
          console.log(
            `  ✓ Added abstract result: ${article.title.substring(0, 50)}...`
          );
        }
      }

      // Process related topics for additional articles
      if (data.RelatedTopics && Array.isArray(data.RelatedTopics)) {
        console.log(
          `  📊 Processing ${data.RelatedTopics.length} related topics`
        );

        for (const topic of data.RelatedTopics) {
          // Handle nested topics (some RelatedTopics contain Topics array)
          const topicsToProcess = topic.Topics ? topic.Topics : [topic];

          for (const item of topicsToProcess) {
            if (item.FirstURL && item.Text) {
              // Extract clean text without HTML
              const cleanText = item.Text.replace(/<[^>]*>/g, "").trim();

              if (cleanText.length > 100) {
                // Require substantial content
                const article = {
                  title: this.extractTitleFromText(cleanText),
                  url: item.FirstURL,
                  summary: cleanText,
                  source: this.extractDomain(item.FirstURL),
                  publishedDate: new Date(), // Approximate date
                  relevanceScore: this.calculateRelevanceScore(
                    cleanText,
                    originalQuery
                  ),
                  keyPoints: [],
                  searchQuery: originalQuery,
                };

                // Filter for news-worthy content
                if (
                  this.isNewsWorthy(article.summary) &&
                  article.relevanceScore > 0.3
                ) {
                  articles.push(article);
                  console.log(
                    `  ✓ Added topic result: ${article.title.substring(
                      0,
                      50
                    )}...`
                  );
                }
              }
            }
          }
        }
      }

      // Also check Results array if available
      if (data.Results && Array.isArray(data.Results)) {
        console.log(`  📊 Processing ${data.Results.length} direct results`);

        for (const result of data.Results) {
          if (result.FirstURL && result.Text) {
            const cleanText = result.Text.replace(/<[^>]*>/g, "").trim();

            if (cleanText.length > 100) {
              const article = {
                title: this.extractTitleFromText(cleanText),
                url: result.FirstURL,
                summary: cleanText,
                source: this.extractDomain(result.FirstURL),
                publishedDate: new Date(),
                relevanceScore: this.calculateRelevanceScore(
                  cleanText,
                  originalQuery
                ),
                keyPoints: [],
                searchQuery: originalQuery,
              };

              if (
                this.isNewsWorthy(article.summary) &&
                article.relevanceScore > 0.3
              ) {
                articles.push(article);
                console.log(
                  `  ✓ Added direct result: ${article.title.substring(
                    0,
                    50
                  )}...`
                );
              }
            }
          }
        }
      }
    } catch (error) {
      console.error("❌ Error parsing search results:", error.message);
    }

    console.log(
      `  📝 Extracted ${articles.length} articles from search results`
    );
    return articles;
  }

  /**
   * Determines if content is news-worthy based on keywords and patterns
   */
  isNewsWorthy(text) {
    const lowerText = text.toLowerCase();

    // Look for news-related indicators
    const newsIndicators = [
      "announced",
      "launched",
      "released",
      "unveiled",
      "introduced",
      "breakthrough",
      "development",
      "research",
      "study",
      "report",
      "funding",
      "investment",
      "acquisition",
      "partnership",
      "regulation",
      "policy",
      "law",
      "ruling",
      "decision",
      "update",
      "version",
      "feature",
      "improvement",
      "innovation",
      "company",
      "startup",
      "corporation",
      "organization",
      "technology",
      "platform",
      "system",
      "tool",
      "application",
    ];

    // Check for AI-specific terms
    const aiTerms = [
      "artificial intelligence",
      "machine learning",
      "neural network",
      "deep learning",
      "ai model",
      "algorithm",
      "automation",
      "chatgpt",
      "openai",
      "generative",
      "llm",
      "transformer",
    ];

    const hasNewsIndicator = newsIndicators.some((indicator) =>
      lowerText.includes(indicator)
    );
    const hasAITerm = aiTerms.some((term) => lowerText.includes(term));

    // Must have both AI relevance and news-like content
    return hasNewsIndicator && hasAITerm;
  }

  /**
   * Filters articles by quality and relevance, prioritizing reputable sources
   * Implements requirement 1.1.3 for source quality filtering
   */
  filterAndRankArticles(articles) {
    console.log("🔍 Filtering and ranking articles by quality...");

    // Remove duplicates based on URL
    const uniqueArticles = articles.filter(
      (article, index, self) =>
        index === self.findIndex((a) => a.url === article.url)
    );

    // Filter by quality criteria
    const qualityArticles = uniqueArticles.filter((article) => {
      // Check if source is in excluded list
      if (
        this.config.sources.excluded.some((excluded) =>
          article.source.toLowerCase().includes(excluded.toLowerCase())
        )
      ) {
        console.log(
          `❌ Excluding article from ${article.source} (blacklisted source)`
        );
        return false;
      }

      // Require minimum relevance score
      if (article.relevanceScore < this.config.search.minRelevanceScore) {
        console.log(
          `❌ Excluding article with low relevance score: ${article.relevanceScore}`
        );
        return false;
      }

      // Require minimum summary length
      if (article.summary.length < 100) {
        console.log(
          `❌ Excluding article with short summary: ${article.summary.length} chars`
        );
        return false;
      }

      return true;
    });

    // Sort by relevance score and source preference
    qualityArticles.sort((a, b) => {
      // Boost preferred sources
      const aPreferred = this.config.sources.preferred.some((preferred) =>
        a.source.toLowerCase().includes(preferred.toLowerCase())
      );
      const bPreferred = this.config.sources.preferred.some((preferred) =>
        b.source.toLowerCase().includes(preferred.toLowerCase())
      );

      if (aPreferred && !bPreferred) return -1;
      if (!aPreferred && bPreferred) return 1;

      // Then sort by relevance score
      return b.relevanceScore - a.relevanceScore;
    });

    // Limit to max results
    const limitedArticles = qualityArticles.slice(
      0,
      this.config.search.maxResults
    );

    console.log(`✅ Filtered to ${limitedArticles.length} quality articles`);
    return limitedArticles;
  }

  /**
   * Utility methods for article processing
   */
  extractDomain(url) {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname.replace("www.", "");
    } catch {
      return "unknown-source.com";
    }
  }

  extractTitleFromText(text) {
    // Extract first sentence or up to 100 characters as title
    const sentences = text.split(/[.!?]/);
    const firstSentence = sentences[0].trim();

    if (firstSentence.length > 100) {
      return firstSentence.substring(0, 97) + "...";
    }

    return firstSentence || "AI News Article";
  }

  calculateRelevanceScore(text, query) {
    const lowerText = text.toLowerCase();
    const queryWords = query.toLowerCase().split(" ");

    let score = 0;

    // Base score for query word matches
    for (const word of queryWords) {
      if (word.length > 2) {
        // Skip very short words
        const matches = (lowerText.match(new RegExp(word, "g")) || []).length;
        score += matches * 0.15;
      }
    }

    // Boost for high-value AI terms
    const highValueTerms = [
      "artificial intelligence",
      "machine learning",
      "neural network",
      "deep learning",
      "generative ai",
      "large language model",
    ];
    for (const term of highValueTerms) {
      if (lowerText.includes(term)) {
        score += 0.3;
      }
    }

    // Boost for medium-value AI terms
    const mediumValueTerms = [
      "ai",
      "ml",
      "algorithm",
      "automation",
      "chatgpt",
      "openai",
    ];
    for (const term of mediumValueTerms) {
      if (lowerText.includes(term)) {
        score += 0.2;
      }
    }

    // Boost for news-related terms
    const newsTerms = [
      "announced",
      "launched",
      "breakthrough",
      "funding",
      "research",
    ];
    for (const term of newsTerms) {
      if (lowerText.includes(term)) {
        score += 0.1;
      }
    }

    // Normalize score to 0-1 range
    return Math.min(score, 1.0);
  }

  /**
   * Generates LinkedIn posts from article data
   * Implements requirements 3.1, 3.2, 3.3, 3.4 for post generation
   */
  async generateLinkedInPosts(articles) {
    console.log("📝 Generating LinkedIn posts from articles...");

    if (!articles || articles.length === 0) {
      console.log("⚠️ No articles provided for post generation");
      return [];
    }

    const posts = [];
    const postStyles = this.config.posts.styles;

    // Generate multiple posts with different styles for variety (requirement 3.4)
    for (let i = 0; i < Math.min(articles.length, 3); i++) {
      const article = articles[i];
      const style = postStyles[i % postStyles.length]; // Rotate through styles

      try {
        const post = await this.createLinkedInPost(article, style);
        if (post) {
          posts.push(post);
          console.log(
            `  ✓ Generated ${style} post: "${post.content.substring(0, 50)}..."`
          );
        }
      } catch (error) {
        console.error(
          `❌ Failed to generate post for article: ${error.message}`
        );
      }
    }

    console.log(`✅ Generated ${posts.length} LinkedIn posts`);
    return posts;
  }

  /**
   * Creates a single LinkedIn post from an article with specified style
   * Follows LinkedIn best practices and character limits (requirements 3.1, 3.3)
   */
  async createLinkedInPost(article, style = "news_share") {
    const keyPoints = this.extractKeyPoints(article);
    const hashtags = this.generateHashtags(article);

    let content = "";

    switch (style) {
      case "news_share":
        content = this.createNewsSharePost(article, keyPoints);
        break;
      case "question":
        content = this.createQuestionPost(article, keyPoints);
        break;
      case "insight":
        content = this.createInsightPost(article, keyPoints);
        break;
      case "list":
        content = this.createListPost(article, keyPoints);
        break;
      default:
        content = this.createNewsSharePost(article, keyPoints);
    }

    // Add hashtags and source link (requirement 3.2)
    const hashtagString = hashtags.join(" ");
    const sourceText = `\n\nSource: ${article.url}`;

    // Ensure content fits within LinkedIn character limits (requirement 3.3)
    const maxContentLength =
      this.config.posts.maxCharacters -
      hashtagString.length -
      sourceText.length -
      10; // Buffer
    if (content.length > maxContentLength) {
      content = content.substring(0, maxContentLength - 3) + "...";
    }

    const finalContent = `${content}\n\n${hashtagString}${sourceText}`;

    return {
      content: finalContent,
      hashtags: hashtags,
      sourceUrl: article.url,
      style: style,
      characterCount: finalContent.length,
      article: {
        title: article.title,
        source: article.source,
      },
    };
  }

  /**
   * Creates a news sharing style post
   */
  createNewsSharePost(article, keyPoints) {
    const hook = this.getEngagingHook(article);
    const summary = this.createSummary(article, keyPoints, 200);

    return `${hook}\n\n${summary}\n\nWhat are your thoughts on this development?`;
  }

  /**
   * Creates a question-style post to drive engagement
   */
  createQuestionPost(article, keyPoints) {
    const questions = [
      `How do you think ${this.extractMainTopic(
        article
      )} will impact the industry?`,
      `What's your take on this latest development in AI?`,
      `Do you see this as a breakthrough or just incremental progress?`,
      `How might this change the way we work with AI?`,
      `What opportunities does this create for businesses?`,
    ];

    const randomQuestion =
      questions[Math.floor(Math.random() * questions.length)];
    const summary = this.createSummary(article, keyPoints, 150);

    return `🤔 ${randomQuestion}\n\n${summary}\n\nI'd love to hear your perspectives in the comments!`;
  }

  /**
   * Creates an insight-style post with analysis
   */
  createInsightPost(article, keyPoints) {
    const insights = this.generateInsights(keyPoints);
    const summary = this.createSummary(article, keyPoints, 150);

    return `💡 Key insight from today's AI news:\n\n${summary}\n\n${insights}\n\nThis could be a game-changer for how we approach AI development.`;
  }

  /**
   * Creates a list-style post with key takeaways
   */
  createListPost(article, keyPoints) {
    const summary = this.createSummary(article, keyPoints, 100);
    const listItems = keyPoints
      .slice(0, 3)
      .map((point, index) => `${index + 1}. ${point.text}`)
      .join("\n");

    return `📋 Key takeaways from the latest AI news:\n\n${summary}\n\nMain points:\n${listItems}\n\nWhich point resonates most with you?`;
  }

  /**
   * Extracts key points from article content for post generation
   */
  extractKeyPoints(article) {
    const text = article.summary.toLowerCase();
    const keyPoints = [];

    // Look for important statements and facts
    const sentences = article.summary
      .split(/[.!?]+/)
      .filter((s) => s.trim().length > 20);

    for (const sentence of sentences.slice(0, 5)) {
      // Limit to first 5 sentences
      const trimmed = sentence.trim();
      if (this.isKeyPoint(trimmed)) {
        keyPoints.push({
          text: trimmed,
          importance: this.calculateImportance(trimmed),
        });
      }
    }

    // Sort by importance and return top points
    return keyPoints.sort((a, b) => b.importance - a.importance).slice(0, 3);
  }

  /**
   * Determines if a sentence contains a key point worth highlighting
   */
  isKeyPoint(sentence) {
    const lowerSentence = sentence.toLowerCase();

    // Look for action words and important developments
    const keyIndicators = [
      "announced",
      "launched",
      "released",
      "developed",
      "created",
      "breakthrough",
      "innovation",
      "improvement",
      "advancement",
      "funding",
      "investment",
      "partnership",
      "acquisition",
      "research",
      "study",
      "findings",
      "results",
      "discovered",
      "will",
      "can",
      "enables",
      "allows",
      "provides",
      "offers",
    ];

    return (
      keyIndicators.some((indicator) => lowerSentence.includes(indicator)) &&
      sentence.length > 30 &&
      sentence.length < 200
    );
  }

  /**
   * Calculates importance score for a key point
   */
  calculateImportance(sentence) {
    const lowerSentence = sentence.toLowerCase();
    let score = 0;

    // High-value terms
    const highValueTerms = [
      "breakthrough",
      "revolutionary",
      "first",
      "new",
      "major",
    ];
    highValueTerms.forEach((term) => {
      if (lowerSentence.includes(term)) score += 3;
    });

    // Medium-value terms
    const mediumValueTerms = [
      "announced",
      "launched",
      "developed",
      "funding",
      "partnership",
    ];
    mediumValueTerms.forEach((term) => {
      if (lowerSentence.includes(term)) score += 2;
    });

    // AI-specific terms
    const aiTerms = [
      "artificial intelligence",
      "machine learning",
      "neural network",
      "ai",
    ];
    aiTerms.forEach((term) => {
      if (lowerSentence.includes(term)) score += 1;
    });

    return score;
  }

  /**
   * Generates relevant hashtags for the article (requirement 3.2)
   */
  generateHashtags(article) {
    const hashtags = new Set();
    const text = (article.title + " " + article.summary).toLowerCase();

    // Core AI hashtags
    hashtags.add("#ArtificialIntelligence");
    hashtags.add("#AI");

    // Topic-specific hashtags based on content
    const hashtagMap = {
      "machine learning": "#MachineLearning",
      "deep learning": "#DeepLearning",
      "neural network": "#NeuralNetworks",
      chatgpt: "#ChatGPT",
      openai: "#OpenAI",
      generative: "#GenerativeAI",
      startup: "#AIStartup",
      funding: "#TechFunding",
      research: "#AIResearch",
      ethics: "#AIEthics",
      regulation: "#AIRegulation",
      automation: "#Automation",
      innovation: "#Innovation",
      technology: "#Technology",
      future: "#FutureOfWork",
    };

    // Add relevant hashtags based on content
    for (const [keyword, hashtag] of Object.entries(hashtagMap)) {
      if (text.includes(keyword)) {
        hashtags.add(hashtag);
      }
    }

    // Limit to max hashtags (requirement 3.2)
    const hashtagArray = Array.from(hashtags).slice(
      0,
      this.config.posts.maxHashtags
    );

    return hashtagArray;
  }

  /**
   * Creates an engaging hook for the post
   */
  getEngagingHook(article) {
    const hooks = [
      "🚀 Exciting developments in AI:",
      "💡 This caught my attention in today's AI news:",
      "🔥 Hot off the press in artificial intelligence:",
      "⚡ Breaking: Major AI advancement just announced:",
      "🎯 Here's what's making waves in the AI world:",
      "🌟 Fascinating AI breakthrough to share:",
      "📈 The AI industry just took another big step forward:",
    ];

    return hooks[Math.floor(Math.random() * hooks.length)];
  }

  /**
   * Creates a concise summary of the article
   */
  createSummary(article, keyPoints, maxLength = 200) {
    let summary = article.summary;

    // If we have key points, use the most important one
    if (keyPoints && keyPoints.length > 0) {
      summary = keyPoints[0].text;
    }

    // Ensure summary fits within length limit
    if (summary.length > maxLength) {
      summary = summary.substring(0, maxLength - 3) + "...";
    }

    return summary;
  }

  /**
   * Extracts the main topic from the article for question generation
   */
  extractMainTopic(article) {
    const text = article.title.toLowerCase();

    if (text.includes("chatgpt") || text.includes("openai"))
      return "ChatGPT/OpenAI";
    if (text.includes("machine learning")) return "machine learning";
    if (text.includes("deep learning")) return "deep learning";
    if (text.includes("neural network")) return "neural networks";
    if (text.includes("generative")) return "generative AI";
    if (text.includes("startup")) return "AI startups";
    if (text.includes("regulation") || text.includes("policy"))
      return "AI regulation";
    if (text.includes("ethics")) return "AI ethics";

    return "artificial intelligence";
  }

  /**
   * Generates insights from key points
   */
  generateInsights(keyPoints) {
    if (!keyPoints || keyPoints.length === 0) {
      return "This development represents another step forward in AI capabilities.";
    }

    const insights = [
      "This could significantly impact how businesses approach AI integration.",
      "The implications for the future of work are worth considering.",
      "This advancement opens up new possibilities for AI applications.",
      "The competitive landscape in AI continues to evolve rapidly.",
      "This highlights the accelerating pace of AI innovation.",
    ];

    return insights[Math.floor(Math.random() * insights.length)];
  }

  /**
   * Displays generated posts in an easy-to-copy format (requirement 4.1)
   */
  displayPosts(posts) {
    console.log("\n" + "=".repeat(80));
    console.log("📝 GENERATED LINKEDIN POSTS - READY TO COPY & PASTE");
    console.log("=".repeat(80));

    if (!posts || posts.length === 0) {
      console.log(
        "⚠️ No posts were generated. Please check the articles and try again."
      );
      return;
    }

    posts.forEach((post, index) => {
      console.log(
        `\n📋 POST ${index + 1} (${post.style.toUpperCase()}) - ${
          post.characterCount
        } characters`
      );
      console.log("─".repeat(60));
      console.log(post.content);
      console.log("─".repeat(60));
      console.log(`📊 Source: ${post.article.source} | Style: ${post.style}`);
      console.log(`🏷️  Hashtags: ${post.hashtags.join(", ")}`);

      if (index < posts.length - 1) {
        console.log("\n" + "·".repeat(40));
      }
    });

    console.log("\n" + "=".repeat(80));
    console.log("✅ Copy any post above and paste directly to LinkedIn!");
    console.log(
      "💡 Tip: You can edit the content before posting to add your personal touch."
    );
    console.log("=".repeat(80) + "\n");
  }

  /**
   * Validates configuration and initializes agent
   */
  initialize() {
    if (this.initialized) return; // Prevent double initialization

    console.log("🔧 Initializing LinkedIn AI News Agent...");

    // Validate required configuration
    if (!this.config.aiKeywords || this.config.aiKeywords.length === 0) {
      throw new Error("AI keywords configuration is required");
    }

    // Initialize cache if enabled
    if (this.config.cache.enabled) {
      console.log("💾 Cache enabled");
    }

    console.log(
      `🎯 Configured with ${this.config.aiKeywords.length} AI keywords`
    );
    console.log(`⏱️  Search timeframe: ${this.config.search.timeframe}`);
    console.log("✅ Agent initialized successfully");

    this.initialized = true;
  }

  /**
   * Creates a successful result object with comprehensive data
   */
  createSuccessResult(articles, posts, startTime) {
    return {
      success: true,
      timestamp: new Date().toISOString(),
      runtime: Date.now() - startTime,
      data: {
        articles: articles,
        posts: posts,
        summary: {
          articlesFound: articles.length,
          postsGenerated: posts.length,
          sources: [...new Set(articles.map((a) => a.source))],
          styles: [...new Set(posts.map((p) => p.style))],
        },
      },
      message: "Workflow completed successfully",
    };
  }

  /**
   * Creates a partial result when some steps succeed but others fail
   */
  createPartialResult(articles, posts, errorMessage) {
    return {
      success: false,
      partial: true,
      timestamp: new Date().toISOString(),
      data: {
        articles: articles || [],
        posts: posts || [],
        summary: {
          articlesFound: (articles || []).length,
          postsGenerated: (posts || []).length,
        },
      },
      error: errorMessage,
      message: "Workflow partially completed with errors",
    };
  }

  /**
   * Creates an empty result when no data could be retrieved
   */
  createEmptyResult(reason) {
    return {
      success: false,
      timestamp: new Date().toISOString(),
      data: {
        articles: [],
        posts: [],
        summary: {
          articlesFound: 0,
          postsGenerated: 0,
        },
      },
      error: reason,
      message: "No data could be retrieved",
    };
  }

  /**
   * Creates an error result with diagnostic information
   */
  createErrorResult(error, articles, posts, startTime) {
    return {
      success: false,
      timestamp: new Date().toISOString(),
      runtime: Date.now() - startTime,
      data: {
        articles: articles || [],
        posts: posts || [],
        summary: {
          articlesFound: (articles || []).length,
          postsGenerated: (posts || []).length,
        },
      },
      error: {
        message: error.message,
        type: error.constructor.name,
        stack: error.stack,
      },
      message: "Workflow failed with errors",
    };
  }

  /**
   * Displays a comprehensive summary of the workflow execution
   */
  displaySummary(articles, posts, startTime) {
    const runtime = Date.now() - startTime;
    const sources = [...new Set(articles.map((a) => a.source))];
    const styles = [...new Set(posts.map((p) => p.style))];

    console.log("\n" + "=".repeat(80));
    console.log("📊 WORKFLOW SUMMARY");
    console.log("=".repeat(80));
    console.log(`⏱️  Runtime: ${runtime}ms`);
    console.log(`📰 Articles found: ${articles.length}`);
    console.log(`📝 Posts generated: ${posts.length}`);
    console.log(`🌐 Sources: ${sources.join(", ")}`);
    console.log(`🎨 Post styles: ${styles.join(", ")}`);
    console.log(`📅 Execution time: ${new Date().toLocaleString()}`);
    console.log("=".repeat(80));
  }

  /**
   * Retrieves cached articles as fallback when search fails
   */
  getCachedArticles() {
    if (!this.config.cache.enabled || !this.cache) {
      return [];
    }

    // Return any cached articles that are still fresh
    const cachedArticles = [];
    for (const [key, value] of this.cache.entries()) {
      if (
        key.startsWith("articles_") &&
        value.timestamp > Date.now() - this.config.cache.duration
      ) {
        cachedArticles.push(...value.data);
      }
    }

    return cachedArticles.slice(0, this.config.search.maxResults);
  }

  /**
   * Caches articles for future fallback use
   */
  cacheArticles(articles, query) {
    if (!this.config.cache.enabled || !articles || articles.length === 0) {
      return;
    }

    const cacheKey = `articles_${query}_${Date.now()}`;
    this.cache.set(cacheKey, {
      data: articles,
      timestamp: Date.now(),
      query: query,
    });

    // Clean up old cache entries
    if (this.cache.size > this.config.cache.maxEntries) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }
  }
}

/**
 * Utility functions for the agent
 */
const AgentUtils = {
  /**
   * Enforces rate limiting between API requests
   * Must be called with .call(this) to access agent's lastRequestTime
   */
  async enforceRateLimit(delay = CONFIG.search.rateLimitDelay) {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;

    if (timeSinceLastRequest < delay) {
      const waitTime = delay - timeSinceLastRequest;
      console.log(`⏳ Rate limiting: waiting ${waitTime}ms`);
      await new Promise((resolve) => setTimeout(resolve, waitTime));
    }

    this.lastRequestTime = Date.now();
  },

  /**
   * Logs agent activity with timestamps
   */
  log(message, level = "info") {
    const timestamp = new Date().toISOString();
    const prefix = level === "error" ? "❌" : level === "warn" ? "⚠️" : "ℹ️";
    console.log(`${prefix} [${timestamp}] ${message}`);
  },
};

// Export for use in Kiro agent hooks
module.exports = {
  LinkedInAINewsAgent,
  CONFIG,
  AgentUtils,
};

// If running directly (for testing)
if (require.main === module) {
  const agent = new LinkedInAINewsAgent();
  agent.initialize();
  agent.run().catch(console.error);
}

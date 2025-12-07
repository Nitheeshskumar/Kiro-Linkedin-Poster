---
inclusion: fileMatch
fileMatchPattern: '*duckduckgo*'
---

# DuckDuckGo API Reference

## Search API Endpoint

DuckDuckGo provides a free instant answer API that can be used for news searches:

### Base URL
```
https://api.duckduckgo.com/
```

### Parameters
- `q`: Search query (required)
- `format`: Response format (json, xml) - use 'json'
- `no_redirect`: Skip redirects (1 or 0)
- `no_html`: Remove HTML from text (1 or 0) - recommended: 1
- `skip_disambig`: Skip disambiguation (1 or 0)

### Example Request
```
https://api.duckduckgo.com/?q=artificial+intelligence+news&format=json&no_html=1&skip_disambig=1
```

## Alternative: Web Search Scraping

Since the instant answer API may not provide recent news, consider using DuckDuckGo's web search with careful scraping:

### Search URL Pattern
```
https://duckduckgo.com/html/?q={query}&df={timeframe}
```

### Timeframe Parameters
- `d`: Past day
- `w`: Past week  
- `m`: Past month
- `y`: Past year

### AI News Query Suggestions
- "artificial intelligence news"
- "machine learning breakthrough"
- "AI startup funding"
- "OpenAI ChatGPT updates"
- "AI regulation policy"
- "neural network research"

## Rate Limiting Guidelines

### Best Practices
- Limit requests to 1 per second maximum
- Implement exponential backoff on failures
- Cache results for at least 1 hour
- Use batch processing for multiple queries

### Error Handling
- Handle HTTP 429 (Too Many Requests)
- Implement timeout handling (10-15 seconds)
- Graceful degradation on API failures
- Log errors for monitoring

## Response Processing

### Expected Response Structure
```json
{
  "Abstract": "Brief description",
  "AbstractText": "Plain text version",
  "AbstractSource": "Source name",
  "AbstractURL": "Source URL",
  "Image": "Image URL",
  "Heading": "Main heading",
  "Answer": "Direct answer if available",
  "AnswerType": "Type of answer",
  "Definition": "Definition if available",
  "DefinitionSource": "Definition source",
  "DefinitionURL": "Definition URL",
  "RelatedTopics": [
    {
      "Result": "Related result HTML",
      "Icon": {
        "URL": "Icon URL",
        "Height": "Icon height",
        "Width": "Icon width"
      },
      "FirstURL": "First URL in result",
      "Text": "Result text"
    }
  ]
}
```

### Key Fields for News
- `RelatedTopics`: Contains news articles and links
- `AbstractURL`: Primary source URL
- `AbstractText`: Summary text for analysis

## Implementation Notes

### HTTP Client Configuration
```typescript
const config = {
  timeout: 15000,
  headers: {
    'User-Agent': 'Kiro-LinkedIn-Agent/1.0'
  },
  maxRedirects: 3
};
```

### Query Optimization
- Use specific AI-related keywords
- Combine with time-based filters
- Include site-specific searches for quality sources
- Escape special characters properly
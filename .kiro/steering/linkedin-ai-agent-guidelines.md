---
inclusion: manual
---

# LinkedIn AI News Agent Guidelines

## Project Context

This project creates an AI agent that automatically discovers AI-related news and generates LinkedIn posts. The system is designed to work entirely within Kiro's environment using free resources.

## Technical Constraints

### Free Resources Only
- Use DuckDuckGo's free search API (no authentication required)
- Leverage Kiro's built-in AI capabilities for content analysis
- Avoid any paid APIs or services
- Minimize external dependencies

### Kiro Integration Requirements
- Implement as a Kiro agent hook for seamless integration
- Use Kiro's file system for configuration and caching
- Leverage Kiro's UI components for user interaction
- Follow Kiro's agent development patterns

## Content Guidelines

### LinkedIn Best Practices
- Keep posts under 3000 characters (optimal: 1300-1600)
- Use 3-5 relevant hashtags maximum
- Include engaging questions or calls to action
- Maintain professional tone while being conversational
- Always include source attribution

### AI News Focus Areas
- Machine Learning breakthroughs
- AI industry developments and funding
- Ethical AI and regulation updates
- AI tool launches and updates
- Research paper highlights
- AI in business applications

### Post Style Variations
1. **News Share**: Direct sharing with personal insight
2. **Question Post**: Pose thought-provoking questions about AI trends
3. **Insight Post**: Share analysis and implications of AI developments
4. **List Post**: Curated lists of AI tools, resources, or trends

## Quality Standards

### Source Reliability
- Prioritize reputable tech publications (TechCrunch, Wired, MIT Technology Review)
- Include academic sources and research institutions
- Avoid clickbait and low-quality content
- Verify information freshness (prefer last 24-48 hours)

### Content Quality Metrics
- Relevance score based on AI keywords and context
- Source authority and credibility
- Content uniqueness and novelty
- Engagement potential assessment

## Error Handling Patterns

### API Failures
- Implement exponential backoff for retries
- Provide graceful degradation with cached content
- Clear error messages for user guidance
- Fallback to manual content suggestions

### Content Quality Issues
- Skip low-quality articles automatically
- Provide alternative content when primary sources fail
- Log quality issues for system improvement
- Allow user override for edge cases

## Performance Considerations

### Rate Limiting
- Respect DuckDuckGo's usage limits
- Implement request queuing and delays
- Cache search results to minimize API calls
- Monitor and log API usage patterns

### Resource Management
- Optimize memory usage within Kiro constraints
- Efficient text processing and analysis
- Minimal file system usage for caching
- Clean up temporary data regularly
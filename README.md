# AI Good News Aggregator

## 🎥 Demo Video

> **📹 Watch the complete demo!** See AI news discovery, Gemini analysis, and LinkedIn post generation in action.

[![Demo Video](https://img.shields.io/badge/📹_Watch_Demo-Click_to_Download-blue?style=for-the-badge)](./assets/ai-news-aggregator-demo.mp4)

**What the demo shows:**

- 🔍 Real-time news discovery from multiple sources
- 🤖 Gemini 2.0 Flash analyzing content for positive developments
- ✍️ AI-generated LinkedIn posts with optimized hashtags
- 📋 One-click copy functionality for immediate use
- ⚡ Complete workflow in under 20 seconds

**To view the demo:**

- **Direct download:** [ai-news-aggregator-demo.mp4](./assets/ai-news-aggregator-demo.mp4)
- **Local viewing:** Run `npm start` → Open `http://localhost:3000`

A powerful AI-driven web application that discovers positive AI developments and generates optimized LinkedIn posts using Google's Gemini 2.0 Flash model.

## 🌟 Features

🤖 **Real AI Agent** - Powered by Google Gemini 2.0 Flash for intelligent analysis  
📰 **Smart News Discovery** - Searches multiple sources for positive AI developments  
🔍 **Duplicate Filtering** - Tracks seen articles to avoid repetition  
✍️ **AI-Generated Posts** - Creates engaging LinkedIn content automatically  
📱 **Modern UI** - Clean, responsive interface inspired by Google's design  
🔄 **Post Regeneration** - Generate multiple variations with one click  
📋 **One-Click Copy** - Copy posts directly to clipboard

## 🚀 Quick Start

### 1. Setup API Keys

```bash
# Copy the example environment file
cp .env.example .env

# Edit .env and add your Gemini API key
# Get your key from: https://makersuite.google.com/app/apikey
```

### 2. Install and Run

```bash
# Install dependencies
npm install

# Start the application
npm start

# Open http://localhost:3000 in your browser
```

### 3. Generate Your First Briefing

1. Click "Generate Briefing"
2. Watch the AI search and analyze news
3. Review the positive developments found
4. Copy the generated LinkedIn post
5. Paste directly to LinkedIn!

## 🔧 Configuration

### Required: Gemini API Key

- Get your free API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
- Add it to your `.env` file as `GEMINI_API_KEY=your_key_here`

### Optional: News API Key

- Improves news search quality and coverage
- Get your key from [NewsAPI.org](https://newsapi.org/register)
- Add it to your `.env` file as `NEWS_API_KEY=your_key_here`
- Without this key, the app uses DuckDuckGo as a fallback

## 🎯 How It Works

### 1. News Discovery

- Searches multiple reputable tech sources
- Focuses on positive AI developments from the last 24 hours
- Filters out previously seen articles automatically

### 2. AI Analysis

- Uses Gemini 2.0 Flash to analyze article relevance and impact
- Ranks developments by their positive significance
- Identifies key insights and breakthrough potential

### 3. Content Generation

- Creates engaging LinkedIn posts optimized for the platform
- Includes relevant hashtags and calls-to-action
- Maintains professional tone while being enthusiastic
- Keeps posts under LinkedIn's optimal character limits

### 4. User Experience

- Clean, intuitive interface
- Real-time progress indicators
- One-click copying to clipboard
- Post regeneration for different variations

## 📁 Project Structure

```
├── index.html          # Main UI interface
├── style.css           # Modern, responsive styling
├── script.js           # Frontend JavaScript
├── server.js           # Express.js backend
├── ai-agent.js         # Core AI agent logic
├── package.json        # Dependencies and scripts
├── .env.example        # Environment configuration template
├── seen-articles.json  # Tracks processed articles (auto-generated)
└── README-UI.md        # This documentation
```

## 🔌 API Endpoints

### `POST /api/generate`

Executes the full AI agent workflow:

- Searches for news
- Analyzes with Gemini
- Generates LinkedIn post
- Returns structured results

### `POST /api/regenerate-post`

Regenerates LinkedIn post with different phrasing:

- Requires previous analysis results
- Uses same articles, different creative approach
- Maintains quality and relevance

## 🎨 Interface Design

The UI follows Google's Material Design principles:

- **Clean Layout**: Focused on content and functionality
- **Progressive Disclosure**: Shows information as needed
- **Visual Feedback**: Clear loading states and progress indicators
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Accessibility**: Keyboard shortcuts and screen reader friendly

## 🛠️ Customization

### Modify News Sources

Edit `ai-agent.js` to change the sources array:

```javascript
const sources = ["your-preferred-source.com", "another-source.com"];
```

### Adjust AI Prompts

Customize the Gemini prompts in `ai-agent.js` to change:

- Analysis criteria
- Post tone and style
- Content focus areas

### UI Styling

Edit `style.css` to customize:

- Color scheme
- Layout and spacing
- Typography
- Responsive breakpoints

## 🔍 Troubleshooting

### No Articles Found

- Check your internet connection
- Verify news sources are accessible
- Try running during peak news hours
- Check if your IP is rate-limited

### Gemini API Errors

- Verify your API key is correct
- Check your API quota and billing
- Ensure the key has proper permissions
- Try regenerating your API key

### Server Issues

- Check if port 3000 is available
- Verify Node.js version (14+ required)
- Review server console for error details
- Ensure all dependencies are installed

### Copy Function Not Working

- Modern browsers support automatic copying
- Check clipboard permissions in browser settings
- Try using Ctrl+C as fallback
- Ensure HTTPS for clipboard API (localhost works)

## 🚀 Advanced Usage

### Scheduling

You can set up automated briefing generation using cron jobs or task schedulers:

```bash
# Run every morning at 9 AM
0 9 * * * cd /path/to/app && node -e "const agent = require('./ai-agent'); new agent().run().then(console.log)"
```

### Integration

The AI agent can be integrated into other workflows:

```javascript
const AIGoodNewsAgent = require("./ai-agent");

const agent = new AIGoodNewsAgent();
const result = await agent.run();

if (result.success) {
  // Use result.linkedinPost for automated posting
  // Use result.articles for further processing
}
```

### Monitoring

Track the agent's performance by monitoring:

- `seen-articles.json` for article discovery rate
- Server logs for API usage and errors
- Generated posts for quality and engagement

## 📊 Performance

- **Startup Time**: ~2-3 seconds
- **News Search**: ~5-10 seconds (depends on sources)
- **AI Analysis**: ~3-5 seconds (Gemini 2.0 Flash)
- **Total Generation**: ~10-20 seconds
- **Memory Usage**: ~50-100MB
- **API Calls**: 1-3 Gemini requests per briefing

## 🤝 Contributing

This is a focused AI agent implementation. To contribute:

1. Fork the repository
2. Create a feature branch
3. Test thoroughly with real API keys
4. Submit a pull request with clear description

## 📄 License

MIT License - Feel free to use and modify for your projects.

## 🆘 Support

For issues and questions:

1. Check the troubleshooting section above
2. Review server and browser console logs
3. Verify API keys and network connectivity
4. Test individual components (news search, AI analysis)

The agent is designed to be robust with fallback mechanisms, but AI APIs can be unpredictable. Always have backup content ready for important posting schedules.

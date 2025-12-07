# LinkedIn AI News Agent - Kiro Hook

This Kiro agent hook automatically discovers AI-related news and generates LinkedIn posts that you can copy and paste directly to your LinkedIn profile.

## How to Use

### Option 1: Direct Command (Always Works)

1. Open Kiro's integrated terminal
2. Run: `node linkedin-ai-news-agent.js`
3. Copy the generated posts from the terminal output
4. Paste directly to LinkedIn

### Option 2: Kiro Command Palette

1. Open the Kiro command palette (Ctrl+Shift+P)
2. Search for "Generate AI News Posts"
3. The agent will run and display generated posts
4. Copy any post you like and paste it directly to LinkedIn

### Option 3: Agent Hooks Panel (If Available)

1. Open the Agent Hooks panel in Kiro's explorer view
2. Look for "Generate AI News Posts" in the Content Generation category
3. Click the "Run" button to execute the agent
4. View results in the output panel

### Option 4: Quick Launch Scripts

**Windows Batch File:**

- Double-click `run-linkedin-agent.bat` for a simple GUI experience

**PowerShell Script:**

- Run `./run-linkedin-agent.ps1` in PowerShell for enhanced output

**Note**: If the hook doesn't appear in Kiro's interface, use Option 1 (direct command) which always works reliably.

## Configuration

You can customize the agent's behavior by editing `agent-config.json`:

- **aiKeywords**: Add or remove AI topics to search for
- **search.timeframe**: Change search timeframe ('d' = day, 'w' = week, 'm' = month)
- **posts.styles**: Customize post styles (news_share, question, insight, list)
- **sources.preferred**: Add preferred news sources
- **userPreferences.focusAreas**: Specify your AI expertise areas

## Features

✅ **Free to use** - Uses only free APIs (DuckDuckGo)  
✅ **Multiple post styles** - News shares, questions, insights, and lists  
✅ **LinkedIn optimized** - Proper character limits and hashtags  
✅ **Copy-paste ready** - Formatted for direct LinkedIn posting  
✅ **Source attribution** - Includes links to original articles  
✅ **Quality filtering** - Prioritizes reputable sources

## Scheduling (Optional)

The hook supports scheduled execution:

- Daily at 9 AM
- Weekdays at 8 AM
- Every 4 hours

Enable scheduling in the hook configuration if desired.

## Troubleshooting

If the agent fails to find news:

- Check your internet connection
- Try running again (API rate limiting may cause temporary issues)
- Expand the search timeframe in configuration
- Verify DuckDuckGo API is accessible

## Requirements

- Node.js installed
- Internet connection
- Kiro IDE with agent hooks enabled

## Hook Integration Status

The Kiro agent hook has been configured in multiple ways to ensure compatibility:

### Files Created:

- `.kiro/hooks/linkedin-ai-news-agent.json` - Primary hook configuration
- `.kiro/settings/hooks.json` - Alternative hook settings
- `run-linkedin-agent.bat` - Windows batch script
- `run-linkedin-agent.ps1` - PowerShell script
- `agent-config.json` - User configuration file

### If Hook Doesn't Appear:

1. **Restart Kiro IDE** - Hooks may need a restart to be recognized
2. **Check Kiro Version** - Ensure you have a version that supports agent hooks
3. **Use Direct Execution** - The `node linkedin-ai-news-agent.js` command always works
4. **Check Permissions** - Ensure Kiro has permission to execute Node.js scripts

### Verification:

The agent has been tested and works correctly with:

- ✅ News discovery from DuckDuckGo API
- ✅ AI content filtering and ranking
- ✅ Multiple LinkedIn post styles
- ✅ Copy-paste ready formatting
- ✅ Error handling and recovery
- ✅ Rate limiting compliance

## Support

If you encounter issues:

1. Try the direct command: `node linkedin-ai-news-agent.js`
2. Check your internet connection
3. Verify Node.js is installed: `node --version`
4. Review the console output for specific error messages

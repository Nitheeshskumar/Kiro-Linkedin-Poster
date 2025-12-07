// Simple test to verify the AI agent setup
const AIGoodNewsAgent = require('./ai-agent');

async function testAgent() {
    console.log('🧪 Testing AI Good News Agent...');
    
    // Test without API keys (should use fallback)
    const agent = new AIGoodNewsAgent();
    
    try {
        const result = await agent.run();
        
        if (result.success) {
            console.log('✅ Agent test PASSED');
            console.log(`📰 Found ${result.articles.length} articles`);
            console.log(`📝 Generated LinkedIn post (${result.linkedinPost.length} chars)`);
            console.log('\n📋 Sample LinkedIn Post:');
            console.log('─'.repeat(50));
            console.log(result.linkedinPost);
            console.log('─'.repeat(50));
        } else {
            console.log('❌ Agent test FAILED:', result.error);
        }
    } catch (error) {
        console.error('❌ Test error:', error.message);
    }
}

// Run the test
testAgent();
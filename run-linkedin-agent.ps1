#!/usr/bin/env pwsh

Write-Host "🚀 Starting LinkedIn AI News Agent..." -ForegroundColor Green
Write-Host ""

try {
    node linkedin-ai-news-agent.js
    Write-Host ""
    Write-Host "✅ Agent execution completed!" -ForegroundColor Green
    Write-Host "💡 Copy any post above and paste it to LinkedIn" -ForegroundColor Yellow
} catch {
    Write-Host "❌ Error running agent: $_" -ForegroundColor Red
    Write-Host "💡 Make sure Node.js is installed and you have internet connection" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Press any key to continue..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
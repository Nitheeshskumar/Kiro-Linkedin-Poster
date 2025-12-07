#!/usr/bin/env pwsh

Write-Host "🚀 Starting LinkedIn AI News Agent UI..." -ForegroundColor Green
Write-Host ""

Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
npm install

Write-Host ""
Write-Host "🌐 Starting server..." -ForegroundColor Green
Write-Host "Opening browser at http://localhost:3000" -ForegroundColor Cyan

# Open browser
Start-Process "http://localhost:3000"

# Start server
node server.js
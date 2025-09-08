Write-Host "Starting Castlist with ngrok..." -ForegroundColor Green
Write-Host ""

Write-Host "1. Starting Vite dev server..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm run dev"

Write-Host "2. Waiting for server to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

Write-Host "3. Starting ngrok tunnel..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "ngrok http 5173"

Write-Host ""
Write-Host "✅ Both servers started!" -ForegroundColor Green
Write-Host ""
Write-Host "📱 Vite Dev Server: http://localhost:5173" -ForegroundColor Cyan
Write-Host "🌐 Ngrok Tunnel: Check the ngrok window for HTTPS URL" -ForegroundColor Cyan
Write-Host ""
Write-Host "💡 Use the ngrok HTTPS URL for Farcaster authentication" -ForegroundColor Magenta
Write-Host ""
Write-Host "Press any key to continue..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

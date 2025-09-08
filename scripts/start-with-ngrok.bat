@echo off
echo Starting Castlist with ngrok...
echo.

echo 1. Starting Vite dev server...
start "Vite Server" cmd /k "npm run dev"

echo 2. Waiting for server to start...
timeout /t 5 /nobreak > nul

echo 3. Starting ngrok tunnel...
start "Ngrok Tunnel" cmd /k "ngrok http 5173"

echo.
echo ✅ Both servers started!
echo.
echo 📱 Vite Dev Server: http://localhost:5173
echo 🌐 Ngrok Tunnel: Check the ngrok window for HTTPS URL
echo.
echo 💡 Use the ngrok HTTPS URL for Farcaster authentication
echo.
pause

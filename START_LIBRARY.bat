@echo off
echo.
echo  ====================================================
echo   Smart Digital Library -- Starting All Servers
echo  ====================================================
echo.

echo [1/2] Starting Node.js Backend on port 5000...
start "Library Backend" cmd /k "cd /d %~dp0backend && node index.js"

timeout /t 2 /nobreak >nul

echo [2/2] Starting Streamlit Frontend on port 8501...
start "Library Streamlit" cmd /k "cd /d %~dp0 && python -m streamlit run streamlit_app.py --server.port 8501"

timeout /t 3 /nobreak >nul

echo.
echo  ====================================================
echo   Servers started!
echo   Backend  : http://localhost:5000
echo   Streamlit: http://localhost:8501
echo   React    : run 'npm run dev' in frontend/ folder
echo  ====================================================
echo.
pause

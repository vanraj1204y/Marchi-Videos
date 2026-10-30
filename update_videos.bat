@echo off
chcp 65001 > nul
echo ========================================================
echo   Chili Agro Farm - One-Click Video Sync and Updater
echo ========================================================
echo.
echo Scanning 'videos' folder for new or deleted videos...
echo.

python update_videos.py

echo.
echo ========================================================
pause

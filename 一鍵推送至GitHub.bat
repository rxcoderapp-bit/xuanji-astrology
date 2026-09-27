@echo off
chcp 65001 >nul
title 玄機天象 - 一鍵推送至 GitHub (自動線上部署)
echo ========================================================
echo    玄機天象 (紫微斗數八字互動式解盤系統) - 一鍵推送部署
echo ========================================================
echo.

cd /d "%~dp0"

echo [1/3] 正在編譯最新版本 (npm run build)...
call npm run build
if errorlevel 1 goto BUILD_ERROR

echo.
echo [2/3] 正在同步原始碼至 main 分支...
git add -A
git diff-index --quiet HEAD --
if errorlevel 1 (
    echo 發現未儲存變更，正在自動提交...
    git commit -m "chore: auto-commit before push"
)
git push origin main
if errorlevel 1 goto PUSH_ERROR

echo.
echo [3/3] 正在發布最新建置至 gh-pages 線上部署分支...
for /f "tokens=*" %%u in ('git remote get-url origin') do set REPO_URL=%%u
cd /d "%~dp0dist"
if not exist ".git" (
    git init -b gh-pages
    git config user.name "Antigravity"
    git config user.email "xuanji@local.dev"
    git remote add origin %REPO_URL%
)
git add -A
git commit -m "deploy: GitHub Pages production release" --allow-empty
git push -f origin gh-pages
cd /d "%~dp0"

echo.
echo ========================================================
echo  [成功] 恭喜！最新版本已成功同步推送至 GitHub！
echo  線上網址: https://rxcoderapp-bit.github.io/xuanji-astrology/
echo ========================================================
echo.
pause
exit /b 0

:BUILD_ERROR
echo.
echo [錯誤] 建置未通過，請檢查錯誤後再試。
pause
exit /b 1

:PUSH_ERROR
echo.
echo ========================================================
echo  [推送失敗] 請確認網路連線與 GitHub 儲存庫權限。
echo ========================================================
echo.
pause
exit /b 1

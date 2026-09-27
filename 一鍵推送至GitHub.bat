@echo off
chcp 65001 >nul
title 玄機天象 - 一鍵推送至 GitHub
echo ========================================================
echo    玄機天象 (紫微斗數八字互動式解盤系統) - 一鍵推送
echo ========================================================
echo.

cd /d "%~dp0"

echo [1/3] 正在驗證建置狀態...
call npm run build
if errorlevel 1 goto BUILD_ERROR

echo.
echo [2/3] 正在檢查 Git 狀態...
git add -A
git diff-index --quiet HEAD --
if errorlevel 1 (
    echo 發現未儲存變更，正在自動提交...
    git commit -m "chore: auto-commit before push"
)

echo.
echo [3/3] 正在檢查遠端儲存庫...
git remote get-url origin >nul 2>&1
if errorlevel 1 goto NEED_REMOTE

:DO_PUSH
echo 正在推送到 GitHub main 分支...
git push -u origin main
if errorlevel 1 goto PUSH_ERROR

echo.
echo ========================================================
echo  [成功] 最新版本已成功推送至 GitHub！
echo  GitHub Actions 正在為您自動發布至 GitHub Pages。
echo ========================================================
echo.
pause
exit /b 0

:NEED_REMOTE
echo.
echo [設定] 尚未綁定 GitHub 遠端儲存庫！
echo 請在下方貼上您的 GitHub 儲存庫網址：
echo 範例: https://github.com/rxcoderapp-bit/xuanji-astrology.git
set /p REPO_URL="請貼上網址並按 Enter: "
if "%REPO_URL%"=="" goto NO_URL
git remote add origin %REPO_URL%
echo 已成功綁定遠端儲存庫: %REPO_URL%
echo.
goto DO_PUSH

:NO_URL
echo.
echo 未輸入網址，已取消推送。
pause
exit /b 1

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

@echo off
chcp 65001 >nul
setlocal EnableExtensions EnableDelayedExpansion

:: =========================================================
:: Claude Code npm 更新脚本（精简版：latest / next / stable）
:: =========================================================

set "PKG=@anthropic-ai/claude-code"

where npm >nul 2>nul
if errorlevel 1 (
    echo [错误] 未找到 npm，请先安装 Node.js。
    pause
    exit /b 1
)

echo.
echo === 当前版本 ===
for /f "tokens=*" %%v in ('npm root -g') do (
  type "%%v\@anthropic-ai\claude-code\package.json" | findstr version
)
if errorlevel 1 echo [提示] 未检测到已安装版本

echo.
echo === 检查可用版本标签 ===

set /a IDX=0

:: --- latest ---
for /f %%v in ('npm view %PKG%@latest version 2^>nul') do (
    set /a IDX+=1
    set TAG_!IDX!=latest
    set VER_!IDX!=%%v
    echo !IDX!. latest   ^(%%v^)
)

:: --- next ---
for /f %%v in ('npm view %PKG%@next version 2^>nul') do (
    set /a IDX+=1
    set TAG_!IDX!=next
    set VER_!IDX!=%%v
    echo !IDX!. next     ^(%%v^)
)

:: --- stable（可能不存在）---
for /f %%v in ('npm view %PKG%@stable version 2^>nul') do (
    set /a IDX+=1
    set TAG_!IDX!=stable
    set VER_!IDX!=%%v
    echo !IDX!. stable   ^(%%v^)
)

if %IDX% EQU 0 (
    echo [错误] 未获取到任何可用标签
    pause
    exit /b 1
)

echo.
set /p CHOICE=请输入编号选择版本:

if not defined CHOICE goto :invalid

for /f "delims=0123456789" %%X in ("%CHOICE%") do goto :invalid

if %CHOICE% LSS 1 goto :invalid
if %CHOICE% GTR %IDX% goto :invalid

set "SELECTED_TAG=!TAG_%CHOICE%!"
set "SELECTED_VER=!VER_%CHOICE%!"

echo.
echo === 即将更新 ===
echo 标签: !SELECTED_TAG!
echo 版本: !SELECTED_VER!
echo.

set /p CONFIRM=确认请输入 Y:
if /i not "!CONFIRM!"=="Y" (
    echo 已取消
    pause
    exit /b 0
)

call npm install -g %PKG%@!SELECTED_TAG!
if errorlevel 1 (
    echo [错误] 更新失败
    pause
    exit /b 1
)

echo.
echo === 更新完成 ===
for /f "tokens=*" %%v in ('npm root -g') do (
  type "%%v\@anthropic-ai\claude-code\package.json" | findstr version
)

pause
exit /b 0

:invalid
echo [错误] 输入无效
pause
exit /b 1

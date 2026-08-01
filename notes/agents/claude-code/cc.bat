@echo off
chcp 65001 >nul
setlocal EnableExtensions EnableDelayedExpansion

rem ===== 基础配置：项目根目录 =====
set "base=%USERPROFILE%\workspace"
set "claude_dir=%USERPROFILE%\.claude"
set "settings_file="
set "settings_choice="
set "choice="
set "project_name="

rem ===== 自动检测 Claude settings 文件 =====
set /a settings_count=0

if exist "%claude_dir%\" (
    for /f "delims=" %%F in ('dir /b /a-d /on "%claude_dir%\settings*.json" 2^>nul') do (
        set /a settings_count+=1
        set "settings[!settings_count!]=%%F"
    )
)

if !settings_count! EQU 1 (
    rem 只有一个 settings 文件，直接使用
    set "settings_file=%claude_dir%\!settings[1]!"
) else (
    echo 请选择 settings 文件（0=默认，回车=默认）：

    if !settings_count! GTR 0 (
        for /L %%I in (1,1,!settings_count!) do (
            set "sf=!settings[%%I]!"
            set "label=!sf!"

            rem 去掉 settings 前缀
            if /I "!label:~0,8!"=="settings" set "label=!label:~8!"

            rem 去掉 .json 后缀
            if /I "!label:~-5!"==".json" set "label=!label:~0,-5!"

            rem 去掉开头的 -
            if "!label:~0,1!"=="-" set "label=!label:~1!"

            if "!label!"=="" set "label=(默认)"

            echo   %%I^) !sf!  !label!
        )
    ) else (
        echo   （未找到 settings*.json，将使用默认配置）
    )

    call :choose_settings
    if errorlevel 1 exit /b 1
)

rem ===== 确保 workspace 存在 =====
if not exist "%base%\" (
    mkdir "%base%" || exit /b 1
)

cd /d "%base%" || exit /b 1

rem ===== 读取 workspace 下第一层文件夹 =====
set /a dir_count=0

for /f "delims=" %%D in ('dir /b /ad /on "%base%" 2^>nul') do (
    set /a dir_count+=1
    set "dirs[!dir_count!]=%%D"
)

echo 0^) ^<新建项目^>

if !dir_count! GTR 0 (
    for /L %%I in (1,1,!dir_count!) do (
        echo %%I^) !dirs[%%I]!
    )
)

rem ===== 选择项目 =====
call :choose_project
if errorlevel 1 exit /b 1

rem ===== 检查 claude 命令是否存在 =====
where claude >nul 2>nul
if errorlevel 1 (
    echo 错误：在 PATH 中未找到 claude 命令。
    exit /b 1
)

rem ===== 启动 Claude，并透传所有参数 =====
claude --settings "%settings_file%" %*

exit /b %errorlevel%


:choose_settings
set "settings_choice="
set /p "settings_choice=请输入选择："

if "%settings_choice%"=="" (
    set "settings_file=%claude_dir%\settings.json"
    exit /b 0
)

if "%settings_choice%"=="0" (
    set "settings_file=%claude_dir%\settings.json"
    exit /b 0
)

echo(%settings_choice%| findstr /R "^[0-9][0-9]*$" >nul
if errorlevel 1 (
    echo 无效选择。请输入 0-!settings_count! 或按回车使用默认值。
    goto :choose_settings
)

if %settings_choice% GEQ 1 if %settings_choice% LEQ !settings_count! (
    set "settings_file=%claude_dir%\!settings[%settings_choice%]!"
    exit /b 0
)

echo 无效选择。请输入 0-!settings_count! 或按回车使用默认值。
goto :choose_settings


:choose_project
set "choice="
set /p "choice=请选择项目编号："

echo(%choice%| findstr /R "^[0-9][0-9]*$" >nul
if errorlevel 1 (
    echo 请输入数字。
    goto :choose_project
)

if "%choice%"=="0" (
    goto :create_project
)

if %choice% GEQ 1 if %choice% LEQ !dir_count! (
    cd /d "%base%\!dirs[%choice%]!" || exit /b 1
    exit /b 0
)

echo 无效的数字。
goto :choose_project


:create_project
set "project_name="
set /p "project_name=新项目名称："

echo(%project_name%| findstr /R "^[A-Za-z0-9_-][A-Za-z0-9._-]*$" >nul

if errorlevel 1 (
    echo 无效的名称。只能使用字母、数字、点、下划线或短横线，且不能以点开头。
    goto :create_project
)

mkdir "%base%\%project_name%" 2>nul
if errorlevel 1 (
    echo 无法创建项目文件夹。
    exit /b 1
)

cd /d "%base%\%project_name%" || exit /b 1
exit /b 0
@echo off

:: 这是一个批处理文件，用于运行Git令牌配置脚本
:: 双击此文件即可执行PowerShell脚本

:: 启用PowerShell脚本执行权限
powershell -Command "Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass -Force"

:: 运行配置脚本
powershell -File "%~dp0configure-git-token.ps1"

:: 等待用户按下任意键后退出
echo.
echo 配置脚本已执行完成。
echo 请按任意键退出...
pause > nul
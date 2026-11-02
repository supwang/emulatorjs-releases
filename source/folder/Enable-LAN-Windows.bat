@echo off
chcp 65001 >nul
rem Normally EmulatorJS runs this by itself the first time. You only need it if you clicked "No" then.
rem One-time setup so other devices on your home network can open EmulatorJS (LAN play).
rem Needs administrator rights: Windows will ask "Do you want to allow this app to make changes?" - choose Yes.
net session >nul 2>&1
if %errorlevel% neq 0 (
  powershell -NoProfile -Command "Start-Process -FilePath '%~f0' -Verb RunAs"
  exit /b
)
rem port 28765 (8765 until 1.3.0): remove the old 8765 permissions, add 28765
netsh http delete urlacl url=http://+:8765/ >nul 2>&1
netsh advfirewall firewall delete rule name="EmulatorJS 8765" >nul 2>&1
netsh http delete urlacl url=http://+:28765/ >nul 2>&1
netsh http add urlacl url=http://+:28765/ sddl=D:(A;;GX;;;WD)
netsh advfirewall firewall delete rule name="EmulatorJS 28765" >nul 2>&1
netsh advfirewall firewall add rule name="EmulatorJS 28765" dir=in action=allow protocol=TCP localport=28765
netsh advfirewall firewall delete rule name="EmulatorJS discovery 8764" >nul 2>&1
netsh advfirewall firewall add rule name="EmulatorJS discovery 8764" dir=in action=allow protocol=UDP localport=8764
if /i "%~1"=="auto" exit /b
echo.
echo Done. Close the EmulatorJS window and open EmulatorJS again.
echo.
pause

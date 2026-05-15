# 🔧 Podman Desktop Configuration Guide

## Current Status
✅ Podman Desktop is installed at: `C:\Program Files\Podman Desktop`  
❌ Podman CLI is NOT configured (command not found in PATH)

---

## What You Need to Do

Podman Desktop is a GUI application, but you also need the **Podman CLI** to run containers from the command line.

### Option 1: Install Podman CLI via Podman Desktop (Recommended)

1. **Open Podman Desktop**
   - Launch Podman Desktop from Start Menu

2. **Install Podman CLI**
   - In Podman Desktop, look for:
     - Settings → Resources → Podman
     - Or a prompt to "Install Podman"
   - Click "Install" or "Setup" to install the Podman CLI
   - This will install podman.exe and add it to your PATH

3. **Verify Installation**
   - Close and reopen PowerShell (important!)
   - Run: `podman --version`
   - You should see version information

### Option 2: Manual Installation

If Podman Desktop doesn't offer CLI installation:

1. **Download Podman for Windows**
   - Visit: https://github.com/containers/podman/releases
   - Download: `podman-<version>-setup.exe` (Windows installer)
   - Example: `podman-4.9.0-setup.exe`

2. **Run the Installer**
   - Double-click the downloaded file
   - Follow installation wizard
   - Choose default options
   - Installer will add Podman to PATH

3. **Restart PowerShell**
   - Close all PowerShell windows
   - Open a new PowerShell window
   - Run: `podman --version`

### Option 3: Use Podman Desktop's Built-in CLI

Some versions of Podman Desktop include the CLI:

1. **Check Podman Desktop Resources**
   ```powershell
   # Look for podman.exe in Podman Desktop directory
   Get-ChildItem "C:\Program Files\Podman Desktop" -Recurse -Filter "*.exe" | Where-Object { $_.Name -like "*podman*" }
   ```

2. **Add to PATH Manually**
   If found, add the directory to your PATH:
   ```powershell
   # Example if found at: C:\Program Files\Podman Desktop\resources\bin
   $env:Path += ";C:\Program Files\Podman Desktop\resources\bin"
   
   # To make permanent:
   [Environment]::SetEnvironmentVariable("Path", $env:Path + ";C:\Program Files\Podman Desktop\resources\bin", "User")
   ```

---

## After Installing Podman CLI

### Step 1: Initialize Podman Machine

```powershell
# Initialize a new Podman machine
podman machine init

# Start the machine
podman machine start

# Verify it's running
podman machine list
```

### Step 2: Test Podman

```powershell
# Test with a simple container
podman run hello-world

# Check version
podman --version

# Check system info
podman info
```

### Step 3: Install podman-compose

```powershell
# Check if Python is installed
python --version

# If Python is installed, install podman-compose
pip install podman-compose

# Verify installation
podman-compose --version
```

If Python is not installed:
1. Download from: https://www.python.org/downloads/
2. Install Python (check "Add to PATH" during installation)
3. Then run: `pip install podman-compose`

---

## Quick Configuration Script

Run this PowerShell script after installing Podman CLI:

```powershell
# Refresh PATH
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")

# Check Podman
Write-Host "Checking Podman installation..." -ForegroundColor Cyan
podman --version

# Initialize Podman machine if needed
Write-Host "`nInitializing Podman machine..." -ForegroundColor Cyan
podman machine init --now

# Start Podman machine
Write-Host "`nStarting Podman machine..." -ForegroundColor Cyan
podman machine start

# Check status
Write-Host "`nPodman machine status:" -ForegroundColor Cyan
podman machine list

# Test Podman
Write-Host "`nTesting Podman with hello-world..." -ForegroundColor Cyan
podman run hello-world

Write-Host "`n✅ Podman is configured and ready!" -ForegroundColor Green
```

---

## Troubleshooting

### Issue: "podman: command not found" after installation

**Solution:**
```powershell
# Refresh PATH in current session
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")

# Or close and reopen PowerShell
```

### Issue: "Cannot connect to Podman"

**Solution:**
```powershell
# Check if machine exists
podman machine list

# If no machine, initialize one
podman machine init

# Start the machine
podman machine start

# Check status
podman machine list
```

### Issue: Podman machine won't start

**Solution:**
```powershell
# Remove existing machine
podman machine rm podman-machine-default

# Create new machine
podman machine init

# Start it
podman machine start
```

---

## Next Steps After Configuration

Once Podman CLI is working:

1. ✅ Run: `podman --version` (should work)
2. ✅ Run: `podman machine list` (should show running machine)
3. ✅ Install podman-compose: `pip install podman-compose`
4. ✅ Deploy the application: `podman-compose up -d`

---

## Alternative: Use Docker Desktop Instead

If Podman configuration is too complex, you can use Docker Desktop:

1. **Uninstall Podman Desktop** (optional)
2. **Download Docker Desktop**: https://www.docker.com/products/docker-desktop/
3. **Install Docker Desktop**
4. **Use docker-compose commands** instead of podman-compose

The project works with both Docker and Podman!

---

## Summary

**Current Issue:** Podman Desktop is installed, but Podman CLI is not configured.

**What to Do:**
1. Open Podman Desktop and install Podman CLI through its interface
2. OR download and install Podman CLI manually
3. Initialize and start Podman machine
4. Install podman-compose
5. Deploy the application

**Expected Result:**
- `podman --version` works
- `podman machine list` shows running machine
- Ready to deploy containers

---

*Need help? Check the PODMAN_DEPLOYMENT.md file for detailed deployment instructions.*
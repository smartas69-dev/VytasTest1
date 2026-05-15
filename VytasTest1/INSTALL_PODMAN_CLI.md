# 🚀 Install Podman CLI - Step by Step

## Current Situation
- ✅ Podman Desktop is installed
- ❌ Podman CLI (podman.exe) is NOT installed
- ❌ Cannot run `podman` commands

**Important:** Podman Desktop is just a GUI application. You need to install the Podman CLI separately.

---

## Quick Installation Steps

### Step 1: Download Podman CLI

**Direct Download Link:**
https://github.com/containers/podman/releases/latest

**What to Download:**
- Look for: `podman-<version>-setup.exe`
- Example: `podman-5.0.0-setup.exe`
- File size: ~50-80 MB

**Alternative Download (if above doesn't work):**
- Go to: https://podman.io/getting-started/installation
- Click "Windows" tab
- Download the Windows installer

### Step 2: Run the Installer

1. **Double-click** the downloaded `podman-setup.exe` file
2. **Click "Next"** through the installation wizard
3. **Accept** the license agreement
4. **Choose default installation path** (recommended)
5. **Check** "Add Podman to PATH" (IMPORTANT!)
6. **Click "Install"**
7. **Wait** for installation to complete
8. **Click "Finish"**

### Step 3: Verify Installation

1. **Close ALL PowerShell windows** (important!)
2. **Open a NEW PowerShell window**
3. **Run this command:**
   ```powershell
   podman --version
   ```
4. **Expected output:**
   ```
   podman version 5.0.0
   ```

---

## If Installation Succeeds

Run these commands in PowerShell:

```powershell
# 1. Check Podman version
podman --version

# 2. Initialize Podman machine
podman machine init

# 3. Start Podman machine
podman machine start

# 4. Verify machine is running
podman machine list

# 5. Test with hello-world
podman run hello-world
```

---

## If "podman: command not found" After Installation

### Solution 1: Restart PowerShell
```powershell
# Close all PowerShell windows
# Open a NEW PowerShell window
# Try again: podman --version
```

### Solution 2: Manually Add to PATH
```powershell
# Find where Podman was installed
Get-ChildItem "C:\Program Files" -Recurse -Filter "podman.exe" -ErrorAction SilentlyContinue | Select-Object FullName

# If found at: C:\Program Files\RedHat\Podman\podman.exe
# Add to PATH:
$podmanPath = "C:\Program Files\RedHat\Podman"
[Environment]::SetEnvironmentVariable("Path", $env:Path + ";$podmanPath", "User")

# Restart PowerShell and test
podman --version
```

### Solution 3: Use Full Path
```powershell
# If Podman is at: C:\Program Files\RedHat\Podman\podman.exe
& "C:\Program Files\RedHat\Podman\podman.exe" --version

# Create an alias for current session
Set-Alias -Name podman -Value "C:\Program Files\RedHat\Podman\podman.exe"
```

---

## Alternative: Use Winget (Windows Package Manager)

If you have Winget installed:

```powershell
# Install Podman via Winget
winget install RedHat.Podman

# Restart PowerShell
# Test
podman --version
```

---

## Alternative: Use Chocolatey

If you have Chocolatey installed:

```powershell
# Install Podman via Chocolatey
choco install podman-cli

# Restart PowerShell
# Test
podman --version
```

---

## After Successful Installation

### Install podman-compose

```powershell
# Check if Python is installed
python --version

# If Python is installed:
pip install podman-compose

# Verify
podman-compose --version
```

### If Python is NOT installed:

1. Download Python from: https://www.python.org/downloads/
2. Run installer
3. **IMPORTANT:** Check "Add Python to PATH" during installation
4. After installation, run: `pip install podman-compose`

---

## Deploy Your Application

Once Podman CLI is working:

```powershell
# Navigate to project
cd c:/Users/SauliusMartusevicius/IBM/AI_Bob_Code/VytasTest1

# Start services with podman-compose
podman-compose up -d

# Check containers
podman ps

# Initialize database
podman exec -it vytastest1-backend-1 npx prisma migrate deploy
podman exec -it vytastest1-backend-1 npx prisma db seed

# Access application
# Frontend: http://localhost:5173
# Backend: http://localhost:3000
```

---

## Still Not Working?

### Option A: Use Docker Desktop Instead

Podman and Docker are compatible. If Podman is causing issues:

1. **Download Docker Desktop:** https://www.docker.com/products/docker-desktop/
2. **Install Docker Desktop**
3. **Use `docker-compose` instead of `podman-compose`**
4. **Everything else stays the same**

### Option B: Manual Container Setup

If compose doesn't work, you can run containers individually:

```powershell
# See PODMAN_DEPLOYMENT.md - Option C: Manual Podman Commands
```

---

## Quick Checklist

- [ ] Downloaded Podman CLI installer
- [ ] Ran the installer
- [ ] Checked "Add to PATH" during installation
- [ ] Closed and reopened PowerShell
- [ ] `podman --version` works
- [ ] Initialized Podman machine: `podman machine init`
- [ ] Started Podman machine: `podman machine start`
- [ ] Installed podman-compose: `pip install podman-compose`
- [ ] Ready to deploy!

---

## Summary

**What You Need:**
1. Podman CLI installer from GitHub releases
2. Run the installer
3. Restart PowerShell
4. Initialize Podman machine
5. Install podman-compose

**Expected Result:**
- `podman --version` shows version number
- `podman machine list` shows running machine
- Ready to deploy containers

---

*Need more help? Check PODMAN_SETUP_GUIDE.md and PODMAN_DEPLOYMENT.md*
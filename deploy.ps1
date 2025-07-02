# Apollo DSKY Deployment Script for Ubuntu Server
# This script deploys the built application to the Ubuntu server at 192.168.1.2

param(
    [string]$ServerUser = "user",
    [string]$ServerHost = "192.168.1.2",
    [string]$DeployPath = "/var/www/crypto-dsky"
)

Write-Host "🚀 Apollo DSKY Deployment Script" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green

# Check if build exists
if (-not (Test-Path "dist")) {
    Write-Host "❌ Build not found. Running build first..." -ForegroundColor Red
    npm run build
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Build failed. Exiting." -ForegroundColor Red
        exit 1
    }
}

Write-Host "✅ Build directory found" -ForegroundColor Green

# Create deployment package
Write-Host "📦 Creating deployment package..." -ForegroundColor Yellow
$timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
$packageName = "crypto-dsky-$timestamp.tar.gz"

# Create tar archive (requires tar command or WSL)
try {
    tar -czf $packageName -C dist .
    Write-Host "✅ Package created: $packageName" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to create package. Make sure tar is available or use WSL." -ForegroundColor Red
    exit 1
}

# Upload to server
Write-Host "📤 Uploading to server $ServerHost..." -ForegroundColor Yellow
try {
    scp $packageName "${ServerUser}@${ServerHost}:/tmp/"
    Write-Host "✅ Package uploaded successfully" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to upload package. Check SSH connection." -ForegroundColor Red
    exit 1
}

# Deploy on server
Write-Host "🔧 Deploying on server..." -ForegroundColor Yellow
$deployCommands = @"
sudo mkdir -p $DeployPath
sudo rm -rf $DeployPath/*
cd /tmp
sudo tar -xzf $packageName -C $DeployPath
sudo chown -R www-data:www-data $DeployPath
sudo chmod -R 755 $DeployPath
rm /tmp/$packageName
echo 'Deployment completed successfully!'
"@

try {
    ssh "${ServerUser}@${ServerHost}" $deployCommands
    Write-Host "✅ Deployment completed successfully!" -ForegroundColor Green
} catch {
    Write-Host "❌ Deployment failed. Check server connection." -ForegroundColor Red
    exit 1
}

# Cleanup local package
Remove-Item $packageName -Force
Write-Host "🧹 Cleaned up local package" -ForegroundColor Green

Write-Host ""
Write-Host "🎉 Apollo DSKY deployed successfully!" -ForegroundColor Green
Write-Host "🌐 Application should be available at: http://$ServerHost" -ForegroundColor Cyan
Write-Host ""

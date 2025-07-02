# Apollo DSKY Deployment Guide

## Quick Deployment

### Option 1: Automated PowerShell Script
```powershell
# From the project root directory
.\deploy.ps1
```

### Option 2: Manual Deployment

1. **Build the application:**
   ```bash
   npm run build
   ```

2. **Copy files to server:**
   ```bash
   scp -r dist/* user@192.168.1.2:/var/www/crypto-dsky/
   ```

3. **Set up nginx configuration:**
   ```bash
   scp nginx-crypto-dsky.conf user@192.168.1.2:/tmp/
   ssh user@192.168.1.2
   sudo cp /tmp/nginx-crypto-dsky.conf /etc/nginx/sites-available/crypto-dsky
   sudo ln -s /etc/nginx/sites-available/crypto-dsky /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl reload nginx
   ```

## Server Requirements

- Ubuntu Server with nginx installed
- Node.js (for Hardhat if using local blockchain)
- Web server access (port 80/443)

## Environment Setup

### Ubuntu Server (192.168.1.2)

1. **Install required packages:**
   ```bash
   sudo apt update
   sudo apt install nginx nodejs npm
   ```

2. **Create web directory:**
   ```bash
   sudo mkdir -p /var/www/crypto-dsky
   sudo chown -R www-data:www-data /var/www/crypto-dsky
   ```

3. **Configure firewall (if enabled):**
   ```bash
   sudo ufw allow 'Nginx Full'
   sudo ufw allow ssh
   ```

## Post-Deployment Verification

1. **Check nginx status:**
   ```bash
   sudo systemctl status nginx
   ```

2. **View logs:**
   ```bash
   sudo tail -f /var/log/nginx/crypto-dsky.access.log
   sudo tail -f /var/log/nginx/crypto-dsky.error.log
   ```

3. **Test the application:**
   - Open browser to `http://192.168.1.2`
   - Verify DSKY interface loads
   - Test MetaMask connection
   - Verify Web3 functionality

## Production Considerations

### SSL/HTTPS Setup
For production use, consider setting up SSL:

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d hardhat.hartonomous.com
```

### Performance Optimization
- Enable nginx gzip compression (already configured)
- Set up proper caching headers (already configured)
- Consider using a CDN for assets

### Security
- Regularly update server packages
- Monitor access logs for suspicious activity
- Consider setting up fail2ban for SSH protection

## Troubleshooting

### Common Issues

1. **Nginx permission errors:**
   ```bash
   sudo chown -R www-data:www-data /var/www/crypto-dsky
   sudo chmod -R 755 /var/www/crypto-dsky
   ```

2. **CORS issues with MetaMask:**
   - Verify nginx CORS headers are properly set
   - Check that Hardhat is running on port 8545
   - Ensure firewall allows necessary ports

3. **Build issues:**
   ```bash
   # Clear npm cache and rebuild
   npm cache clean --force
   rm -rf node_modules package-lock.json
   npm install
   npm run build
   ```

## Monitoring

### Health Checks
You can monitor the application with:

```bash
# Check if application is accessible
curl -I http://192.168.1.2

# Monitor nginx access logs
sudo tail -f /var/log/nginx/crypto-dsky.access.log
```

### Performance Monitoring
- Monitor server resources (CPU, memory, disk)
- Check nginx access logs for response times
- Monitor Web3 RPC call success rates

## Backup Strategy

### Application Backup
```bash
# Backup current deployment
sudo tar -czf crypto-dsky-backup-$(date +%Y%m%d).tar.gz -C /var/www crypto-dsky

# Backup nginx configuration
sudo cp /etc/nginx/sites-available/crypto-dsky /home/user/backups/
```

## Updates

To update the application:

1. **Build new version locally**
2. **Run deployment script or manual process**
3. **Verify functionality**
4. **Monitor logs for any issues**

## Support

For issues related to:
- **Hardhat blockchain**: Check server/README.md
- **MetaMask integration**: Verify network configuration matches Hardhat
- **Web3 functionality**: Ensure RPC endpoints are accessible

---

**Apollo DSKY Crypto Guidance Computer**  
*Bringing retro Apollo mission control to modern cryptocurrency operations*

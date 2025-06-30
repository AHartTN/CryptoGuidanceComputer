# Apollo DSKY Hardhat Server

This directory contains the server configuration and scripts for running the Hardhat development blockchain for the Apollo DSKY cryptocurrency interface.

## Quick Start

1. **Upload files to your Ubuntu server:**
   ```bash
   scp -r server/ user@hardhat.hartonomous.com:/home/user/hardhat-server/
   ```

2. **Connect to your server and set up:**
   ```bash
   ssh user@hardhat.hartonomous.com
   cd /home/user/hardhat-server
   chmod +x hardhat-server.sh
   ```

3. **Install and start services:**
   ```bash
   ./hardhat-server.sh install
   ./hardhat-server.sh start
   ```

## Server Architecture

The server setup includes:

- **Hardhat Node** (Port 8545): Local blockchain development node
- **CORS Proxy** (Port 80/443): Express.js proxy that handles CORS headers properly
- **Health Monitoring**: Built-in health checks and logging

## Files

- `hardhat.config.js` - Hardhat network configuration
- `cors-server.js` - Express.js CORS proxy server
- `package.json` - Node.js dependencies
- `hardhat-server.sh` - Management script for all services
- `README.md` - This documentation

## CORS Fix

The CORS issue was caused by duplicate `Access-Control-Allow-Origin` headers. This setup:

1. **Hardhat Node**: Runs on localhost:8545 without CORS headers
2. **CORS Proxy**: Express.js server that adds proper CORS headers once
3. **Header Management**: Explicitly removes any duplicate headers

## Management Commands

```bash
# Start all services
./hardhat-server.sh start

# Check status
./hardhat-server.sh status

# View logs
./hardhat-server.sh logs

# Test connectivity
./hardhat-server.sh test

# Stop services
./hardhat-server.sh stop

# Restart services
./hardhat-server.sh restart
```

## Endpoints

After setup, these endpoints will be available:

- **HTTPS JSON-RPC**: `https://hardhat.hartonomous.com/`
- **HTTP JSON-RPC**: `http://hardhat.hartonomous.com:8545/`
- **Health Check**: `https://hardhat.hartonomous.com/health`

## Nginx Configuration (Optional)

If you want to use Nginx as a reverse proxy for HTTPS, create `/etc/nginx/sites-available/hardhat`:

```nginx
server {
    listen 443 ssl;
    server_name hardhat.hartonomous.com;

    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;

    location / {
        proxy_pass http://localhost:80;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # CORS headers (handled by Express, but backup)
        add_header Access-Control-Allow-Origin *;
        add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS";
        add_header Access-Control-Allow-Headers "Content-Type, Authorization, x-requested-with";
        
        # Handle preflight
        if ($request_method = 'OPTIONS') {
            return 200;
        }
    }
}
```

## Troubleshooting

### Check Service Status
```bash
./hardhat-server.sh status
```

### View Real-time Logs
```bash
./hardhat-server.sh logs hardhat  # Hardhat node logs
./hardhat-server.sh logs proxy    # CORS proxy logs
./hardhat-server.sh logs          # All logs
```

### Test Connectivity
```bash
# Test local Hardhat node
curl -X POST http://localhost:8545 \
     -H "Content-Type: application/json" \
     -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'

# Test CORS proxy
curl http://localhost/health

# Test from external
curl https://hardhat.hartonomous.com/health
```

### Common Issues

1. **Port 80 requires sudo**: Run as root or use port 8080 instead
2. **Firewall blocking**: Ensure ports 80, 443, and 8545 are open
3. **Permission denied**: Make sure the script is executable (`chmod +x hardhat-server.sh`)

## Production Considerations

- Use a process manager like PM2 for production deployment
- Set up proper SSL certificates
- Configure proper firewall rules
- Monitor disk space (blockchain data grows over time)
- Set up log rotation

## Development Accounts

The Hardhat node comes pre-configured with test accounts. Use the default mnemonic:
```
test test test test test test test test test test test junk
```

This generates 20 test accounts, each with 10,000 ETH for development.

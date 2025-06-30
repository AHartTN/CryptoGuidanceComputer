#!/bin/bash

# Hardhat network startup script with CORS support
# This script addresses the CORS duplicate headers issue

echo "Starting Hardhat network with CORS support..."

# Kill any existing Hardhat processes
pkill -f "hardhat node"

# Start Hardhat with explicit CORS configuration
npx hardhat node \
  --hostname 0.0.0.0 \
  --port 8545 \
  --cors \
  --cors-allow-origin "*" \
  --cors-allow-methods "GET,POST,PUT,DELETE,OPTIONS" \
  --cors-allow-headers "DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization" \
  &

HARDHAT_PID=$!
echo "Hardhat network started with PID: $HARDHAT_PID"
echo "Network available at: http://localhost:8545"
echo "Chain ID: 31337"

# Keep the script running
wait $HARDHAT_PID

#!/bin/bash

# Hardhat Server Setup and Management Script
# This script sets up and manages the Hardhat development server on Ubuntu

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
HARDHAT_PORT=8545
PROXY_PORT=80

echo "🚀 Apollo DSKY Hardhat Server Setup"
echo "=================================="

# Function to check if a port is in use
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo "⚠️  Port $port is already in use"
        return 0
    else
        echo "✅ Port $port is available"
        return 1
    fi
}

# Function to kill process on port
kill_port() {
    local port=$1
    local pid=$(lsof -ti:$port)
    if [ ! -z "$pid" ]; then
        echo "🔪 Killing process on port $port (PID: $pid)"
        kill -9 $pid
        sleep 2
    fi
}

# Function to install dependencies
install_dependencies() {
    echo "📦 Installing Node.js dependencies..."
    cd "$SCRIPT_DIR"
    npm install
    echo "✅ Dependencies installed"
}

# Function to start Hardhat node
start_hardhat() {
    echo "🔧 Starting Hardhat node on port $HARDHAT_PORT..."
    cd "$SCRIPT_DIR"
    
    # Kill existing Hardhat process if running
    if check_port $HARDHAT_PORT; then
        kill_port $HARDHAT_PORT
    fi
    
    # Start Hardhat node in background
    nohup npx hardhat node --hostname 0.0.0.0 --port $HARDHAT_PORT > hardhat.log 2>&1 &
    echo $! > hardhat.pid
    
    # Wait for Hardhat to start
    echo "⏳ Waiting for Hardhat node to start..."
    sleep 5
    
    if check_port $HARDHAT_PORT; then
        echo "✅ Hardhat node started successfully on port $HARDHAT_PORT"
        echo "📋 Process ID: $(cat hardhat.pid)"
    else
        echo "❌ Failed to start Hardhat node"
        exit 1
    fi
}

# Function to start CORS proxy
start_proxy() {
    echo "🌐 Starting CORS proxy server on port $PROXY_PORT..."
    cd "$SCRIPT_DIR"
    
    # Kill existing proxy process if running
    if check_port $PROXY_PORT; then
        kill_port $PROXY_PORT
    fi
    
    # Start CORS proxy in background
    nohup node cors-server.js > proxy.log 2>&1 &
    echo $! > proxy.pid
    
    # Wait for proxy to start
    echo "⏳ Waiting for CORS proxy to start..."
    sleep 3
    
    if check_port $PROXY_PORT; then
        echo "✅ CORS proxy started successfully on port $PROXY_PORT"
        echo "📋 Process ID: $(cat proxy.pid)"
    else
        echo "❌ Failed to start CORS proxy"
        exit 1
    fi
}

# Function to stop services
stop_services() {
    echo "🛑 Stopping Hardhat services..."
    
    # Stop Hardhat node
    if [ -f hardhat.pid ]; then
        local hardhat_pid=$(cat hardhat.pid)
        if kill -0 $hardhat_pid 2>/dev/null; then
            echo "🔪 Stopping Hardhat node (PID: $hardhat_pid)"
            kill $hardhat_pid
            rm hardhat.pid
        fi
    fi
    
    # Stop CORS proxy
    if [ -f proxy.pid ]; then
        local proxy_pid=$(cat proxy.pid)
        if kill -0 $proxy_pid 2>/dev/null; then
            echo "🔪 Stopping CORS proxy (PID: $proxy_pid)"
            kill $proxy_pid
            rm proxy.pid
        fi
    fi
    
    # Kill any remaining processes on our ports
    kill_port $HARDHAT_PORT
    kill_port $PROXY_PORT
    
    echo "✅ Services stopped"
}

# Function to check service status
status() {
    echo "📊 Service Status"
    echo "================"
    
    # Check Hardhat node
    if check_port $HARDHAT_PORT; then
        if [ -f hardhat.pid ]; then
            echo "🟢 Hardhat node: RUNNING (PID: $(cat hardhat.pid))"
        else
            echo "🟡 Hardhat node: RUNNING (unknown PID)"
        fi
    else
        echo "🔴 Hardhat node: STOPPED"
    fi
    
    # Check CORS proxy
    if check_port $PROXY_PORT; then
        if [ -f proxy.pid ]; then
            echo "🟢 CORS proxy: RUNNING (PID: $(cat proxy.pid))"
        else
            echo "🟡 CORS proxy: RUNNING (unknown PID)"
        fi
    else
        echo "🔴 CORS proxy: STOPPED"
    fi
    
    # Test connectivity
    echo ""
    echo "🧪 Connectivity Tests"
    echo "===================="
    
    # Test Hardhat direct
    if curl -s -m 5 http://localhost:$HARDHAT_PORT -X POST -H "Content-Type: application/json" -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' > /dev/null; then
        echo "✅ Hardhat direct connection: OK"
    else
        echo "❌ Hardhat direct connection: FAILED"
    fi
    
    # Test proxy
    if curl -s -m 5 http://localhost:$PROXY_PORT/health > /dev/null; then
        echo "✅ CORS proxy health check: OK"
    else
        echo "❌ CORS proxy health check: FAILED"
    fi
}

# Function to show logs
logs() {
    local service=${1:-"all"}
    
    case $service in
        "hardhat")
            echo "📋 Hardhat Node Logs:"
            echo "===================="
            if [ -f hardhat.log ]; then
                tail -f hardhat.log
            else
                echo "No hardhat.log file found"
            fi
            ;;
        "proxy")
            echo "📋 CORS Proxy Logs:"
            echo "=================="
            if [ -f proxy.log ]; then
                tail -f proxy.log
            else
                echo "No proxy.log file found"
            fi
            ;;
        *)
            echo "📋 All Service Logs:"
            echo "=================="
            echo ""
            echo "Hardhat Node Logs (last 10 lines):"
            echo "-----------------------------------"
            if [ -f hardhat.log ]; then
                tail -10 hardhat.log
            else
                echo "No hardhat.log file found"
            fi
            echo ""
            echo "CORS Proxy Logs (last 10 lines):"
            echo "--------------------------------"
            if [ -f proxy.log ]; then
                tail -10 proxy.log
            else
                echo "No proxy.log file found"
            fi
            ;;
    esac
}

# Main command handling
case "${1:-start}" in
    "install")
        install_dependencies
        ;;
    "start")
        install_dependencies
        start_hardhat
        start_proxy
        status
        echo ""
        echo "🎉 Hardhat server is ready!"
        echo "🔗 JSON-RPC endpoint: https://hardhat.hartonomous.com"
        echo "🔗 Direct endpoint: http://hardhat.hartonomous.com:8545"
        echo "🔗 Health check: https://hardhat.hartonomous.com/health"
        ;;
    "stop")
        stop_services
        ;;
    "restart")
        stop_services
        sleep 2
        install_dependencies
        start_hardhat
        start_proxy
        status
        ;;
    "status")
        status
        ;;
    "logs")
        logs "${2:-all}"
        ;;
    "test")
        echo "🧪 Testing Hardhat server connectivity..."
        curl -s -X POST http://localhost:$HARDHAT_PORT \
             -H "Content-Type: application/json" \
             -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' | jq .
        echo ""
        echo "🧪 Testing CORS proxy..."
        curl -s http://localhost:$PROXY_PORT/health | jq .
        ;;
    *)
        echo "Usage: $0 {install|start|stop|restart|status|logs|test}"
        echo ""
        echo "Commands:"
        echo "  install  - Install Node.js dependencies"
        echo "  start    - Start Hardhat node and CORS proxy"
        echo "  stop     - Stop all services"
        echo "  restart  - Restart all services"
        echo "  status   - Show service status"
        echo "  logs     - Show logs (optional: hardhat|proxy)"
        echo "  test     - Test connectivity"
        exit 1
        ;;
esac

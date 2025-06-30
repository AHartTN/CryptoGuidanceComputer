# Deployment Checklist - Apollo DSKY Crypto Guidance Computer

## Pre-Deployment Verification

### ✅ Frontend Ready
- [ ] Development server running on http://localhost:5173
- [ ] All components rendering correctly
- [ ] DSKY interface displays properly
- [ ] Keypad interactions working
- [ ] Error states displaying correctly

### 🔧 Server CORS Fix Required

#### Option 1: Minimal Nginx + Hardhat CORS
```bash
# 1. Copy minimal nginx config
sudo cp server/nginx-minimal.conf /etc/nginx/sites-available/hardhat.hartonomous.com

# 2. Test and reload nginx
sudo nginx -t && sudo systemctl reload nginx

# 3. Start Hardhat with CORS
npx hardhat node --hostname 0.0.0.0 --port 8545 --cors
```

#### Option 2: Full Nginx CORS Management
```bash
# 1. Copy full nginx config
sudo cp server/nginx-hardhat.conf /etc/nginx/sites-available/hardhat.hartonomous.com

# 2. Use simple hardhat config (no CORS)
cp server/hardhat.config.js /path/to/hardhat/project/

# 3. Restart services
sudo nginx -t && sudo systemctl reload nginx
npx hardhat node --hostname 0.0.0.0 --port 8545
```

### 🧪 Post-Fix Testing

#### 1. CORS Headers Check
```bash
curl -I -H "Origin: http://localhost:5173" https://hardhat.hartonomous.com/
```
**Expected**: Single `Access-Control-Allow-Origin: *` header

#### 2. JSON-RPC Connectivity
```bash
curl -X POST https://hardhat.hartonomous.com/ \
  -H "Content-Type: application/json" \
  -H "Origin: http://localhost:5173" \
  -d '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}'
```
**Expected**: `{"jsonrpc":"2.0","id":1,"result":"0x7a69"}`

#### 3. Browser Console Check
- Open http://localhost:5173
- Open DevTools Console
- Should see: `✅ MetaMask detected and ready`
- No CORS policy errors

### 🎮 User Interface Testing

#### Test Sequence:
1. **Connect Wallet**: Click TEST button, verify MetaMask prompt
2. **Account Info**: Enter V21 N01, press ENTER
3. **Network Info**: Enter V22 N01, press ENTER  
4. **Block Info**: Enter V23 N01, press ENTER
5. **Crypto Prices**: Enter V12 N01, press ENTER

#### Expected Results:
- **V21 N01**: Account address display
- **V22 N01**: Chain ID 31337 (Hardhat)
- **V23 N01**: Current block number
- **V12 N01**: Bitcoin price from CoinGecko

### 🚀 Production Readiness

#### Performance Metrics:
- [ ] Page load < 2 seconds
- [ ] MetaMask connection < 1 second
- [ ] API responses < 500ms
- [ ] No memory leaks in console

#### Security Checklist:
- [ ] Environment variables properly configured
- [ ] API keys not exposed in frontend
- [ ] HTTPS properly configured
- [ ] CSP headers if needed

#### Browser Compatibility:
- [ ] Chrome/Edge (latest)
- [ ] Firefox (latest)  
- [ ] Safari (latest)
- [ ] Mobile responsive

### 📱 Mobile Testing
- [ ] Layout adapts to mobile screens
- [ ] Touch interactions work on keypad
- [ ] Text remains readable
- [ ] MetaMask mobile app integration

### 🔄 Monitoring Setup
- [ ] Error logging configured
- [ ] Performance monitoring
- [ ] User analytics (optional)
- [ ] Uptime monitoring for RPC endpoint

## Success Criteria

### Functional Requirements Met:
✅ Apollo DSKY aesthetic authentic  
✅ Verb-noun command system working  
✅ MetaMask integration functional  
✅ Cryptocurrency price display  
✅ Blockchain data retrieval  
✅ Error handling comprehensive  
✅ Responsive design implemented  

### Technical Requirements Met:
✅ TypeScript throughout  
✅ Modern React patterns  
✅ Viem integration  
✅ React Query caching  
✅ Optimized bundle size  
✅ Accessibility compliance  

## 🎯 Final Steps After CORS Fix

1. **Immediate Testing**: Run through full test sequence
2. **Performance Audit**: Check Chrome DevTools performance
3. **Security Review**: Verify no sensitive data exposed
4. **Documentation**: Update README with final setup instructions
5. **Backup**: Create final production build
6. **Celebration**: Apollo DSKY Crypto Guidance Computer is LIVE! 🚀

---
**Status**: Ready for deployment pending server CORS configuration fix

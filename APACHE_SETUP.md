# Apache 2 Proxy Setup Guide for Your Theater App

## 🎯 Overview

Your Node.js/Next.js app runs on `localhost:3000`, but you want it accessible on your domain `portal.northem.no`. Apache 2 will act as a **reverse proxy** — it forwards requests from your domain to the local Node.js server.

---

## 📋 Step-by-Step Setup

### Step 1: Enable Required Apache Modules

SSH into your Ubuntu server and run:

```bash
sudo a2enmod proxy
sudo a2enmod proxy_http
sudo a2enmod rewrite
sudo a2enmod headers
```

### Step 2: Create Virtual Host Configuration

Copy the Apache config file to your server's sites directory:

```bash
# Option A: If you're using the config file from the project
scp apache-config.conf user@your-server-ip:/tmp/
ssh user@your-server-ip
sudo cp /tmp/apache-config.conf /etc/apache2/sites-available/portal.northem.no.conf

# Option B: Create it directly on the server
sudo nano /etc/apache2/sites-available/portal.northem.no.conf
# Then paste the contents from apache-config.conf
```

### Step 3: Enable the Site

```bash
sudo a2ensite portal.northem.no.conf
```

### Step 4: Test Apache Configuration

```bash
sudo apache2ctl configtest
```

Expected output:
```
Syntax OK
```

### Step 5: Reload Apache

```bash
sudo systemctl reload apache2
```

### Step 6: Ensure Node.js App is Running

On your Ubuntu server, make sure the Next.js app is running on port 3000:

```bash
cd /path/to/your/app
npm run build
npm start
```

Or run it in the background with `nohup`:

```bash
nohup npm start > app.log 2>&1 &
```

### Step 7: Verify It Works

```bash
# From the server
curl http://localhost:3000

# From your local machine
curl http://portal.northem.no
```

---

## 🔒 HTTPS Setup (Highly Recommended for Production)

### Install Certbot

```bash
sudo apt-get update
sudo apt-get install certbot python3-certbot-apache
```

### Generate SSL Certificate

```bash
sudo certbot --apache -d portal.northem.no
```

Certbot will automatically:
- Generate an SSL certificate
- Update your Apache config
- Set up auto-renewal

After this, your site will be accessible over HTTPS.

---

## 📝 What the Config Does

```apache
ProxyPreserveHost On              # Forwards original host header
ProxyPass / http://localhost:3000/        # Routes requests to Node.js app
ProxyPassReverse / http://localhost:3000/ # Rewrites response URLs
```

This setup:
- ✅ Routes `portal.northem.no` → `localhost:3000`
- ✅ Supports WebSocket connections
- ✅ Preserves original request headers
- ✅ Adds security headers (X-Frame-Options, etc.)
- ✅ Logs all requests

---

## 🧪 Troubleshooting

### "Connection refused" or 502 Bad Gateway

**Problem**: Apache can't reach the Node.js app on localhost:3000

**Solution**:
```bash
# Check if app is running
curl http://localhost:3000

# Check what's listening on port 3000
netstat -tlnp | grep 3000
# or
lsof -i :3000

# If not running, start it
cd /path/to/your/app
npm start
```

### "Proxy module not enabled"

**Problem**: Apache proxy modules aren't enabled

**Solution**:
```bash
sudo a2enmod proxy
sudo a2enmod proxy_http
sudo systemctl reload apache2
```

### "Site already exists" error

**Problem**: Another config is using the same domain

**Solution**:
```bash
# Disable the old site
sudo a2dissite old-site-name.conf

# Check which sites are enabled
sudo ls /etc/apache2/sites-enabled/

# Disable if needed
sudo a2dissite portal.northem.no.conf
sudo a2ensite portal.northem.no.conf
sudo systemctl reload apache2
```

### DNS not pointing to server

**Problem**: Domain doesn't resolve to your server IP

**Solution**:
1. Go to your domain registrar (GoDaddy, Namecheap, etc.)
2. Update DNS A record to point to your server's IP address
3. Wait 15-30 minutes for DNS to propagate
4. Test: `nslookup portal.northem.no`

---

## 🚀 Complete Deployment Workflow

### On Your Local Machine

```bash
npm run dist
# Creates dist/ folder with production-ready app
```

### Transfer to Server

```bash
scp -r dist/ user@your-server-ip:/tmp/
```

### On Server

```bash
# Stop old app if running
pkill -f "npm start"

# Move new app
rm -rf /opt/teateret-app
mv /tmp/dist /opt/teateret-app
cd /opt/teateret-app

# Install production dependencies
npm ci --production

# Start the app
npm start
# Or in background:
# nohup npm start > app.log 2>&1 &
```

### Verify

```bash
# Check app is running
curl http://localhost:3000

# Check Apache proxy works
curl http://portal.northem.no
```

---

## 📊 Architecture

```
User Browser
    ↓ (HTTPS request to portal.northem.no)
Apache 2 (port 80/443)
    ↓ (proxies to localhost:3000)
Node.js/Next.js Server (localhost:3000)
    ↓ (renders pages, API responses)
Response back through Apache to user
```

---

## 🔄 Keep App Running (Systemd Service)

Create a service file so your app starts automatically:

```bash
sudo nano /etc/systemd/system/teateret.service
```

Paste:

```ini
[Unit]
Description=Teateret Portal App
After=network.target

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/opt/teateret-app
ExecStart=/usr/bin/npm start
Restart=always
RestartSec=10
StandardOutput=append:/var/log/teateret.log
StandardError=append:/var/log/teateret.log

[Install]
WantedBy=multi-user.target
```

Enable and start:

```bash
sudo systemctl daemon-reload
sudo systemctl enable teateret.service
sudo systemctl start teateret.service

# Check status
sudo systemctl status teateret.service

# View logs
sudo journalctl -u teateret.service -f
```

---

## 📞 Quick Diagnostics

```bash
# Is Apache running?
sudo systemctl status apache2

# Is Node.js running?
curl http://localhost:3000

# Is DNS correct?
nslookup portal.northem.no

# Check Apache error log
sudo tail -f /var/log/apache2/error.log

# Check app log
tail -f /var/log/teateret.log
```

---

## ✅ Checklist

- [ ] Apache modules enabled (proxy, proxy_http, rewrite)
- [ ] Virtual host config created in `/etc/apache2/sites-available/`
- [ ] Site enabled with `a2ensite`
- [ ] Apache config tested with `configtest`
- [ ] Apache reloaded
- [ ] DNS updated to point to server IP
- [ ] Node.js app running on localhost:3000
- [ ] Can access app via `curl http://localhost:3000`
- [ ] Can access via domain: `curl http://portal.northem.no`
- [ ] SSL certificate installed (optional but recommended)

---

*Generated: 2024-12-05 for Theater App Deployment*

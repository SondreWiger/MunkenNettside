# Nginx Configuration & Deployment Guide

## ✅ Configuration Created

Your nginx configuration has been created at `/nginx.conf`

## 📋 Setup Instructions

### 1. **On Your Server (Linux/Ubuntu)**

Copy the nginx config to your server's nginx sites directory:

```bash
sudo cp nginx.conf /etc/nginx/sites-available/portal.northem.no
sudo ln -s /etc/nginx/sites-available/portal.northem.no /etc/nginx/sites-enabled/
```

### 2. **Test Nginx Configuration**

```bash
sudo nginx -t
```

Expected output:
```
nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
nginx: configuration will be running successfully
```

### 3. **Reload Nginx**

```bash
sudo systemctl reload nginx
```

### 4. **Update DNS**

Make sure your domain `portal.northem.no` points to your server's IP address via your DNS provider.

### 5. **Start Your Application**

On the server, make sure the Next.js app is running:

```bash
npm run build
npm start
```

This will start the server on `http://localhost:3000`, which nginx will proxy to `http://portal.northem.no`

---

## 🔒 HTTPS Setup (Recommended)

For production, you should use HTTPS with SSL certificates from Let's Encrypt:

### Install Certbot

```bash
sudo apt-get install certbot python3-certbot-nginx
```

### Generate SSL Certificate

```bash
sudo certbot --nginx -d portal.northem.no
```

This will automatically update your nginx config to use HTTPS.

---

## 📊 Configuration Explanation

```nginx
server {
    listen 80;                          # Listen on port 80 (HTTP)
    server_name portal.northem.no;      # Your domain

    location / {
        proxy_pass http://localhost:3000;           # Forward to Next.js app
        proxy_http_version 1.1;                     # Use HTTP/1.1
        proxy_set_header Upgrade $http_upgrade;     # Support WebSocket upgrades
        proxy_set_header Connection 'upgrade';      # Keep connection alive
        proxy_set_header Host $host;                # Forward original host
        proxy_cache_bypass $http_upgrade;           # Don't cache upgrades
    }
}
```

---

## ⚙️ Application Settings

Your Next.js application is configured to:

1. **Listen on all interfaces**: `0.0.0.0:3000`
   - This allows nginx to reach it locally
   - Camera access is enabled on secure contexts

2. **Custom server**: Uses `server.js` instead of built-in Next.js server
   - Provides better control over network binding

3. **Environment variables**: Set these on your server:
   ```bash
   export NODE_ENV=production
   export PORT=3000
   export HOST=0.0.0.0
   ```

---

## 🧪 Testing

### From Your Local Machine

Test the nginx configuration locally before deploying:

```bash
# Check nginx syntax
sudo nginx -t

# Check if app is running on localhost:3000
curl http://localhost:3000

# Check nginx is proxying correctly
curl http://localhost/ -H "Host: portal.northem.no"
```

### From Server

```bash
# Check if app is accessible
curl http://localhost:3000

# Check if nginx is running
sudo systemctl status nginx

# View nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

---

## 🚀 Production Deployment Checklist

- [ ] DNS updated to point to server IP
- [ ] Nginx installed and configured
- [ ] SSL certificate installed (HTTPS)
- [ ] Next.js app running with `npm start`
- [ ] Environment variables set (`NODE_ENV=production`)
- [ ] Nginx logs monitored
- [ ] Application logs monitored
- [ ] Database backups configured
- [ ] Monitoring/alerting set up

---

## 📝 Files in Your Project

- **`server.js`** - Custom Node.js server for Next.js
- **`nginx.conf`** - Nginx reverse proxy configuration
- **`package.json`** - Updated with `"start": "node server.js"`
- **`next.config.mjs`** - Next.js configuration

---

## 🔄 Workflow

```
User Browser
    ↓ (HTTP request to portal.northem.no)
Nginx (reverse proxy on port 80/443)
    ↓ (proxies to localhost:3000)
Next.js Server (listening on 0.0.0.0:3000)
    ↓ (renders pages)
Response back to user
```

---

## 🆘 Troubleshooting

### "Connection refused" errors

1. Check if app is running: `curl http://localhost:3000`
2. Check if nginx is running: `sudo systemctl status nginx`
3. Check logs: `sudo tail -f /var/log/nginx/error.log`

### "Bad Gateway" (502) errors

1. Verify app is listening: `netstat -tlnp | grep 3000`
2. Check firewall isn't blocking: `sudo ufw status`
3. Check nginx error logs

### Camera not working on domain

1. Make sure you're using HTTPS (Let's Encrypt)
2. Camera requires secure context (HTTPS or localhost)
3. Check browser console for security warnings

### SSL Certificate Errors

```bash
# Renew certificate
sudo certbot renew

# Force renewal
sudo certbot renew --force-renewal
```

---

## 📞 Support

For issues, check:
- Nginx error log: `/var/log/nginx/error.log`
- Application logs: `console.log()` output when running with `npm start`
- Browser console: DevTools → Console tab

---

*Configuration Generated: 2024-12-05*

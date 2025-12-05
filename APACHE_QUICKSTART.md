# 🚀 Quick Apache Setup (TL;DR)

Your Ubuntu server has Apache 2 but the app only works on localhost. This fixes it in 5 minutes.

## The Problem
```
You have:  portal.northem.no → Apache 2 (port 80)
You want:  portal.northem.no → Your Node.js app (localhost:3000)
```

## ⚠️ No Sudo Permissions?

If you don't have `sudo` access, see **`NO_SUDO_SOLUTIONS.md`** for workarounds:
- Run Node.js on port 80 directly
- Use Cloudflare Tunnel (easiest workaround)
- Contact hosting provider to enable proxy

---

## The Solution: Apache Reverse Proxy (With Sudo)

### 1️⃣ Enable proxy modules (SSH to server)

```bash
sudo a2enmod proxy
sudo a2enmod proxy_http
sudo a2enmod rewrite
sudo systemctl reload apache2
```

### 2️⃣ Create config file

```bash
sudo nano /etc/apache2/sites-available/portal.northem.no.conf
```

Paste this:

```apache
<VirtualHost *:80>
    ServerName portal.northem.no
    ProxyPreserveHost On
    ProxyPass / http://localhost:3000/
    ProxyPassReverse / http://localhost:3000/
    ErrorLog ${APACHE_LOG_DIR}/portal.northem.no-error.log
    CustomLog ${APACHE_LOG_DIR}/portal.northem.no-access.log combined
</VirtualHost>
```

### 3️⃣ Enable the site

```bash
sudo a2ensite portal.northem.no.conf
sudo apache2ctl configtest  # Should say "Syntax OK"
sudo systemctl reload apache2
```

### 4️⃣ Make sure your Node.js app is running

```bash
cd /path/to/your/app
npm run build
npm start
```

### 5️⃣ Test it

```bash
curl http://portal.northem.no
```

## Done! ✅

Your site now works on your domain instead of just localhost.

---

## Optional: HTTPS Setup (Recommended)

```bash
sudo apt-get install certbot python3-certbot-apache
sudo certbot --apache -d portal.northem.no
```

Certbot automatically updates your Apache config for HTTPS.

---

## Troubleshooting

| Problem | Check |
|---------|-------|
| `502 Bad Gateway` | `curl http://localhost:3000` — is the app running? |
| `Connection refused` | `netstat -tlnp \| grep 3000` — check port 3000 |
| Domain doesn't load | `nslookup portal.northem.no` — DNS correct? |
| Proxy not working | `sudo a2enmod proxy proxy_http` — modules enabled? |

---

See `APACHE_SETUP.md` for detailed setup and troubleshooting guide.

# 🌐 Cloudflare Tunnel Setup (No Permissions Needed)

Since you can't access port 80, **Cloudflare Tunnel** is your solution. It exposes your localhost app to the internet instantly without any server permissions.

## How It Works

```
Your App (localhost:3000)
    ↓ (Cloudflare Tunnel)
Cloudflare Network
    ↓
Your Domain (portal.northem.no)
    ↓
Users access it
```

---

## ✅ Step-by-Step Setup

### Step 1: Install Cloudflared

On your Ubuntu server:

```bash
wget https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64
chmod +x cloudflared-linux-amd64
sudo mv cloudflared-linux-amd64 /usr/local/bin/cloudflared
```

Or if you can't use sudo:
```bash
wget https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64
chmod +x cloudflared-linux-amd64
# Just use it from current directory: ./cloudflared-linux-amd64
```

### Step 2: Start Your App

```bash
cd /path/to/your/app
npm run build
npm start
```

This runs on localhost:3000 (no port 80 needed).

### Step 3: Start Cloudflare Tunnel (in another terminal)

```bash
cloudflared tunnel --url http://localhost:3000
```

You'll see output like:
```
2024-12-05T18:30:00Z INF Starting Cloudflare Tunnel
2024-12-05T18:30:01Z INF Registered tunnel connection connID=0
2024-12-05T18:30:01Z INF Your quick tunnel has been created! Visit it at (max 24 hrs):
https://random-subdomain-12345.trycloudflare.com
```

### Step 4: Test It

```bash
curl https://random-subdomain-12345.trycloudflare.com
```

If you see your app's HTML → It works!

---

## 🎯 Use Your Own Domain (portal.northem.no)

To use your actual domain instead of the temporary URL:

### Option A: Cloudflare Free Tier (Easiest)

1. **Go to Cloudflare**: https://dash.cloudflare.com/
2. **Sign up** (free account)
3. **Add your domain** (`portal.northem.no`)
4. **Update DNS** at your registrar to point to Cloudflare nameservers
5. **In Cloudflare dashboard**:
   - Go to DNS settings
   - Add `CNAME` record: `portal.northem.no` → the tunnel URL from step 3
   - OR better: Use Cloudflare Tunnel's persistent tunnel feature (see below)

### Option B: Persistent Cloudflare Tunnel (Recommended)

Instead of temporary URLs, create a permanent tunnel:

```bash
# Authenticate with Cloudflare
cloudflared tunnel login

# Create a tunnel
cloudflared tunnel create my-teateret-app

# Run it
cloudflared tunnel run my-teateret-app --url http://localhost:3000

# In Cloudflare dashboard, add DNS record pointing to the tunnel
```

---

## 🚀 Keep It Running (Background)

### Using `nohup`:

```bash
nohup npm start > app.log 2>&1 &
nohup cloudflared tunnel --url http://localhost:3000 > tunnel.log 2>&1 &
```

### Using `screen`:

```bash
# Terminal 1: App
screen -S app
npm run build && npm start

# Ctrl+A then D to detach

# Terminal 2: Tunnel
screen -S tunnel
cloudflared tunnel --url http://localhost:3000

# Ctrl+A then D to detach

# Later, reattach:
screen -r app
screen -r tunnel
```

### Using `tmux`:

```bash
tmux new-session -d -s app "cd /path/to/app && npm start"
tmux new-session -d -s tunnel "cloudflared tunnel --url http://localhost:3000"
```

---

## ✨ Why This Works Better Than Apache Proxy

| Feature | Apache Proxy | Cloudflare Tunnel |
|---------|--------------|-------------------|
| Permissions needed | ✅ Need sudo | ❌ None |
| HTTPS | ❌ Need Let's Encrypt | ✅ Auto HTTPS |
| Setup time | 10 minutes | 2 minutes |
| Camera access | ✅ Works | ✅ Works (HTTPS) |
| Cost | Free | Free (generous limits) |
| Domain mapping | Need Apache config | Easy in dashboard |
| Uptime | Depends on server | 99.9% Cloudflare SLA |

---

## 🔒 Security Notes

- Cloudflare Tunnel is secure (encrypted tunnel to Cloudflare)
- Your localhost never exposed to internet directly
- Free tier is sufficient for most use cases
- If paranoid: Use paid Cloudflare tunnel (still cheap, ~$20/month)

---

## 📊 What You'll Have

```
✅ App running on localhost:3000
✅ Tunnel to Cloudflare
✅ Domain portal.northem.no accessible worldwide
✅ HTTPS automatic
✅ Camera works on all devices
✅ No Apache config needed
✅ No permissions needed
```

---

## Quick Test Right Now

```bash
# Terminal 1: Start your app
cd /path/to/your/app
npm start

# Terminal 2: Start tunnel
cloudflared tunnel --url http://localhost:3000

# Terminal 3: Test
curl https://random-subdomain-12345.trycloudflare.com
```

If that works → your app is accessible from anywhere!

Then set up the permanent domain mapping in Cloudflare dashboard.

---

## 🆘 Troubleshooting

### "command not found: cloudflared"
```bash
# Make sure it's installed
which cloudflared

# Or use the full path
/usr/local/bin/cloudflared tunnel --url http://localhost:3000
```

### App doesn't load
```bash
# Check app is running
curl http://localhost:3000

# Check tunnel is connected
# Look for "Registered tunnel connection" in tunnel logs
```

### Domain still shows old site
```bash
# DNS might be cached
# Wait 5-10 minutes for propagation
# Or clear browser cache
# Or use incognito mode to test
```

---

## Next Steps

1. **Install cloudflared**
2. **Start your app**: `npm start`
3. **Start tunnel**: `cloudflared tunnel --url http://localhost:3000`
4. **Test the temp URL** it gives you
5. **Add your domain** in Cloudflare dashboard
6. **Update DNS** if needed
7. **Access via portal.northem.no**

Ready to try it?

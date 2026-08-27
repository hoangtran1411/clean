# Module 04: Cloud Hosting & VPS Production Deployment

Deploying your application requires choosing the right balance between **cost, control, operational complexity, and scalability**. This guide explores standard hosting models and provides a step-by-step hardened setup for an **Ubuntu 24.04 LTS VPS**.

---

## 📊 1. Hosting Architecture Comparison

| Model | Examples | Best For | Pros | Cons |
| :--- | :--- | :--- | :--- | :--- |
| **IaaS (VPS / Virtual Server)** | Hetzner, DigitalOcean, Linode, AWS EC2 | Startups, side projects, cost-sensitive apps ($5-$20/mo) | Complete control, lowest cost, predictable billing | Requires manual OS updates, security hardening, and backups |
| **PaaS (Platform as a Service)** | Azure App Service, Render, Railway, Heroku | Fast-moving teams without dedicated DevOps | Zero server maintenance, automated SSL & CI/CD | Higher cost per GB of RAM, platform lock-in |
| **Serverless Containers** | Azure Container Apps, AWS Fargate, Google Cloud Run | Microservices, bursty workloads, .NET Aspire | Scales to zero, automated container scaling, pay-per-second | Cold starts on zero-scale, complex local simulation |

---

## 🛠️ 2. Hardening an Ubuntu 24.04 LTS VPS for Production

### Step 1: Create a Dedicated Deployment User (Non-Root)

```bash
# Connect as root
ssh root@YOUR_SERVER_IP

# Create user 'deployer'
adduser deployer
usermod -aG sudo deployer

# Copy authorized SSH keys from root to deployer
mkdir -p /home/deployer/.ssh
cp ~/.ssh/authorized_keys /home/deployer/.ssh/
chown -R deployer:deployer /home/deployer/.ssh
chmod 700 /home/deployer/.ssh
chmod 600 /home/deployer/.ssh/authorized_keys
```

### Step 2: Disable Root & Password Authentication

Edit `/etc/ssh/sshd_config.d/50-cloud-init.conf` or `/etc/ssh/sshd_config`:

```ini
PermitRootLogin no
PasswordAuthentication no
PubkeyAuthentication yes
```

Restart SSH daemon:

```bash
sudo systemctl restart ssh
```

### Step 3: Configure UFW (Uncomplicated Firewall)

```bash
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable
```

### Step 4: Install Fail2Ban (Brute-Force Protection)

```bash
sudo apt update && sudo apt install -y fail2ban
sudo systemctl enable --now fail2ban
```

---

## 🐳 3. Installing Official Docker Engine & Compose Plugin

```bash
# 1. Set up Docker apt repository
sudo apt update
sudo apt install -y ca-certificates curl gnupg
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# 2. Install Docker & Plugins
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# 3. Allow 'deployer' to run docker without sudo
sudo usermod -aG docker deployer
```

---

## 📝 4. Preventing Disk Full Errors: Docker Log Rotation

By default, Docker container logs write indefinitely until the host disk runs out of space. Fix this globally in `/etc/docker/daemon.json`:

```json
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "20m",
    "max-file": "3"
  }
}
```

Apply configuration:

```bash
sudo systemctl restart docker
```

---

## 🔄 5. Managing the App with Systemd Service

To guarantee your Docker Compose stack boots automatically on server restarts:

Create `/etc/systemd/system/cleanarch.service`:

```ini
[Unit]
Description=Clean Architecture .NET 10 Docker Compose Stack
Requires=docker.service
After=docker.service network-online.target

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/opt/cleanarch
User=deployer
Group=docker
ExecStart=/usr/bin/docker compose up -d --remove-orphans
ExecStop=/usr/bin/docker compose down
ExecReload=/usr/bin/docker compose pull && /usr/bin/docker compose up -d

[Install]
WantedBy=multi-user.target
```

Enable and start the service:

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now cleanarch.service
```

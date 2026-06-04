# 阿里云 ECS 部署指南

本文档将个人博客项目部署到阿里云 ECS，完整覆盖从购买服务器到上线运行的全部步骤。

## 部署架构

```
用户浏览器
    │
    ▼
  Nginx (:80/:443)
    ├── /api/*          →  Uvicorn (127.0.0.1:8000)  →  MariaDB
    ├── /docs           →  Uvicorn
    ├── /redoc          →  Uvicorn
    └── /*              →  Next.js (127.0.0.1:3000)
```

| 组件 | 说明 |
|------|------|
| Nginx | 反向代理 + SSL 终止 + 静态缓存 |
| Uvicorn | Python ASGI 服务器，systemd 管理 |
| Next.js | 前端 Node.js 服务，systemd 管理 |
| MariaDB | 本地数据库 |
| Certbot | Let's Encrypt SSL 证书自动续期 |

---

## 1. 创建 ECS 实例

1. 登录 [阿里云 ECS 控制台](https://ecs.console.aliyun.com/)
2. 创建实例，推荐配置：

| 项目 | 建议 |
|------|------|
| 地域 | 选择离你最近的 |
| 镜像 | Ubuntu 24.04 LTS |
| 规格 | 2 vCPU / 2 GiB 内存（最低） |
| 系统盘 | 40 GiB ESSD |
| 网络 | 分配公网 IPv4 |

3. 安全组规则（入方向）：

| 端口 | 协议 | 来源 |
|------|------|------|
| 22 | TCP | 你的 IP（SSH） |
| 80 | TCP | 0.0.0.0/0（HTTP） |
| 443 | TCP | 0.0.0.0/0（HTTPS） |

4. 创建后 SSH 登录服务器：

```bash
ssh root@<你的服务器公网IP>
```

---

## 2. 安装基础环境

### 2.1 更新系统

```bash
apt update && apt upgrade -y
```

### 2.2 安装 MariaDB

```bash
apt install -y mariadb-server
systemctl enable mariadb --now

# 初始化数据库安全配置
mysql_secure_installation
# - 设置 root 密码
# - Remove anonymous users? → Y
# - Disallow root login remotely? → Y
# - Remove test database? → Y
# - Reload privilege tables? → Y
```

创建数据库和用户：

```sql
mysql -u root -p

CREATE DATABASE blog CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'blog'@'localhost' IDENTIFIED BY '<你的数据库密码>';
GRANT ALL PRIVILEGES ON blog.* TO 'blog'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### 2.3 安装 Python

```bash
apt install -y python3 python3-pip python3-venv
```

### 2.4 安装 Node.js

```bash
# 使用 NodeSource 安装 Node.js 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs
node -v  # 确认版本
```

### 2.5 安装 Nginx

```bash
apt install -y nginx
systemctl enable nginx --now
```

### 2.6 安装 Certbot

```bash
apt install -y certbot python3-certbot-nginx
```

---

## 3. 部署后端（FastAPI）

### 3.1 创建部署用户和目录

```bash
useradd -m -s /bin/bash blog
mkdir -p /opt/blog
```

### 3.2 上传代码

在本地机器上：

```bash
# 将代码上传到服务器（在本地项目根目录执行）
rsync -avz --exclude '.venv' --exclude 'node_modules' --exclude '.git' \
    ./blog/ root@<服务器IP>:/opt/blog/backend/
```

### 3.3 配置环境变量

在服务器上：

```bash
cp /opt/blog/backend/.env.example /opt/blog/backend/.env
```

编辑 `/opt/blog/backend/.env`：

```env
DATABASE_URL=mysql+pymysql://blog:<数据库密码>@127.0.0.1:3306/blog?charset=utf8
JWT_SECRET_KEY=<生成一个随机密钥>
CORS_ORIGINS=["https://你的域名", "http://localhost:3000"]
ENV=prod
```

生成随机密钥：

```bash
python3 -c "import secrets; print(secrets.token_urlsafe(32))"
```

### 3.4 安装依赖

```bash
cd /opt/blog/backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

### 3.5 数据库迁移 + 创建管理员

```bash
source .venv/bin/activate
alembic upgrade head
python -m app.cli create-user <用户名> <邮箱> <密码>
```

### 3.6 配置 systemd 服务

创建 `/etc/systemd/system/blog-api.service`：

```ini
[Unit]
Description=Blog API (Uvicorn)
After=network.target mariadb.service
Wants=mariadb.service

[Service]
User=blog
Group=blog
WorkingDirectory=/opt/blog/backend
Environment=PATH=/opt/blog/backend/.venv/bin
ExecStart=/opt/blog/backend/.venv/bin/uvicorn app.main:app \
    --host 127.0.0.1 --port 8000 \
    --workers 4 \
    --log-level info
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

启动服务：

```bash
systemctl daemon-reload
systemctl enable blog-api --now
systemctl status blog-api  # 确认运行正常
```

---

## 4. 部署前端（Next.js）

### 4.1 上传前端代码

在本地机器上：

```bash
rsync -avz --exclude 'node_modules' --exclude '.next' --exclude '.git' \
    ./blog-frontend/ root@<服务器IP>:/opt/blog/frontend/
```

### 4.2 构建前端

```bash
cd /opt/blog/frontend
npm install
npm run build
```

### 4.3 配置 systemd 服务

创建 `/etc/systemd/system/blog-frontend.service`：

```ini
[Unit]
Description=Blog Frontend (Next.js)
After=network.target

[Service]
User=blog
Group=blog
WorkingDirectory=/opt/blog/frontend
Environment=NODE_ENV=production
Environment=NEXT_PUBLIC_API_URL=/api
Environment=PORT=3000
ExecStart=/usr/bin/node /opt/blog/frontend/node_modules/.bin/next start \
    -p 3000
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

> **关键**：`NEXT_PUBLIC_API_URL=/api` 让浏览器通过 Nginx 反向代理访问 API，避免跨域问题。

启动服务：

```bash
systemctl daemon-reload
systemctl enable blog-frontend --now
systemctl status blog-frontend
```

---

## 5. 配置 Nginx

编辑 `/etc/nginx/sites-available/blog`：

```nginx
# 提供客户端真实 IP 的限速配置
limit_req_zone $binary_remote_addr zone=api:10m rate=30r/m;
limit_req_zone $binary_remote_addr zone=login:10m rate=5r/m;

server {
    listen 80;
    server_name 你的域名;

    # 客户端最大上传体积
    client_max_body_size 10M;

    # ========== API 反向代理 ==========
    location /api/ {
        # 登录接口限速（防暴力破解）
        location /api/auth/login {
            limit_req zone=login burst=3 nodelay;
            proxy_pass http://127.0.0.1:8000;
        }

        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 60s;
    }

    # 自动生成的 API 文档
    location /docs {
        proxy_pass http://127.0.0.1:8000/docs;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /redoc {
        proxy_pass http://127.0.0.1:8000/redoc;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /openapi.json {
        proxy_pass http://127.0.0.1:8000/openapi.json;
        proxy_set_header Host $host;
    }

    # ========== 前端 ==========
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # 安全头
    add_header X-Content-Type-Options nosniff;
    add_header X-Frame-Options DENY;
    add_header X-XSS-Protection "1; mode=block";
}
```

启用站点：

```bash
ln -sf /etc/nginx/sites-available/blog /etc/nginx/sites-enabled/blog
rm -f /etc/nginx/sites-enabled/default   # 删除默认站点
nginx -t                                   # 测试配置
systemctl reload nginx
```

---

## 6. 配置 HTTPS（Let's Encrypt）

```bash
# --nginx 会自动读取 Nginx 配置并处理证书安装
certbot --nginx -d 你的域名

# 测试自动续期
certbot renew --dry-run
```

Certbot 会自动添加 cron/systemd timer 处理续期。确认：

```bash
systemctl status certbot.timer
```

---

## 7. 配置数据库备份

创建备份脚本 `/opt/scripts/backup-db.sh`：

```bash
#!/bin/bash
BACKUP_DIR="/opt/backups/db"
DB_USER="blog"
DB_NAME="blog"
DB_PASSWORD="你的数据库密码"
RETENTION_DAYS=30

mkdir -p "$BACKUP_DIR"

FILENAME="${DB_NAME}_$(date +%Y%m%d_%H%M%S).sql.gz"
mysqldump -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" | gzip > "$BACKUP_DIR/$FILENAME"

# 删除 30 天前的备份
find "$BACKUP_DIR" -name "${DB_NAME}_*.sql.gz" -mtime +$RETENTION_DAYS -delete

echo "$(date): Backup completed - $FILENAME" >> /var/log/db-backup.log
```

```bash
chmod +x /opt/scripts/backup-db.sh
```

添加 cron（每天凌晨 2 点备份）：

```bash
(crontab -l 2>/dev/null; echo "0 2 * * * /opt/scripts/backup-db.sh") | crontab -
```

---

## 8. 验证部署

```bash
# 检查所有服务
systemctl status nginx mariadb blog-api blog-frontend

# 测试 API
curl http://localhost/api/posts

# 检查日志
journalctl -u blog-api -n 20
journalctl -u blog-frontend -n 20
```

浏览器访问 `https://你的域名` 应该能看到博客首页。

---

## 9. 日常运维

### 更新代码

**后端更新：**

```bash
cd /opt/blog/backend
git pull
source .venv/bin/activate
pip install -r requirements.txt
alembic upgrade head
systemctl restart blog-api
```

**前端更新：**

```bash
cd /opt/blog/frontend
git pull
npm install
npm run build
systemctl restart blog-frontend
```

### 常用命令

```bash
# 查看日志
journalctl -u blog-api -f       # 实时日志
journalctl -u blog-frontend -f

# 重启服务
systemctl restart blog-api
systemctl restart blog-frontend

# 查看资源占用
htop
df -h
```

---

## 10. 故障排查

| 问题 | 检查方法 |
|------|----------|
| 502 Bad Gateway | `systemctl status blog-api` / `systemctl status blog-frontend` 看服务是否在运行 |
| 数据库连接失败 | `mysql -u blog -p blog` 测试连接；检查 `.env` 中的 `DATABASE_URL` |
| API 500 错误 | `journalctl -u blog-api -n 50` 查看后端错误日志 |
| 前端页面空白 | 打开浏览器开发者工具看 Console/Network 错误 |
| Nginx 配置出错 | `nginx -t` 测试配置语法 |

### 端口检查

```bash
# 确认服务都在监听
ss -tlnp | grep -E '8000|3000|80|443'
```

期望输出示例：

```
LISTEN 0 128 127.0.0.1:8000  *.*   # blog-api（仅本地监听）
LISTEN 0 128 127.0.0.1:3000  *.*   # blog-frontend（仅本地监听）
LISTEN 0 128 0.0.0.0:80     *.*   # Nginx
LISTEN 0 128 0.0.0.0:443    *.*   # Nginx（HTTPS）
```
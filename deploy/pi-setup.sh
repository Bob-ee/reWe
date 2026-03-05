#!/usr/bin/env bash
# Simple helper to prepare a Raspberry Pi for this application.
# Run as root or using sudo on the Pi.

set -euo pipefail

echo "Checking system prerequisites..."

if command -v docker >/dev/null 2>&1; then
  echo "Docker found — skipping Docker install."
else
  echo "Docker not found. If you want this script to install Docker, re-run with interactive install enabled or run 'curl -fsSL https://get.docker.com -o get-docker.sh && sh get-docker.sh'."
fi

# Check for docker compose (v2 via 'docker compose' or legacy 'docker-compose')
if docker compose version >/dev/null 2>&1; then
  echo "'docker compose' CLI available — skipping compose install."
else
  if command -v docker-compose >/dev/null 2>&1; then
    echo "Found legacy 'docker-compose' binary — it will work, but consider installing the v2 CLI."
  else
    echo "Docker Compose (v2) not found. Installing compose plugin..."
    apt-get update
    apt-get install -y libltdl7
    mkdir -p /usr/local/lib/docker/cli-plugins
    curl -SL "https://github.com/docker/compose/releases/download/v2.20.2/docker-compose-linux-aarch64" -o /usr/local/lib/docker/cli-plugins/docker-compose
    chmod +x /usr/local/lib/docker/cli-plugins/docker-compose
    echo "Installed docker compose CLI plugin to /usr/local/lib/docker/cli-plugins/docker-compose"
  fi
fi

if command -v nginx >/dev/null 2>&1; then
  echo "nginx found — skipping nginx install."
else
  echo "nginx not found. This script assumes you already run nginx on the Pi; if you want to install it, run: 'sudo apt-get update && sudo apt-get install -y nginx'."
fi

echo "Creating gitdeploy user (optional). Add your public key to /home/gitdeploy/.ssh/authorized_keys"
if ! id -u gitdeploy >/dev/null 2>&1; then
  useradd -m -s /bin/bash gitdeploy || true
  echo "Created 'gitdeploy' user."
else
  echo "User 'gitdeploy' already exists."
fi
usermod -aG docker gitdeploy || true

echo "Clone your repo into the target path and ensure permissions. Example:" 
echo "  sudo -u gitdeploy git clone git@github.com:YOURUSER/YOURREPO.git /home/gitdeploy/portfolio"

echo "You can create a systemd service to run docker-compose on boot, or rely on the GH Actions workflow to ssh and run docker-compose."

cat <<'EOF'
Example systemd unit (create /etc/systemd/system/portfolio.service):

[Unit]
Description=Portfolio Docker Compose
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/home/gitdeploy/portfolio
ExecStart=/usr/local/bin/docker compose up -d --remove-orphans
ExecStop=/usr/local/bin/docker compose down

[Install]
WantedBy=multi-user.target

Then enable and start:
  sudo systemctl daemon-reload
  sudo systemctl enable portfolio.service
  sudo systemctl start portfolio.service
EOF

echo "Next steps:"
echo " 1) Add your SSH public key to /home/gitdeploy/.ssh/authorized_keys for the gitdeploy user."
echo " 2) Clone the repo into the chosen path (PI_REPO_PATH)."
echo " 3) If your nginx runs in a container, attach it to the 'portfolio_webnet' docker network so it can proxy to the app containers. Example:"
echo "     docker network create portfolio_webnet || true"
echo "     docker network connect portfolio_webnet <your-nginx-container-name>"
echo "     (Then proxy to http://rental-portfolio:80 and http://rental-portfolio-api:5000 from inside that nginx container.)"
echo " 4) If nginx runs on the host (not in container), configure it to proxy to the host's docker bridge or publish the frontend port by using a local docker-compose.override.yml that maps 8080:80."
echo " 5) Ensure the gitdeploy user has permissions to run docker (member of docker group)."
echo " 6) Add the required GitHub repo secrets (PI_SSH_KEY, PI_HOST, PI_USER, PI_REPO_PATH, ADMIN_PASSWORD, JWT_SECRET) so the workflow can deploy and write .env on the Pi."

echo "Setup helper complete."

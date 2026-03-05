# Deploying to your Raspberry Pi (automated via GitHub Actions)

This repository includes a GitHub Actions workflow that SSHes to your Pi, pulls the latest `main`, writes a runtime `.env` from repository secrets, builds images, and restarts the `docker-compose` stack.

Prerequisites on the Pi
- Git installed and the repo cloned into a path (this path is `PI_REPO_PATH` in the workflow): e.g. `/home/gitdeploy/portfolio`
- Docker installed and configured (see `deploy/pi-setup.sh`)
- docker compose v2 (CLI) available (or the `docker compose` plugin)
 - The `gitdeploy` user's public key added to `~/.ssh/authorized_keys`
- Nginx installed on the Pi and configured to reverse-proxy to the containers (sample in `deploy/pi-nginx.conf`)
  Important: If your nginx runs in a container (as you mentioned), do NOT run a second nginx on the host. Instead connect nginx's container to the same Docker network as the app so it can proxy to service names (we expose app ports internally by default).

  Example (on the Pi):
  1. Create or reuse a bridge network (we use `portfolio_webnet` in `docker-compose.yml`):
	  ```bash
	  docker network create portfolio_webnet || true
	  ```
  2. Start your app stack (`docker compose up -d`) so the `rental-portfolio` and `rental-portfolio-api` containers are on that network.
  3. Connect your existing nginx container to the same network so it can reach the app by container name:
	  ```bash
	  docker network connect portfolio_webnet <your-nginx-container-name>
	  ```
  4. In your nginx config (inside the nginx container), proxy to the service container names and ports. For example, proxy to `http://rental-portfolio:80` and `http://rental-portfolio-api:5000`.

What the workflow needs (set these in your GitHub repo secrets):
- `PI_SSH_KEY`: Private SSH key for the `gitdeploy` user (no passphrase recommended for automation)
- `PI_HOST`: IP or hostname of the Pi
- `PI_USER`: Username (e.g. `gitdeploy` or `pi`)
- `PI_REPO_PATH`: Absolute path on the Pi where the repo is cloned (e.g. `/home/gitdeploy/portfolio`)
- `ADMIN_USER`: (optional) admin username for seed user (default: `admin`)
- `ADMIN_PASSWORD`: (required) admin password (use a strong one)
- `JWT_SECRET`: (required) random string for signing JWTs

How the workflow deploys (summary):
1. Action checks out code and prepares SSH key.
2. SSH to the Pi and write a `.env` file using the repo secrets (overwrites on each deploy).
 3. Pull/build images and run `docker compose up -d --remove-orphans` (or `docker-compose up -d` depending on your setup). Because the services don't bind host ports by default, ensure your nginx container is attached to the `portfolio_webnet` network and proxies to the internal names.

Preparing the Pi (quick checklist)
1. Run `sudo bash deploy/pi-setup.sh` (or inspect & run commands manually).
2. Clone your repo into `/home/gitdeploy/portfolio` (or your chosen `PI_REPO_PATH`).
3. Add the `gitdeploy` user's public key to `/home/gitdeploy/.ssh/authorized_keys`.
4. Configure nginx to proxy your domain to the containers using `deploy/pi-nginx.conf`. Update `server_name` and enable SSL (certbot). If you use Cloudflare, configure DNS and SSL mode carefully (prefer Full (strict)).

Testing locally
- You can test the container stack locally with `docker-compose build && docker-compose up` from the repo root. The frontend is exposed on host port 8080 and the API on 5000 by default.

Security notes
- Do NOT commit `.env` to the repo. The workflow will write `.env` on the Pi from GitHub secrets.
- Keep `JWT_SECRET` and `ADMIN_PASSWORD` secret and rotate if they are ever exposed.

Troubleshooting
- If the workflow fails to connect via SSH, check that the `gitdeploy` user's authorized_keys contains the public key for `PI_SSH_KEY` and that port 22 is reachable from GitHub Actions runners.
- If nginx serves a cached or Cloudflare-cached page, purge cache or temporarily disable Cloudflare proxying while debugging.

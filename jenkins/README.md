# Running Jenkins locally (WSL)

Reuse the WSL host's Docker daemon instead of setting up Docker-in-Docker —
fewer moving parts, and `docker build`/`docker push` work immediately.

1. Make sure `docker` works from your WSL shell (native Docker Engine in WSL,
   or Docker Desktop with WSL integration enabled).
2. Run Jenkins as a container, mounting the host's Docker socket in:

   ```bash
   docker run -d --name jenkins \
     -p 8080:8080 -p 50000:50000 \
     -v jenkins_home:/var/jenkins_home \
     -v /var/run/docker.sock:/var/run/docker.sock \
     -u root \
     jenkins/jenkins:lts
   ```

   `-u root` plus the mounted socket let the `docker` CLI inside the Jenkins
   container drive the *host's* Docker daemon directly — no dind.

3. Install the `docker` CLI inside the running container (one-off):

   ```bash
   docker exec -u root jenkins sh -c "apt-get update && apt-get install -y docker.io"
   ```

4. Open http://localhost:8080, finish the setup wizard, and install the
   **Pipeline** and **Docker Pipeline** plugins.
5. Manage Jenkins → Credentials → add a "Username with password" credential
   for Docker Hub with ID `dockerhub-creds`.
6. Create a Pipeline job pointing at this repo with script path
   `jenkins/Jenkinsfile`, and replace `YOUR_DOCKERHUB_USER` in that file with
   your actual Docker Hub username.

Skipped a `Deploy` stage (SSH to the VM + `kubectl set image`) — the ask was
build-and-push only. Add one to `Jenkinsfile` if you want pushes to
auto-deploy.

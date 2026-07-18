# TaskForge

A Kubernetes-native task list app (React + Express + MongoDB) built to
demonstrate the DevOps lifecycle end-to-end: Terraform → Ansible → Docker →
Jenkins CI → Kubernetes. See `proposal.pdf` for the full write-up.

## Repo layout

```
app/backend/    Express REST API (CRUD for tasks), Dockerfile, one test
app/frontend/   React SPA, Dockerfile (Vite build served by Nginx)
docker-compose.yml   Local dev: frontend + backend + mongo on your machine
k8s/            Namespace, ConfigMap/Secret, Mongo StatefulSet+PVC,
                backend/frontend Deployments+Services+HPA, Ingress
ansible/        Installs k3s on the target VM
terraform/      Declares the VM as the provisioning target, hands off to Ansible
jenkins/        Jenkinsfile (build + push images to Docker Hub) + WSL setup notes
```

## 1. Run it locally (no Kubernetes needed)

```bash
docker compose up --build
```

Frontend on http://localhost:8080, API directly on http://localhost:4000.
This is the fastest way to prove frontend → backend → MongoDB connectivity.

## 2. Provision the VM (Terraform + Ansible)

You need one VM already running (VirtualBox/Hyper-V/VMware), reachable over
SSH, with a user that has passwordless sudo.

```bash
cd terraform
cp terraform.tfvars.example terraform.tfvars   # fill in your VM's IP/user/key
terraform init
terraform apply
```

`terraform apply` installs Python on the VM (required by Ansible), then runs
`ansible/playbook.yml`, which installs k3s (single-node Kubernetes — bundles
containerd, the Traefik ingress controller, local-path storage, and
metrics-server) and fetches a working `kubeconfig` back to `terraform/../kubeconfig`.

> The VM is hand-built, not created by Terraform — there's no cloud API to
> provision it through. Terraform's job here is the declarative hand-off to
> Ansible shown in the architecture diagram. Point `main.tf` at a real cloud
> provider resource (`aws_instance`, `azurerm_linux_virtual_machine`, ...) if
> this ever targets real cloud infrastructure instead.

## 3. Build and push images (Jenkins)

See `jenkins/README.md` to run Jenkins in WSL. The `Jenkinsfile` builds the
frontend and backend Docker images and pushes them to Docker Hub as
`<your-dockerhub-user>/taskforge-{backend,frontend}:<build-number>` and `:latest`.

Replace `YOUR_DOCKERHUB_USER` in `jenkins/Jenkinsfile` and in
`k8s/04-backend.yaml` / `k8s/05-frontend.yaml` with your actual Docker Hub
username before deploying.

## 4. Deploy to Kubernetes

```bash
export KUBECONFIG=$(pwd)/kubeconfig
kubectl apply -f k8s/
```

Then visit `http://<vm-ip>/` — Ingress routes `/` to the frontend and `/api`
to the backend, which talks to MongoDB over the cluster-internal `mongo`
Service.

## Notes / deliberate simplifications

- `k8s/02-secret.yaml` has plaintext Mongo credentials checked in — fine for
  a coursework single-node cluster, swap for sealed-secrets if this ever runs
  somewhere real.
- Jenkins only builds and pushes images (as asked); redeploying to the
  cluster after a push is a manual `kubectl apply`/`kubectl set image` — add
  a Deploy stage to the Jenkinsfile if you want that automated too.

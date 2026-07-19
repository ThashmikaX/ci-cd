terraform {
  required_providers {
    null = {
      source  = "hashicorp/null"
      version = "~> 3.2"
    }
  }
}

# ponytail: the VM already exists (hand-built VirtualBox/Hyper-V box), so
# there's no cloud API for Terraform to create it through. On a real cloud
# target, this file's job would be an aws_instance/azurerm_linux_virtual_machine
# resource that creates the VM; here it declares the VM as the provisioning
# target and drives the same "hand off to Ansible" step the diagram shows.

resource "null_resource" "bootstrap" {
  triggers = {
    vm_host = var.vm_host
  }

  connection {
    type        = "ssh"
    host        = var.vm_host
    user        = var.vm_user
    private_key = file(pathexpand(var.ssh_private_key_path))
  }

  provisioner "remote-exec" {
    inline = [
      "sudo apt-get update -y",
      "sudo apt-get install -y python3", # required by Ansible's SSH transport
    ]
  }
}

resource "null_resource" "configure" {
  depends_on = [null_resource.bootstrap]

  triggers = {
    playbook_hash = filemd5("${path.module}/../ansible/playbook.yml")
  }

  provisioner "local-exec" {
    command = "ansible-playbook -i '${var.vm_host},' --user '${var.vm_user}' --private-key '${pathexpand(var.ssh_private_key_path)}' '${path.module}/../ansible/playbook.yml'"
  }
}

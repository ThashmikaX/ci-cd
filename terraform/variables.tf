variable "vm_host" {
  description = "IP or hostname of the hand-built VM"
  type        = string
}

variable "vm_user" {
  description = "SSH user on the VM"
  type        = string
  default     = "self_healing"
}

variable "ssh_private_key_path" {
  description = "Path to the SSH private key used to reach the VM"
  type        = string
  default     = "~/.ssh/id_rsa"
}

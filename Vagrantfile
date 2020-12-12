VAGRANTFILE_API_VERSION = "2"

Vagrant.require_version ">= 1.6.5"

Vagrant.configure(VAGRANTFILE_API_VERSION) do |config|
  config.vm.box = "ubuntu/bionic64"

  # Ports for Node and Redis
  config.vm.network "forwarded_port", guest: 3000, host: 3000, host_ip: "127.0.0.1"
  config.vm.network "forwarded_port", guest: 6379, host: 6379, host_ip: "127.0.0.1"

  config.vm.provider "virtualbox" do |vm|
    vm.memory = 4096
    vm.cpus = 4
  end

  config.vm.provision "docker" do |docker|
    docker.pull_images "redis"
    docker.run "redis", args: "-p 6379:6379 --name some-redis"
  end

  config.vm.provision "shell", path: "provision.sh", privileged: false
end

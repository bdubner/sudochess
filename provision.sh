#!/bin/bash

sudo echo "America/New_York" | sudo tee /etc/timezone
sudo dpkg-reconfigure -f noninteractive tzdata

sudo apt-get update -y
sudo apt-get install -y build-essential 

git clone https://github.com/creationix/nvm.git ~/.nvm && cd ~/.nvm && git checkout `git describe --abbrev=0 --tags`
echo "source ~/.nvm/nvm.sh" >> ~/.profile
source ~/.profile

nvm install 14.4.0
nvm alias default 14.4.0

cd /vagrant/webapp
npm install
nohup node bin/www & sleep 1

# SudoChess - CMU ECE 18-500 Fall 2020 Team A7 
##### Brandon Dubner, Danie Alvarado, Tony Padilla 

### Required Software
- [nodeJs](https://nodejs.org/en/download)

AND one of 
 
- [docker](https://www.docker.com/products/docker-desktop)

OR 
- [Vagrant](https://www.vagrantup.com/downloads.html) + [VirtualBox](https://www.virtualbox.org/wiki/Downloads)

## Starting & Running Sudochess Webapp

#### Option 1: nodeJs + Docker

1) clone repo https://github.com/bdubner/sudochess to project directory

2) Start redis server  
`
docker pull redis
docker run --name some-redis -p 6379:6379 -d redis
`
3) install npm dependencies
`
npm install
`

4) run SudoChess Server
`
node bin/www
`

#### Option 2: Vagrant + VirtualBox
1) run `vagrant up`

NOTES: 

- To stop SudoChess server from terminal use 
`vagrant ssh -c "pkill node -9"`

- To start sudoChess server (in case server stops) use
`vagrant ssh -c "nohup node /vagrant/bin/www & sleep 1" `

- To stop VM use `vagrant halt`

- To delete VM use `vagrant destroy`

After the above steps for either option, you should be able to visit http://localhost:3000/ and see the
 SudoChess home page


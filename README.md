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
 SudoChess home page. (See Using Web App section for how to use web app )

## Using SudoCommunicator

1. `cd sudocommunicator`

2. `npm install`

3. After creating a game, run 
`node send_move.json [port]`
where [port] is the port number displayed below your
name on the web app.

you will be displayed the moves sent from the server in stdout
and you can send moves to the server by entering 
`src dest` where src and dest are square locations (ie. `e2 e4`)

## Starting a game on web app
1. go to (chrome tab) http://localhost:3000/ 

2. click "Login / Register"

3. Create new user by clicking "Sign Up" at bottom of prompted page

4. Launch incognito tab 

5. repeat steps 1-4 to create 2nd user (or use user:vyas@fake.com password:asdf1234ASDF)

6. In first tab click 'Create Room' button in Nav Bar

7. Copy room to incognito tab and click 'Join Room' button

8. In incognito tab, click 'Find Game' button

9. In first tab, click accept
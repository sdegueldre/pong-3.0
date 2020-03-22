# Pong-3.0

Welcome to this new and fabulous project to create a new version of the pong game.

### Setting up
 
 * Clone the repo: `git clone ...`
 * Install the dependencies: `npm install`

### Launch

 * Use `npm run dev` to start the client application
 * Use `npm run server` to start the server
 * Point your browser at http://localhost:3000
> Parcel will tell you that it's serving the files on port 1234: that won't work as application tries to connect to the websocket on the same port as the page, so you need to go to the page served by the server on port 3000 (or whatever port you configure in your environment, eg: `PORT=8080 npm run server`)

#### The technologies used for this project are : 
 * [Parcel](https://parceljs.org/) for bundling and building
 * [Socket.io](https://socket.io/) for websocket communication
 * [Pixi.js](https://www.pixijs.com/) for graphics
 

# react-conf-webrtc &middot; [![CircleCI](https://circleci.com/gh/teamious/react-conf-webrtc/tree/master.svg?style=shield)](https://circleci.com/gh/teamious/react-conf-webrtc/tree/master) [![npm version](https://img.shields.io/npm/v/react-conf-webrtc.svg?style=shield)](https://www.npmjs.com/package/react-conf-webrtc)
WebRTC conference room component for React projects. Out of the box support for Spreed WebRTC.

# Demo
https://teamious.github.io/react-conf-webrtc/

# Development

To start developing, first make sure you have installed all of the dependencies:

```
npm install
```

Next, you should link your local package. This lets you develop + test your packages locally.
To link `react-conf-webrtc` first CD into the main project directory.

```
$ cd /path/to/react-conf-webrtc
```

Then run:

```
# You might need sudo
npm link
```

After that, change into the docs directory:

```
cd docs
```

and link the package:

```
npm link react-conf-webrtc
```

You will need to run a build in order to test with npm link:

```
cd  ~/react-conf-webrtc
npm run build:watch
```

You can develop in one of two ways: with docker or without docker. The recommended dev environment
is to use Docker on your machine. You can still develop even if you can't run Docker on your machine.

## With Docker

With Docker installed on your machine you can start the dev environment with the following command:

```
npm start
```

**NOTE: This script assumes you are able to run docker with non-root access (you don't need to use `sudo docker ...`). You can learn how to do that here https://askubuntu.com/questions/477551/how-can-i-use-docker-without-sudo**

This does the following:
- start webpack-dev-server
- pull the spreed/webrtc image from Docker registry
- run the spreed/webrtc image in a container

Please note that the boot time for the server can be a little slow. Once you see the following line
you can know the server is up and running:

> [1] server 2017/08/03 21:52:08 Starting HTTPS server on 0.0.0.0:8443

If you want to kill the dev environment simply press `CTRL+C`. This will kill webpack-dev-server
and will also stop the docker container. **NOTE**: Stopping the previous docker container can be slow.

## Without Docker

Without Docker installed on your machine you can still develop in your local environment.
You will need to go to [the Spreed Github page](https://github.com/strukturag/spreed-webrtc)
and clone the repository.

Once you have cloned the repository, look at the README.md file to learn how to start the
Spreed server. Once you have the Spreed server up and running you can start webpack-dev-server
with:

```
npm run start:no-docker
```

This system requires that you manually start and stop your spreed server.

# Servers

Regardless if you start with/without Docker, your frontend server is available on https://localhost:8080
and your backend Spreed server is available on https://localhost:8443. Since both servers
use self-signed certificates you will need to manually accept the warnings for both servers
when testing in browser.

Both servers listen on 0.0.0.0, therefore you can connect to the servers on your network
by knowing your host's IP address (eg. navigating to https://192.168.220.116:8080 you will find Andrew's dev server).
This lets you test your server with multiple machines on the same network.

# README

To start developing, first make sure you have installed all of the dependencies:

```
npm install
```

You can develop in one of two ways: with docker or without docker. The recommended dev environment
is to use Docker on your machine however, it is still possible to develop the docs website with Docker.

## With Docker

With Docker installed on your machine you can start the dev environment with the following command:

```
npm start
```

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
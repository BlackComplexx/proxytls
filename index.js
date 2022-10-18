"use strict"

const net = require("net");
const fs = require('fs');
const path = require('path');

const server = net.createServer();
    
    try {
        server.on("connection", async (clientToProxySocket) => {

            clientToProxySocket.once("data", async (data) => {
                let isTLSConnection = data.toString().indexOf("CONNECT") !== -1;
                let serverPort = 80;
                let serverAddress;

                if (isTLSConnection) {
                    serverPort = 443;
                    serverAddress = data
                        .toString()
                        .split("CONNECT")[1]
                        .split(" ")[1]
                        .split(":")[0];
                } else {
                    try {
                    serverAddress = data.toString().split("Host: ")[1].split("\r\n")[0];
                    } catch(err){
                        clientToProxySocket.destroy();
                        return
                    }
                }

                let SocketC = net.createConnection({
                    host: serverAddress,
                    port: serverPort,
                });


                if (isTLSConnection) {
                    clientToProxySocket.write("HTTP/1.1 200 OK\r\n\r\n");
                } else {
                    SocketC.write(data);
                }

                clientToProxySocket.pipe(SocketC);
                SocketC.pipe(clientToProxySocket);

                SocketC.on("error", (err) => {
                    clientToProxySocket.destroy()
                });

                clientToProxySocket.on("error", (err) => {
                    console.log("Client connect fail.");
                    clientToProxySocket.destroy()
                });
            });
        });

        server.on("error", (err) => {
            console.log(err)
        });

        server.listen({
            host: "0.0.0.0",
            port: 80
        });
    } catch(err){console.log(err)}

    console.log(`Server running on port: ` + 80);


process.on('uncaughtException', function(error){
    if (error.code == 'ECONNRESET'){
        return
    } else {
        return
    }
})
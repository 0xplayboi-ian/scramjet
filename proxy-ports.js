const http = require("http");
const net = require("net");

function createProxy(listenPort, targetPort) {
  const server = http.createServer((req, res) => {
    const options = {
      hostname: "127.0.0.1",
      port: targetPort,
      path: req.url,
      method: req.method,
      headers: { ...req.headers, host: `localhost:${targetPort}` },
    };
    const proxyReq = http.request(options, (proxyRes) => {
      res.writeHead(proxyRes.statusCode || 200, proxyRes.headers);
      proxyRes.pipe(res, { end: true });
    });
    proxyReq.on("error", () => {
      res.writeHead(502);
      res.end("Waiting for Scramjet server on port 3000...");
    });
    req.pipe(proxyReq, { end: true });
  });

  server.on("upgrade", (req, socket, head) => {
    const proxySocket = net.connect(targetPort, "127.0.0.1", () => {
      proxySocket.write(
        `${req.method} ${req.url} HTTP/${req.httpVersion}\r\n` +
          Object.entries(req.headers)
            .map(([k, v]) => `${k}: ${v}`)
            .join("\r\n") +
          "\r\n\r\n"
      );
      proxySocket.write(head);
      socket.pipe(proxySocket).pipe(socket);
    });
    proxySocket.on("error", () => socket.destroy());
    socket.on("error", () => proxySocket.destroy());
  });

  server.listen(listenPort, "0.0.0.0", () => {
    console.log(`Forwarding :${listenPort} -> :${targetPort} (Real Scramjet Site)`);
  });
}

createProxy(5173, 3000);
createProxy(5174, 3000);

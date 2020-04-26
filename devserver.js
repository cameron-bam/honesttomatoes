/*
they usually use ES Modules but i used CommonJS here
you can port it to suite your need
*/

const sirv = require("sirv");
const polka = require("polka");
const compression = require("compression");
const { createProxyMiddleware } = require("http-proxy-middleware");
const { PORT, NODE_ENV, PROXY_HOST, BUILD_DIR } = process.env;
const dev = NODE_ENV === "development";
const apiProxy = createProxyMiddleware(PROXY_HOST, {changeOrigin: true});

// assign server variable
const server = polka();

// ⚠️ hack to make the proxy work with polka
// express-http-proxy is expecting these methods
server.use(function(req, res, next) {
  res.status = code => (res.statusCode = code);
  res.set = res.setHeader.bind(res);
  next();
});

// proxy to api
server.use("/api", apiProxy);

// do normal sapper server stuff
server
  .use(
    compression({ threshold: 0 }),
    sirv(BUILD_DIR, { dev })
  )
  .listen(PORT, err => {
    if (err) console.log("error", err);
  });
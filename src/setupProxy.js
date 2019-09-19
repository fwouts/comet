const proxy = require("http-proxy-middleware");

module.exports = function(app) {
  app.use(
    "/jira",
    proxy({
      target: process.env.REACT_APP_JIRA_HOST || "http://localhost",
      changeOrigin: true,
      pathRewrite: {
        "^/jira/": "/"
      }
    })
  );
};

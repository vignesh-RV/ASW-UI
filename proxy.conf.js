const PROXY_CONFIG = {
    "/api": {
      "target": "http://192.168.1.40:5000/",
      "secure": false,
      "changeOrigin": true
    }
  };
  
  module.exports = PROXY_CONFIG;
  
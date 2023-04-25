const http = require('http');
require("dotenv").config();
const app = require('./index');
const server = http.createServer(app);
server.listen(process.env.PORT);

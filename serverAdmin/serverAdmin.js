const http = require("http");
const express = require("express");
const bodyParser = require("body-parser");
var admin = require("firebase-admin");
var serviceAccount = require("./tkcomidas-6ae27-firebase-adminsdk-xdwa1-19b75b4ad5.json");
const hostname = "127.0.0.1";
const port = 8080;
const adminCtrl = require("./Admin");
const emailSender = require("./EmailSender");
const app = express();
const api_admin = express.Router();

api_admin.post("/createUser", adminCtrl.createUser);
api_admin.post("/sendEmailToNotifyUpdatePassword", emailSender.sendUpdatePassword);
api_admin.post("/updateUser", adminCtrl.updateUser);
api_admin.post("/deleteUser", adminCtrl.deleteUser);
api_admin.post("/getLast5ProductsByDay", adminCtrl.getLast5ProductsByDay);
api_admin.post("/getProductsByMonth", adminCtrl.getProductsByMonth);
api_admin.post("/getProductsByYear", adminCtrl.getProductsByYear);

// Evitar problemas de CORS:
app.use(function(req, res, next) {
  // Request headers you wish to allow
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );

  // Website you wish to allow to connect
  res.setHeader("Access-Control-Allow-Origin", "*");

  // Request methods you wish to allow
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");

  // Set to true if you need the website to include cookies in the requests sent
  // to the API (e.g. in case you use sessions)
  res.setHeader("Access-Control-Allow-Credentials", true);

  // Pass to next layer of middleware
  next();
});

app.use(
  bodyParser.urlencoded({
    extended: false
  })
);

app.use(express.static(__dirname));
app.use(bodyParser.json());

app.use("/admin", api_admin);
app.use("/email", api_admin);
app.use("/auth", api_admin);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://tkcomidas-6ae27.firebaseio.com"
});

app.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});

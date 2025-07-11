require("dotenv").config();

var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");

require("./models/connection");

var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
var clipsRouter = require("./routes/clips");

var app = express();

const cors = require("cors");
app.use(cors());

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/clipmanager/users", usersRouter);
app.use("/clipmanager/clips", clipsRouter);

/* ------------------------------
   404 pour tout le reste
------------------------------ */
app.use((req, res) => {
  res.status(404).send(`
    <html>
      <head><title>404 - Not Found</title></head>
      <body style="font-family: Arial; text-align: center; margin-top: 50px;">
        <h1>404 - Page non trouvée ❌</h1>
        <p>L’URL demandée <code>${req.originalUrl}</code> n’existe pas.</p>
        <a href="/">⬅️ Retour à la page d’accueil</a>
      </body>
    </html>
  `);
});

module.exports = app;

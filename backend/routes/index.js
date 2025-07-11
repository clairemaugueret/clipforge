var express = require("express");
var router = express.Router();

/* GET home page. */
router.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

// Page d’accueil spécifique ClipManager
router.get("/clipmanager", (req, res) => {
  res.send(`
    <html>
      <head><title>API ClipManager</title></head>
      <body style="font-family: Arial; text-align: center; margin-top: 50px;">
        <h1>Bienvenue dans l'API ClipManager 🎬</h1>
        <p>Voici des exemples de routes disponibles :</p>
        <ul style="list-style:none;">
          <li>🔗 <code>GET /clipmanager/users/all</code> - Liste des utilisateurs</li>
          <li>🔗 <code>GET /clipmanager/clips/all</code> - Liste des clips</li>
          <li>➕ <code>POST /clipmanager/users/authtwitch</code> - Créer un utilisateur</li>
          <li>➕ <code>POST /clipmanager/clips/new</code> - Créer un clip</li>
        </ul>
        <a href="/">⬅️ Retour à la page générale</a>
      </body>
    </html>
  `);
});

module.exports = router;

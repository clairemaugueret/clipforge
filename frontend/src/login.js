import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { login, logout } from "./reducers/userSlice";

const CLIENT_ID = process.env.REACT_APP_TWITCH_CLIENT_ID;
const REDIRECT_URI = process.env.REACT_APP_TWITCH_REDIRECT_URI;
const SCOPE = "user:read:email";

function App() {
  const dispatch = useDispatch();
  const [isAuthInProgress, setIsAuthInProgress] = useState(false);
  const user = useSelector((state) => state.user);

  const handleTwitchLogin = () => {
    // Rediriger l'utilisateur vers la page d'autorisation de Twitch pour récupérer le code d'autorisation
    const authUrl = `https://id.twitch.tv/oauth2/authorize?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(
      REDIRECT_URI
    )}&response_type=code&scope=${encodeURIComponent(SCOPE)}`;
    window.location.href = authUrl;
  };

  useEffect(() => {
    // Vérifier si l'URL contient un code d'autorisation
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");

    // Si un code est présent, envoyer une requête au backend pour obtenir le token utilisateur
    if (code && !isAuthInProgress) {
      setIsAuthInProgress(true); // Bloque d'autres tentatives car une requête est en cours (code ne peut être utilisé qu'une fois)

      fetch("http://localhost:3001/users/authtwitch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      })
        .then((res) => res.json())
        .then((data) => {
          // Si la réponse est positive, connexion de l'utilisateur et dispatch les données utilisateur dans le store
          if (data.result) {
            dispatch(
              login({
                token: data.user.token,
                username: data.user.username,
                avatar_url: data.user.avatar_url,
              })
            );
            window.history.replaceState({}, document.title, "/"); // Nettoyer l'URL (pour enlever le code renvoyé par Twitch)
          } else {
            console.error(data.error);
          }
        })
        .catch((err) => console.error("Erreur backend :", err))
        .finally(() => {
          setIsAuthInProgress(false); // Débloque pour une prochaine tentative
        });
    }
  }, [dispatch, isAuthInProgress]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-purple-700 to-indigo-800 text-white">
      <h1 className="text-4xl font-bold mb-4">🎬 ClipForge</h1>
      <p className="mb-6 text-lg">Connectez-vous avec Twitch pour commencer</p>

      <button
        onClick={handleTwitchLogin}
        disabled={isAuthInProgress} // bloquer les clics si une requête est en cours
        className={`bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-6 rounded-xl shadow-md transition duration-300 ${
          isAuthInProgress ? "opacity-50 cursor-not-allowed" : ""
        }`}
      >
        {isAuthInProgress
          ? "Connexion en cours..."
          : "Se connecter avec Twitch"}
      </button>

      {/* Affichage conditionnel pour l'utilisateur connecté */}
      {user.username && (
        <div className="mt-8 flex flex-col items-center">
          <img
            src={user.avatar_url}
            alt={user.username}
            className="w-24 h-24 rounded-full border-4 border-white shadow-lg"
          />
          <p className="mt-4 text-xl font-medium">{user.username}</p>
          <button
            onClick={() => dispatch(logout())}
            className="mt-4 bg-red-500 hover:bg-red-600 text-white py-1 px-3 rounded-lg"
          >
            Déconnexion
          </button>
        </div>
      )}
    </div>
  );
}

export default App;

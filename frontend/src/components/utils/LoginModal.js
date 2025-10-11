import twitchLogo from "../images/twitch_logo_white.png";
import { useSelector } from "react-redux";

export default function LoginModal({ onClose, onLogout }) {
  const user = useSelector((state) => state.user);

  const CLIENT_ID = process.env.REACT_APP_TWITCH_CLIENT_ID;
  const REDIRECT_URI = process.env.REACT_APP_TWITCH_REDIRECT_URI;
  const SCOPE = "user:read:email editor:manage:clips";

  const handleTwitchLogin = () => {
    const authUrl = `https://id.twitch.tv/oauth2/authorize?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(
      REDIRECT_URI
    )}&response_type=code&scope=${encodeURIComponent(SCOPE)}`;
    window.location.href = authUrl;
  };

  const handleLogout = () => {
    onLogout();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-gray-800 rounded-lg shadow-2xl w-full max-w-md mx-4 border-2 border-gray-700 animate-scale-in">
        {/* Barre colorée */}
        <div className="h-2 bg-indigo-500 rounded-t-lg" />

        <div className="p-6 text-gray-100">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🎮</span>
              <h2 className="text-xl font-bold text-white">
                {user?.username ? "Déconnexion" : "Connexion avec Twitch"}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white text-2xl leading-none"
              aria-label="Fermer"
              title="Fermer"
            >
              ✕
            </button>
          </div>

          {/* Contenu */}
          {user?.username ? (
            // État connecté : confirmation de déconnexion
            <>
              <p className="text-gray-300 mb-6 text-sm">
                Veux-tu te déconnecter du compte{" "}
                <span className="font-semibold">{user.username}</span> ?
              </p>

              <div className="flex justify-end gap-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 font-medium transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded font-medium transition-colors"
                >
                  Se déconnecter
                </button>
              </div>
            </>
          ) : (
            // État non connecté : bouton de connexion
            <>
              <p className="text-gray-300 mb-4 text-sm">
                Connecte-toi avec ton compte Twitch pour continuer.
              </p>

              <button
                onClick={handleTwitchLogin}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded font-medium transition-colors"
              >
                <img src={twitchLogo} alt="Twitch" className="w-6 h-6" />
                Se connecter avec Twitch
              </button>

              <div className="flex justify-end mt-4">
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 font-medium transition-colors"
                >
                  Annuler
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Animation */}
      <style>{`
        @keyframes scale-in {
          from { opacity: 0; transform: scale(0.9); }
          to   { opacity: 1; transform: scale(1); }
        }
        .animate-scale-in { animation: scale-in 0.2s ease-out; }
      `}</style>
    </div>
  );
}

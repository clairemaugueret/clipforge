import twitchLogo from "../images/twitch_logo_white.png";

export default function LoginModal({ onClose }) {
  const handleTwitchLogin = () => {
    window.location.href = "https://id.twitch.tv/oauth2/authorize?...";
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className="bg-white text-gray-900 p-6 rounded-lg shadow-lg w-80">
        <h2 className="text-lg flex items-center justify-center font-bold mb-4">
          Connexion avec Twitch
        </h2>

        <button
          onClick={handleTwitchLogin}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
        >
          <img src={twitchLogo} alt="Twitch" className="w-6 h-6" />
          Se connecter avec Twitch
        </button>

        <div className="flex justify-center mt-2">
          <button
            onClick={onClose}
            className="w-24 py-1 bg-gray-300 text-gray-950 rounded hover:bg-gray-400"
          >
            Annuler
          </button>
        </div>
      </div>
    </div>
  );
}

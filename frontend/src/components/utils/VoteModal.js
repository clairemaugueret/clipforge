import { useState } from "react";

export default function VoteModal({ user, clip, onVote, onClose, showAlert }) {
  const BACK_URL = process.env.REACT_APP_BACK_URL;
  const [loading, setLoading] = useState(false);

  const handleVote = async (choice) => {
    if (loading) return;
    setLoading(true);
    try {
      const response = await fetch(`${BACK_URL}/clipmanager/clips/vote`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: user?.token,
          clipId: clip.clip_id,
          vote: choice,
        }),
      });

      const data = await response.json();

      if (data.result) {
        showAlert({
          type: "success",
          title: "Vote enregistré",
          message: "Votre vote a bien été pris en compte.",
        });
        onVote?.(data.clip);
        onClose();
      } else {
        showAlert({
          type: "error",
          title: "Erreur lors du vote",
          message: data.error || "Impossible d'enregistrer le vote.",
        });
      }
    } catch (error) {
      console.error("Erreur réseau:", error);
      showAlert({
        type: "error",
        title: "Erreur de connexion",
        message: "Impossible de contacter le serveur. Réessayez plus tard.",
      });
    } finally {
      setLoading(false);
    }
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
              <span className="text-2xl">🗳️</span>
              <h2 className="text-xl font-bold text-white">
                Vote de {user?.username ?? "expert"}
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

          {/* Actions de vote */}
          <div className="space-y-3">
            <button
              onClick={() => handleVote("OK")}
              disabled={loading}
              className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed text-white rounded font-medium transition-colors"
            >
              ✅ Valider le clip
            </button>

            <button
              onClick={() => handleVote("toReview")}
              disabled={loading}
              className="w-full px-4 py-2 bg-yellow-600 hover:bg-yellow-700 disabled:opacity-60 disabled:cursor-not-allowed text-white rounded font-medium transition-colors"
            >
              ⚠️ À revoir — nécessite des modifications
            </button>

            <button
              onClick={() => handleVote("KO")}
              disabled={loading}
              className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed text-white rounded font-medium transition-colors"
            >
              ❌ Refuser le clip
            </button>
          </div>

          {/* Boutons secondaires */}
          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 font-medium transition-colors"
            >
              Annuler
            </button>
          </div>
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

/**
 * Modale de vote pour les experts
 * Permet de voter OK, KO ou toReview sur un clip
 * Effectue un appel API vers le backend pour enregistrer le vote
 */

export default function ExpertVoteModal({
  user, // Utilisateur connecté (avec token)
  clip, // Clip sur lequel voter
  onVote, // Callback appelé après un vote réussi
  onClose, // Callback pour fermer la modale
}) {
  const BACK_URL = process.env.REACT_APP_BACK_URL;

  /**
   * Envoie le vote au backend
   * @param {string} choice - Le vote: "OK", "KO" ou "toReview"
   */
  const handleVote = async (choice) => {
    try {
      const response = await fetch(`${BACK_URL}/clipmanager/clips/vote`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token: user?.token,
          clipId: clip.clip_id,
          vote: choice,
        }),
      });

      const data = await response.json();

      if (data.result) {
        // Vote enregistré avec succès
        alert(`✅ Vote enregistré`);

        // Appelle le callback parent pour mettre à jour l'UI
        if (onVote) {
          onVote(data.clip); // Passe le clip mis à jour
        }

        // Ferme la modale
        onClose();
      } else {
        // Erreur lors de l'enregistrement
        alert(`❌ Erreur lors du vote: ${data.error}`);
      }
    } catch (error) {
      console.error("Erreur réseau:", error);
      alert("❌ Erreur de connexion au serveur");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className="bg-white text-gray-900 p-6 rounded-lg shadow-lg w-80">
        <h2 className="text-lg font-bold mb-4">Vote de {user?.username}</h2>

        <div className="space-y-2">
          <button
            onClick={() => handleVote("OK")}
            className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
          >
            ✅ Valider le clip
          </button>

          <button
            onClick={() => handleVote("toReview")}
            className="w-full px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 transition-colors"
          >
            ⚠️ À revoir - Nécessite des modifications
          </button>

          <button
            onClick={() => handleVote("KO")}
            className="w-full px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            ❌ Refuser le clip
          </button>
        </div>

        <div className="flex justify-end mt-4">
          <button
            onClick={onClose}
            className="w-24 py-1 bg-gray-300 text-gray-950 rounded hover:bg-gray-400 transition-colors"
          >
            Annuler
          </button>
        </div>
      </div>
    </div>
  );
}

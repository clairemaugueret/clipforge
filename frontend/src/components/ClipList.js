import { formatHumanDate } from "./utils/date";
import default_user from "./images/default_user.png";

/**
 * Composant affichant la liste des clips dans la barre latérale
 * Gère la sélection d'un clip et l'affichage des votes des experts
 *
 * @param {Array} clips - Liste des clips à afficher
 * @param {Function} onSelect - Callback appelé lors de la sélection d'un clip
 * @param {string} selectedClipId - ID du clip actuellement sélectionné (pour le highlighting)
 * @param {Array} users - Liste complète des utilisateurs (pour filtrer les experts)
 * @param {Object} expertVotes - Objet contenant les votes par clip { clipId: { username: "oui"/"non"/"à revoir" } }
 */
function ClipList({
  clips,
  onSelect,
  selectedClipId,
  users = [],
  expertVotes = {},
}) {
  // ============================================
  // FILTRAGE DES EXPERTS
  // ============================================

  /**
   * Filtre les utilisateurs pour ne garder que ceux ayant le rôle EXPERT
   * Ces experts auront leurs avatars affichés avec leur vote pour chaque clip
   */
  const experts = users.filter((u) => u.role === "EXPERT");

  // ============================================
  // FONCTION UTILITAIRE : COULEUR DU VOTE
  // ============================================

  /**
   * Détermine la classe CSS du ring coloré autour de l'avatar selon le vote
   *
   * @param {string} vote - Le vote de l'expert: "oui", "non", "à revoir" ou undefined
   * @returns {string} - Classes Tailwind pour le ring coloré
   */
  const borderColor = (vote) => {
    return vote === "oui"
      ? "ring-4 ring-green-500" // Vote positif = vert
      : vote === "non"
        ? "ring-4 ring-red-600" // Vote négatif = rouge
        : vote === "à revoir"
          ? "ring-4 ring-amber-400" // À revoir = ambre/jaune
          : "ring-transparent"; // Pas encore voté = transparent
  };

  // ============================================
  // RENDU DE LA LISTE
  // ============================================

  return (
    <ul className="divide-y">
      {clips.map((clip) => (
        <div
          key={clip.clip_id}
          onClick={() => onSelect(clip.clip_id)} // Sélectionne le clip au clic
          className={`px-4 py-3 cursor-pointer hover:bg-gray-600 ${
            selectedClipId === clip.clip_id ? "bg-gray-600" : "" // Highlight si sélectionné
          }`}
        >
          <div className="flex justify-between items-start">
            {/* ============================================
                PARTIE GAUCHE : Titre et auteur
                ============================================ */}
            <div>
              {/* Titre du clip avec indicateur brouillon si nécessaire */}
              <h3 className="text-white font-semibold flex items-center gap-2">
                {clip.subject}
                {clip.draft && (
                  <span className="text-xs text-yellow-500 px-2 py-0.5 rounded">
                    Brouillon
                  </span>
                )}
              </h3>

              {/* Nom de l'auteur */}
              <p className="text-xs text-gray-400">
                par {clip.authorId.username || "Inconnu"}
              </p>
            </div>

            {/* ============================================
                PARTIE DROITE : Date et avatars des experts avec votes
                ============================================ */}
            <div className="flex flex-col items-end gap-1">
              {/* Date de création du clip formatée de manière lisible */}
              <span className="text-xs text-gray-400 whitespace-nowrap">
                {formatHumanDate(clip.createdAt)}
              </span>

              {/* Avatars des experts avec indicateur de vote coloré */}
              <div className="flex gap-2 pr-2">
                {experts.map((user) => {
                  // Récupère le vote de cet expert pour ce clip
                  const vote = expertVotes[user.username];
                  return (
                    <img
                      key={user.username}
                      src={user.avatar_url || default_user} // Avatar ou image par défaut
                      alt={user.username}
                      title={user.username} // Tooltip au survol
                      className={`w-6 h-6 rounded-full ring-2 ${borderColor(vote)}`}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      ))}
    </ul>
  );
}

export default ClipList;

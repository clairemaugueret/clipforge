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
 */
function ClipList({ clips, onSelect, selectedClipId, users = [] }) {
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
   * @param {string} vote - Le vote de l'expert: "OK", "KO", "toReview" ou undefined
   * @returns {string} - Classes Tailwind pour le ring coloré
   */
  const borderColor = (vote) => {
    return vote === "OK"
      ? "ring-3 ring-green-500" // Vote positif = vert
      : vote === "KO"
        ? "ring-3 ring-red-600" // Vote négatif = rouge
        : vote === "toReview"
          ? "ring-3 ring-orange-500" // À revoir = orange
          : "ring-3 ring-gray-500"; // Pas encore voté = gris
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
                par {clip.authorId?.username || "Inconnu"}
              </p>

              <div className="flex justify-between items-center">
                {/* Status - toujours affiché */}
                {clip.status && (
                  <p className="text-xs text-gray-500 italic mt-1">
                    Statut: {clip.status}
                  </p>
                )}

                {/* Edition - affiché si editable = true OU s'il y a edit_progress */}
                {(clip.editable || clip.edit_progress) && (
                  <p className="text-xs text-gray-500 italic">
                    Édition: {clip.edit_progress || "EDITABLE"}
                  </p>
                )}
              </div>
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
                {experts.map((expert) => {
                  // Trouve le vote de cet expert dans clip.votes
                  const expertVote = clip.votes?.find(
                    (v) => v.userName === expert.username
                  );
                  const vote = expertVote?.result;

                  return (
                    <img
                      key={expert.username}
                      src={expert.avatar_url || default_user} // Avatar ou image par défaut
                      alt={expert.username}
                      title={expert.username} // Tooltip au survol
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

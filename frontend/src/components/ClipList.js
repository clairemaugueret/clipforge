import { formatHumanDate } from "./utils/date";
import {
  translateStatus,
  translateEditStatus,
  getStatusColor,
} from "./utils/translations";
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
  // FONCTIONS UTILITAIRES
  // ============================================

  /**
   * Détermine la classe CSS du ring coloré autour de l'avatar selon le vote
   *
   * @param {string} vote - Le vote de l'expert: "OK", "KO", "toReview" ou undefined
   * @returns {string} - Classes Tailwind pour le ring coloré
   */
  const borderColor = (vote) => {
    return vote === "OK"
      ? "ring-2 ring-green-500" // Vote positif = vert
      : vote === "KO"
        ? "ring-2 ring-red-600" // Vote négatif = rouge
        : vote === "toReview"
          ? "ring-2 ring-orange-500" // À revoir = orange
          : "ring-2 ring-gray-500"; // Pas encore voté = gris
  };

  /**
   * Détermine le statut d'édition à afficher pour un clip
   * Utilise la fonction translateEditStatus du fichier translations
   */
  const getEditStatusLabel = (clip) => {
    return translateEditStatus(clip);
  };

  // ============================================
  // RENDU DE LA LISTE
  // ============================================

  return (
    <ul className="divide-y divide-gray-700">
      {clips.map((clip) => (
        <li
          key={clip.clip_id}
          onClick={() => onSelect(clip.clip_id)} // Sélectionne le clip au clic
          className={`px-2 sm:px-3 py-2 sm:py-2.5 cursor-pointer transition-colors border-l-4 ${
            clip.status === "READY"
              ? "border-green-500 bg-green-900/20"
              : "border-transparent"
          } ${
            selectedClipId === clip.clip_id
              ? "bg-gray-600"
              : "hover:bg-gray-700 active:bg-gray-600"
          }`}
        >
          {/* Layout principal */}
          <div className="flex items-start justify-between gap-2">
            {/* ============================================
                PARTIE GAUCHE : Titre, auteur et infos
                ============================================ */}
            <div className="flex-1 min-w-0">
              {/* Titre du clip avec indicateur brouillon */}
              <div className="flex items-center gap-1.5 mb-0.5">
                <h3
                  className={`font-medium text-xs sm:text-sm truncate ${
                    clip.status === "READY"
                      ? "text-green-400 font-bold"
                      : "text-white"
                  }`}
                >
                  {clip.subject || "Nouveau clip"}
                </h3>
                {clip.draft && (
                  <span className="text-[9px] sm:text-[10px] bg-yellow-600 text-white px-1.5 py-0.5 rounded-full whitespace-nowrap font-semibold">
                    DRAFT
                  </span>
                )}
                {clip.status === "READY" && (
                  <span className="text-[9px] sm:text-[10px] bg-green-600 text-white px-1.5 py-0.5 rounded-full whitespace-nowrap font-semibold animate-pulse">
                    ✓ PRÊT
                  </span>
                )}
              </div>

              {/* Auteur */}
              <p className="text-[10px] sm:text-xs text-gray-400 truncate mb-1">
                par {clip.authorId?.username || "Inconnu"}
              </p>

              {/* Ligne d'infos : Status + Edition + Date */}
              <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[9px] sm:text-[10px] text-gray-500">
                {/* Status */}
                {clip.status && (
                  <span className="flex items-center gap-1">
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        clip.status === "READY"
                          ? "bg-green-500"
                          : clip.status === "DISCARDED"
                            ? "bg-red-500"
                            : clip.status === "PUBLISHED"
                              ? "bg-blue-500"
                              : clip.status === "ARCHIVED_PUBLISHED"
                                ? "bg-gray-600"
                                : clip.status === "ARCHIVED_DISCARDED"
                                  ? "bg-red-800/60"
                                  : "bg-yellow-500"
                      }`}
                    ></span>
                    {translateStatus(clip.status)}
                  </span>
                )}

                {/* Séparateur si status existe */}
                {clip.status && (clip.editable || clip.edit_progress) && (
                  <span className="text-gray-600">•</span>
                )}

                {/* Edition */}
                {(clip.editable || clip.edit_progress) &&
                  getEditStatusLabel(clip) && (
                    <span className="flex items-center gap-1">
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          clip.edit_progress === "IN_PROGRESS"
                            ? "bg-yellow-500"
                            : clip.edit_progress === "TERMINATED"
                              ? "bg-lime-500"
                              : "bg-orange-500"
                        }`}
                      ></span>
                      {getEditStatusLabel(clip)}
                    </span>
                  )}

                {/* Séparateur avant la date */}
                {(clip.status || clip.editable || clip.edit_progress) && (
                  <span className="text-gray-600">•</span>
                )}

                {/* Date */}
                <span className="text-gray-400">
                  {formatHumanDate(clip.createdAt)}
                </span>
              </div>
            </div>

            {/* ============================================
                PARTIE DROITE : Avatars des experts
                ============================================ */}
            <div className="flex gap-1 sm:gap-1.5 flex-shrink-0">
              {experts.map((expert) => {
                // Trouve le vote de cet expert dans clip.votes
                const expertVote = Array.isArray(clip.votes)
                  ? clip.votes.find((v) => v.userName === expert.username)
                  : undefined;
                const vote = expertVote?.result;

                return (
                  <img
                    key={expert.username}
                    src={expert.avatar_url || default_user}
                    alt={expert.username}
                    title={`${expert.username} - ${vote || "Pas encore voté"}`}
                    className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full ${borderColor(vote)}`}
                  />
                );
              })}
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}

export default ClipList;

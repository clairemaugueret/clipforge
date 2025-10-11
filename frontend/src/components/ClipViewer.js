import { useState } from "react";
import { formatHumanDate } from "./utils/date";
import { translateStatus, translateEditStatus } from "./utils/translations";
import VoteModale from "./utils/VoteModal";
import default_user from "./images/default_user.png";

/**
 * Composant principal d'affichage détaillé d'un clip
 * Gère l'affichage des informations, des votes experts, et des commentaires
 * Permet aussi la modification et suppression du clip
 *
 * @param {Object} clip - Le clip à afficher avec toutes ses données
 * @param {Array} users - Liste complète des utilisateurs
 * @param {Object} user - Utilisateur connecté avec token
 * @param {Function} onModifyClip - Callback pour passer en mode édition
 * @param {Function} onDeleteClip - Callback pour supprimer le clip
 * @param {Function} onClipUpdate - Callback pour mettre à jour le clip dans App.js
 * @param {Function} showAlert - Fonction pour afficher les alertes
 */
function ClipViewer({
  clip,
  users = [],
  user,
  onModifyClip,
  onDeleteClip,
  onClipUpdate,
  showAlert,
}) {
  const BACK_URL = process.env.REACT_APP_BACK_URL;

  // ============================================
  // ÉTATS LOCAUX DU COMPOSANT
  // ============================================

  // Contenu du champ de saisie pour ajouter un commentaire
  const [commentInput, setCommentInput] = useState("");

  // Affichage de la modale de vote expert
  const [showVoteModal, setShowVoteModal] = useState(false);

  // ============================================
  // FILTRAGE DES UTILISATEURS
  // ============================================

  /**
   * Sépare les utilisateurs par rôle
   * EXPERTS : affichés en premier
   * USERS : affichés ensuite
   */
  const experts = users.filter((u) => u.role === "EXPERT");
  const regularUsers = users.filter((u) => u.role === "USER");

  // ============================================
  // GESTION DES COMMENTAIRES
  // ============================================

  /**
   * Ajoute un nouveau commentaire au clip
   */
  const addComment = async () => {
    if (!commentInput.trim()) return;

    try {
      const response = await fetch(`${BACK_URL}/clipmanager/clips/addcomment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token: user?.token,
          clipId: clip.clip_id,
          text: commentInput.trim(),
        }),
      });

      const data = await response.json();

      if (data.result) {
        // Mise à jour réussie
        onClipUpdate?.(data.clip);
        setCommentInput("");
      } else {
        console.error("Erreur lors de l'ajout du commentaire:", data.error);
        showAlert({
          type: "error",
          title: "Erreur de commentaire",
          message: "Erreur lors de l'ajout du commentaire",
        });
      }
    } catch (error) {
      console.error("Erreur réseau:", error);
      showAlert({
        type: "error",
        title: "Erreur de connexion",
        message: "Erreur de connexion au serveur",
      });
    }
  };

  // ============================================
  // GESTION DES VOTES
  // ============================================

  /**
   * Gère la mise à jour du clip après un vote réussi
   * Convertit les votes du backend vers le format attendu par l'interface
   *
   * @param {Object} updatedClip - Le clip mis à jour renvoyé par le backend
   */
  const handleVoteSuccess = (updatedClip) => {
    // Met à jour le clip dans App.js
    onClipUpdate?.(updatedClip);
    setShowVoteModal(false);
  };

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
      ? "ring-4 ring-green-500" // Vote positif = vert
      : vote === "KO"
        ? "ring-4 ring-red-600" // Vote négatif = rouge
        : vote === "toReview"
          ? "ring-4 ring-orange-500" // À revoir = orange
          : "ring-4 ring-gray-500"; // Pas encore voté = gris
  };

  // ============================================
  // GESTION DE LA SUPPRESSION
  // ============================================

  const handleDeleteClick = () => {
    showAlert({
      type: "confirm",
      title: "Supprimer ce clip ?",
      message: "Cette action est irréversible.",
      showCancel: true,
      confirmText: "Supprimer",
      cancelText: "Annuler",
      onConfirm: () => {
        onDeleteClip?.(clip.clip_id);
      },
    });
  };

  // ============================================
  // GESTION DE L'EDITION D'UN CLIP À EDITER
  // ============================================

  const handleEditClaimClick = () => {
    showAlert({
      type: "confirm",
      title: "Prendre en charge l'édition",
      message: "Souhaites-tu prendre en charge l'édition de ce clip ?",
      showCancel: true,
      confirmText: "Je prends !",
      cancelText: "Annuler",
      onConfirm: handleEditStart,
    });
  };

  const handleEditStart = async () => {
    try {
      const response = await fetch(`${BACK_URL}/clipmanager/clips/editstart`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: user.token,
          clipId: clip.clip_id,
        }),
      });

      const data = await response.json();

      if (data.result) {
        // Mettre à jour le clip dans App.js
        if (onClipUpdate) {
          onClipUpdate(data.clip);
        }
        showAlert({
          type: "success",
          title: "Édition prise en charge",
          message: "Tu as pris en charge l'édition de ce clip",
        });
      } else {
        console.error("Erreur lors de la prise en charge:", data.error);
        showAlert({
          type: "error",
          title: "Erreur de prise en charge",
          message: data.error || "Impossible de prendre en charge l'édition",
        });
      }
    } catch (error) {
      console.error("Erreur réseau:", error);
      showAlert({
        type: "error",
        title: "Erreur de connexion",
        message: "Erreur lors de la communication avec le serveur",
      });
    }
  };

  const handleEditEnd = async () => {
    showAlert({
      type: "confirm",
      title: "Terminer l'édition",
      message: "Confirmer que l'édition de ce clip est terminée ?",
      showCancel: true,
      confirmText: "Oui, c'est fini !",
      cancelText: "Annuler",
      onConfirm: async () => {
        try {
          const response = await fetch(
            `${BACK_URL}/clipmanager/clips/editend`,
            {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                token: user.token,
                clipId: clip.clip_id,
              }),
            }
          );

          const data = await response.json();

          if (data.result) {
            // Mettre à jour le clip dans App.js
            if (onClipUpdate) {
              onClipUpdate(data.clip);
            }
            showAlert({
              type: "success",
              title: "Édition terminée",
              message: "L'édition du clip est maintenant terminée",
            });
          } else {
            console.error("Erreur lors de la fin d'édition:", data.error);
            showAlert({
              type: "error",
              title: "Erreur de fin d'édition",
              message: data.error || "Impossible de terminer l'édition",
            });
          }
        } catch (error) {
          console.error("Erreur réseau:", error);
          showAlert({
            type: "error",
            title: "Erreur de connexion",
            message: "Erreur lors de la communication avec le serveur",
          });
        }
      },
    });
  };

  // ============================================
  // GESTION DE LA PUBLICATION DU CLIP
  // ============================================

  const handlePublishClick = () => {
    showAlert({
      type: "confirm",
      title: "Marquer comme publié",
      message: "Confirmer que ce clip a été publié sur TikTok ?",
      showCancel: true,
      confirmText: "Oui, publié",
      cancelText: "Annuler",
      onConfirm: handlePublished,
    });
  };

  const handlePublished = async () => {
    try {
      const response = await fetch(`${BACK_URL}/clipmanager/clips/published`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: user.token,
          clipId: clip.clip_id,
        }),
      });

      const data = await response.json();

      if (data.result) {
        // Mettre à jour le clip dans App.js
        if (onClipUpdate) {
          onClipUpdate(data.clip);
        }
        showAlert({
          type: "success",
          title: "Clip publié",
          message: "Le clip a été marqué comme publié sur TikTok !",
        });
      } else {
        console.error("Erreur lors de la publication:", data.error);
        showAlert({
          type: "error",
          title: "Erreur de publication",
          message: data.error || "Impossible de marquer le clip comme publié",
        });
      }
    } catch (error) {
      console.error("Erreur réseau:", error);
      showAlert({
        type: "error",
        title: "Erreur de connexion",
        message: "Erreur lors de la communication avec le serveur",
      });
    }
  };

  // ============================================
  // RENDU DU COMPOSANT
  // ============================================

  return (
    <div className="h-full flex flex-col text-white">
      {/* ============================================
          SECTION SUPÉRIEURE : Informations du clip (scrollable)
          ============================================ */}
      <div className="overflow-auto px-2 sm:px-4">
        {/* Titre du clip */}
        <h2 className="text-2xl sm:text-3xl mb-2 font-bold text-gray-200">
          {clip.subject}
        </h2>

        {/* Métadonnées : auteur et date */}
        <p className="text-xs sm:text-sm mb-4 sm:mb-6 text-gray-400">
          Par {clip.authorId.username || "Inconnu"} •{" "}
          {new Date(clip.createdAt).toLocaleDateString("fr-FR")}
        </p>

        {/* Tags du clip */}
        <div className="flex flex-wrap mb-3 sm:mb-4 gap-1.5 sm:gap-2 my-2">
          {clip.tags.map((tag) => (
            <span
              key={tag}
              className="px-2 py-0.5 sm:py-1 text-xs sm:text-sm bg-gray-200 rounded-full text-gray-700"
            >
              #{tag}
            </span>
          ))}
        </div>

        {/* Affichage du statut si différent de PROPOSED avec bouton publication */}
        {clip.status && clip.status !== "PROPOSED" && (
          <div className="mb-4 sm:mb-6 flex flex-wrap items-center gap-2 sm:gap-3">
            <span
              className={`inline-block px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-semibold ${
                clip.status === "READY"
                  ? "bg-green-600 text-white"
                  : clip.status === "DISCARDED"
                    ? "bg-red-600 text-white"
                    : clip.status === "PUBLISHED"
                      ? "bg-blue-600 text-white"
                      : clip.status === "ARCHIVED_PUBLISHED"
                        ? "bg-gray-600 text-white"
                        : clip.status === "ARCHIVED_DISCARDED"
                          ? "bg-red-800/60 text-white"
                          : "bg-yellow-600 text-white"
              }`}
            >
              Statut : {translateStatus(clip.status)}
            </span>

            {/* Bouton de publication si statut READY et utilisateur EXPERT */}
            {clip.status === "READY" && user.role === "EXPERT" && (
              <>
                <div className="hidden sm:block">📜</div>
                <button
                  onClick={handlePublishClick}
                  className="text-xs sm:text-sm px-2 sm:px-3 py-1 border-2 border-green-600 text-white bg-transparent rounded font-medium hover:bg-green-600 active:bg-green-700 transition-colors"
                >
                  📤 Clip publié sur TikTok
                </button>
              </>
            )}
          </div>
        )}

        {/* ============================================
            BARRE D'ACTIONS : Layout ultra-responsive
            ============================================ */}
        <div className="flex flex-col gap-2 sm:gap-3 mb-4">
          {/* LIGNE 1 : Boutons d'action (Modifier/Supprimer) + Voter sur mobile */}
          <div className="flex flex-wrap gap-2">
            {/* Boutons Modifier et Supprimer - affichés uniquement pour l'auteur */}
            {user.username === clip.authorId.username && (
              <>
                <button
                  onClick={onModifyClip}
                  className="text-xs px-2 py-1.5 text-white rounded font-medium flex-1 min-w-[80px] bg-gray-500 hover:bg-gray-600 cursor-pointer"
                  title="Clique pour modifier les infos du clip"
                >
                  ✏️ Modifier
                </button>

                <button
                  onClick={handleDeleteClick}
                  className="text-xs px-2 py-1.5 text-white rounded font-medium flex-1 min-w-[80px] bg-red-700 hover:bg-red-800 cursor-pointer"
                  title="Clique pour supprimer cette proposition"
                >
                  🗑️ Supprimer
                </button>
              </>
            )}

            {/* Bouton Voter - visible sur mobile, caché sur desktop */}
            {clip.status !== "ARCHIVED_PUBLISHED" && (
              <button
                onClick={() => setShowVoteModal(true)}
                className={`lg:hidden text-xs px-3 py-1.5 bg-indigo-500 text-white rounded hover:bg-indigo-600 font-medium ${
                  user.username === clip.authorId.username
                    ? "flex-1 min-w-[80px]"
                    : "w-full"
                }`}
              >
                🗳️ Voter
              </button>
            )}
          </div>

          {/* LIGNE 2 : Statut d'édition (si applicable) */}
          {(clip.editable || clip.edit_progress) && (
            <div className="flex items-center">
              {clip.editable && !clip.edit_progress && (
                <button
                  onClick={handleEditClaimClick}
                  className="text-xs px-2 py-1.5 bg-orange-500 text-white rounded hover:bg-orange-600 font-medium w-full"
                >
                  🎬 {translateEditStatus(clip)} → Prendre en charge ?
                </button>
              )}

              {clip.edit_progress === "IN_PROGRESS" && clip.editorId && (
                <button
                  onClick={handleEditEnd}
                  disabled={user.username !== clip.editorId.username}
                  className={`text-xs px-2 py-1.5 text-white rounded font-medium w-full ${
                    user.username === clip.editorId.username
                      ? "bg-yellow-500 hover:bg-yellow-600 cursor-pointer"
                      : "bg-yellow-600 cursor-not-allowed opacity-75"
                  }`}
                  title={
                    user.username === clip.editorId.username
                      ? "Clique pour terminer l'édition"
                      : "Seul l'éditeur peut terminer l'édition"
                  }
                >
                  ⏳ {translateEditStatus(clip)} par {clip.editorId.username}
                </button>
              )}

              {clip.edit_progress === "TERMINATED" && clip.editorId && (
                <div className="text-xs px-2 py-1.5 bg-lime-600 text-white rounded font-medium w-full text-center">
                  ✅ {translateEditStatus(clip)} par {clip.editorId.username}
                </div>
              )}
            </div>
          )}

          {/* LIGNE 3 : Avatars des votants + Bouton Voter (desktop uniquement) */}
          <div className="flex items-center justify-between gap-3">
            {/* Section avatars */}
            <div className="flex-1 flex flex-col gap-2">
              {/* Avatars des EXPERTS */}
              {experts.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                  {experts.map((expert) => {
                    const expertVote = Array.isArray(clip.votes)
                      ? clip.votes.find((v) => v.userName === expert.username)
                      : undefined;
                    const vote = expertVote?.result;

                    return (
                      <img
                        key={expert.username}
                        src={expert.avatar_url || default_user}
                        alt={expert.username}
                        title={`${expert.username} (EXPERT)`}
                        className={`w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full ${borderColor(vote)}`}
                      />
                    );
                  })}
                </div>
              )}

              {/* Avatars des USERS */}
              {regularUsers.length > 0 && (
                <div className="flex flex-wrap items-center gap-1 sm:gap-1.5">
                  {regularUsers.map((regularUser) => {
                    const userVote = Array.isArray(clip.votes)
                      ? clip.votes.find(
                          (v) => v.userName === regularUser.username
                        )
                      : undefined;
                    const vote = userVote?.result;

                    return (
                      <img
                        key={regularUser.username}
                        src={regularUser.avatar_url || default_user}
                        alt={regularUser.username}
                        title={`${regularUser.username} (USER)`}
                        className={`w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 rounded-full ${borderColor(vote)}`}
                      />
                    );
                  })}
                </div>
              )}
            </div>

            {/* Bouton Voter - visible uniquement sur desktop */}
            {clip.status !== "ARCHIVED_PUBLISHED" && (
              <button
                onClick={() => setShowVoteModal(true)}
                className="hidden lg:block text-xs px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600 font-medium whitespace-nowrap"
              >
                🗳️ Voter
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ============================================
          SECTION INFÉRIEURE : Commentaires (compact et responsive)
          ============================================ */}
      <div className="mt-auto px-2 sm:px-4 pb-2">
        <h3 className="text-xs sm:text-sm font-semibold text-gray-200 mb-1 flex items-center gap-1.5">
          💬 Commentaires
          <span className="text-[10px] sm:text-xs text-gray-400 font-normal">
            ({clip.comments?.length || 0})
          </span>
        </h3>

        {/* Zone scrollable des commentaires existants */}
        <div className="h-[120px] sm:h-[140px] md:h-[160px] lg:h-[180px] overflow-y-auto bg-gray-900 p-1.5 sm:p-2 rounded-md shadow-inner border border-gray-700 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
          {(clip.comments?.length ?? 0) === 0 ? (
            // Message si aucun commentaire
            <p className="text-gray-500 text-[11px] sm:text-xs italic text-center py-4">
              Aucun commentaire pour le moment
            </p>
          ) : (
            // Liste des commentaires
            <ul className="space-y-1 sm:space-y-1.5">
              {clip.comments.map((c, i) => (
                <li
                  key={i}
                  className="text-[11px] sm:text-xs bg-gray-100 p-1.5 rounded text-gray-800"
                >
                  {/* Texte du commentaire */}
                  <div className="break-words leading-tight mb-0.5">
                    {c.text}
                  </div>
                  {/* Métadonnées du commentaire */}
                  <div className="text-gray-500 text-[9px] sm:text-[10px] flex items-center gap-1">
                    <span className="font-medium">{c.userName}</span>
                    <span className="opacity-60">•</span>
                    <span className="opacity-75">
                      {formatHumanDate(c.createdAt)}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Champ d'ajout de commentaire */}
        <div className="mt-1.5 sm:mt-2 flex gap-1.5">
          <input
            type="text"
            value={commentInput}
            onChange={(e) => setCommentInput(e.target.value)}
            onKeyDown={(e) => {
              // Permet d'envoyer avec la touche Entrée
              if (e.key === "Enter") {
                e.preventDefault();
                addComment();
              }
            }}
            placeholder="Écrire un commentaire..."
            className="flex-1 p-1.5 sm:p-2 border border-gray-600 rounded text-gray-950 text-[11px] sm:text-xs placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />

          <button
            onClick={addComment}
            className="px-2 sm:px-3 py-1.5 bg-indigo-500 text-white rounded hover:bg-indigo-600 active:bg-indigo-700 font-medium text-[11px] sm:text-xs whitespace-nowrap transition-colors"
            title="Envoyer le commentaire (ou appuyez sur Entrée)"
          >
            ➤
          </button>
        </div>
      </div>

      {/* ============================================
          MODALES : Affichées conditionnellement
          ============================================ */}

      {/* Modale de vote pour les experts */}
      {showVoteModal && (
        <VoteModale
          user={user}
          clip={clip}
          onVote={handleVoteSuccess}
          onClose={() => setShowVoteModal(false)}
          showAlert={showAlert}
        />
      )}
    </div>
  );
}

export default ClipViewer;

import { useState } from "react";
import { formatHumanDate } from "./utils/date";
import ExpertVoteModale from "./utils/vote";
import EditClaimModal from "./utils/EditClaimModal";
import ConfirmDeleteModal from "./utils/ConfirmDeleteModal";
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
 */
export default function ClipViewer({
  clip,
  users = [],
  user,
  onModifyClip,
  onDeleteClip,
  onClipUpdate,
}) {
  const BACK_URL = process.env.REACT_APP_BACK_URL;

  // ============================================
  // ÉTATS LOCAUX DU COMPOSANT
  // ============================================

  // Contenu du champ de saisie pour ajouter un commentaire
  const [commentInput, setCommentInput] = useState("");

  // Affichage de la modale de vote expert
  const [showVoteModal, setShowVoteModal] = useState(false);

  // Affichage de la modale de confirmation de suppression
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Affichage de la modale de prise en charge de l'édition
  const [showEditModal, setShowEditModal] = useState(false);

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
        alert("Erreur lors de l'ajout du commentaire");
      }
    } catch (error) {
      console.error("Erreur réseau:", error);
      alert("Erreur de connexion au serveur");
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
  // GESTION DE L'EDITION D'UN CLIP À EDITER
  // ============================================

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
        setShowEditModal(false);
      } else {
        console.error("Erreur lors de la prise en charge:", data.error);
        alert(`Erreur: ${data.error}`);
      }
    } catch (error) {
      console.error("Erreur réseau:", error);
      alert("Erreur lors de la communication avec le serveur");
    }
  };

  const handleEditEnd = async () => {
    try {
      const response = await fetch(`${BACK_URL}/clipmanager/clips/editend`, {
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
      } else {
        console.error("Erreur lors de la fin d'édition:", data.error);
        alert(`Erreur: ${data.error}`);
      }
    } catch (error) {
      console.error("Erreur réseau:", error);
      alert("Erreur lors de la communication avec le serveur");
    }
  };

  // ============================================
  // GESTION DE LA PUBLICATION DU CLIP
  // ============================================

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
        alert("✅ Clip marqué comme publié sur TikTok !");
      } else {
        console.error("Erreur lors de la publication:", data.error);
        alert(`Erreur: ${data.error}`);
      }
    } catch (error) {
      console.error("Erreur réseau:", error);
      alert("Erreur lors de la communication avec le serveur");
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
      <div className="overflow-auto px-2">
        {/* Titre du clip */}
        <h2 className="text-3xl mb-2 font-bold text-gray-200">
          {clip.subject}
        </h2>

        {/* Métadonnées : auteur et date */}
        <p className="text-sm mb-6 text-gray-400">
          Par {clip.authorId.username || "Inconnu"} —{" "}
          {new Date(clip.createdAt).toLocaleDateString("fr-FR")}
        </p>

        {/* Tags du clip */}
        <div className="flex flex-wrap mb-4 gap-2 my-2">
          {clip.tags.map((tag) => (
            <span
              key={tag}
              className="px-2 py-1 text-sm bg-gray-200 rounded-full text-gray-700"
            >
              #{tag}
            </span>
          ))}
        </div>

        {/* Affichage du statut si différent de PROPOSED avec bouton publication */}
        {clip.status && clip.status !== "PROPOSED" && (
          <div className="mb-6 flex items-center gap-3">
            <span
              className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                clip.status === "READY"
                  ? "bg-green-600 text-white"
                  : clip.status === "DISCARDED"
                    ? "bg-red-600 text-white"
                    : clip.status === "PUBLISHED"
                      ? "bg-blue-600 text-white"
                      : clip.status === "ARCHIVED"
                        ? "bg-gray-600 text-white"
                        : "bg-yellow-600 text-white"
              }`}
            >
              Statut : {clip.status}
            </span>

            {/* Bouton de publication si statut READY */}
            {clip.status === "READY" && (
              <>
                <div>🔜</div>
                <button
                  onClick={handlePublished}
                  className="text-sm px-3 py-1 border-2 border-green-600 text-white bg-transparent rounded font-medium hover:bg-green-600 active:bg-green-700 transition-colors"
                >
                  📤 Clip publié sur TikTok
                </button>
              </>
            )}
          </div>
        )}

        {/* ============================================
            BARRE D'ACTIONS : 3 colonnes
            ============================================ */}
        <div className="grid auto-cols-auto grid-flow-col items-center gap-4">
          {/* COLONNE 1 : Boutons Modifier et Supprimer */}
          <div className="flex justify-start gap-2">
            <button
              onClick={onModifyClip}
              disabled={user.username !== clip.authorId.username}
              className={`text-sm px-3 py-1 text-white rounded font-medium ${
                user.username === clip.authorId.username
                  ? "bg-gray-500 hover:bg-gray-500 cursor-pointer "
                  : "bg-gray-600 cursor-not-allowed opacity-75"
              }`}
              title={
                user.username === clip.authorId.username
                  ? "Clique pour modifier les infos du clip"
                  : "Seul l'auteur de la proposition peut la modifier"
              }
            >
              Modifier
            </button>

            <button
              onClick={() => setShowDeleteModal(true)}
              disabled={user.username !== clip.authorId.username}
              className={`text-sm px-3 py-1 text-white rounded font-medium ${
                user.username === clip.authorId.username
                  ? "bg-red-700 hover:bg-red-800 cursor-pointer "
                  : "bg-red-700 cursor-not-allowed opacity-75"
              }`}
              title={
                user.username === clip.authorId.username
                  ? "Clique pour supprimer cette proposition"
                  : "Seul l'auteur de la proposition peut la supprimer"
              }
            >
              Supprimer
            </button>
          </div>

          {/* COLONNE 2 : Statut d'édition */}
          <div className="flex justify-center items-center gap-2">
            {clip.editable && !clip.edit_progress && (
              <button
                onClick={() => setShowEditModal(true)}
                className="text-sm px-3 py-1 bg-orange-500 text-white rounded hover:bg-orange-600 font-medium"
              >
                À éditer → Prendre en charge l'édition
              </button>
            )}

            {clip.edit_progress === "IN_PROGRESS" && clip.editorId && (
              <button
                onClick={handleEditEnd}
                disabled={user.username !== clip.editorId.username}
                className={`text-sm px-3 py-1 text-white rounded font-medium ${
                  user.username === clip.editorId.username
                    ? "bg-yellow-500 hover:bg-yellow-600 cursor-pointer "
                    : "bg-yellow-600 cursor-not-allowed opacity-75"
                }`}
                title={
                  user.username === clip.editorId.username
                    ? "Clique pour terminer l'édition"
                    : "Seul l'éditeur peut terminer l'édition"
                }
              >
                <span>En cours d'édition par {clip.editorId.username}</span>
              </button>
            )}

            {clip.edit_progress === "TERMINATED" && clip.editorId && (
              <div className="text-sm px-3 py-1 bg-lime-600 rounded font-medium flex items-center gap-2">
                <span>Édition terminée par {clip.editorId.username}</span>
              </div>
            )}

            {/* Modale de confirmation pour prendre en charge l'édition */}
            {showEditModal && (
              <EditClaimModal
                onCancel={() => setShowEditModal(false)}
                onConfirm={handleEditStart}
              />
            )}
          </div>

          {/* COLONNE 3 : Bouton Voter et avatars de tous les utilisateurs */}
          <div className="flex justify-end items-center gap-3 h-full">
            <button
              onClick={() => setShowVoteModal(true)}
              className="px-3 py-1 bg-indigo-500 text-white rounded hover:bg-indigo-600 text-sm"
            >
              Voter
            </button>

            {/* Section des votes */}
            <div className="flex flex-col gap-3 mb-2 ">
              {/* Avatars des EXPERTS avec indicateur de vote */}
              <div className="flex gap-3">
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
                      title={`${expert.username} (EXPERT)`}
                      className={`w-14 h-14 rounded-full ring-2 ${borderColor(vote)}`}
                    />
                  );
                })}
              </div>

              {/* Avatars des USERS avec indicateur de vote */}
              {regularUsers.length > 0 && (
                <div className="flex gap-2">
                  {regularUsers.map((regularUser) => {
                    // Trouve le vote de cet utilisateur dans clip.votes
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
                        className={`w-10 h-10 rounded-full ring-2 ${borderColor(vote)}`}
                      />
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ============================================
          SECTION INFÉRIEURE : Commentaires (fixe en bas)
          ============================================ */}
      <div className="mt-auto">
        <h3 className="text-lg font-semibold text-gray-200 mb-1">
          Commentaires
        </h3>

        {/* Zone scrollable des commentaires existants */}
        <div className="h-[375px] overflow-y-auto bg-gray-900 p-4 rounded-md shadow-inner border-t border-gray-700 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
          {(clip.comments?.length ?? 0) === 0 ? (
            // Message si aucun commentaire
            <p className="text-gray-400 text-sm">Aucun commentaire encore.</p>
          ) : (
            // Liste des commentaires
            <ul className="space-y-2 mb-4">
              {clip.comments.map((c, i) => (
                <li
                  key={i}
                  className="text-sm bg-gray-100 p-2 rounded text-gray-800"
                >
                  {/* Texte du commentaire */}
                  <div>{c.text}</div>
                  {/* Métadonnées du commentaire */}
                  <div className="text-gray-500 text-xs">
                    — {c.userName}, {formatHumanDate(c.createdAt)}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Champ d'ajout de commentaire */}
        <div className="mt-4 flex gap-2">
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
            placeholder="Ajouter un commentaire..."
            className="flex-1 p-2 border rounded text-gray-950"
          />

          <button
            onClick={addComment}
            className="px-3 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600 font-medium"
          >
            Envoyer
          </button>
        </div>
      </div>

      {/* ============================================
          MODALES : Affichées conditionnellement
          ============================================ */}

      {/* Modale de vote pour les experts */}
      {showVoteModal && (
        <ExpertVoteModale
          user={user}
          clip={clip}
          onVote={handleVoteSuccess}
          onClose={() => setShowVoteModal(false)}
        />
      )}

      {/* Modale de confirmation de suppression */}
      {showDeleteModal && (
        <ConfirmDeleteModal
          onConfirm={() => {
            onDeleteClip?.(clip.clip_id); // Supprime le clip via le callback parent
            setShowDeleteModal(false);
          }}
          onCancel={() => setShowDeleteModal(false)}
        />
      )}
    </div>
  );
}

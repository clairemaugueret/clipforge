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
 * @param {Object} expertVotes - Votes des experts pour ce clip { username: "oui"/"non"/"à revoir" }
 * @param {Function} onExpertVote - Callback pour enregistrer un vote
 * @param {Function} onEditClip - Callback pour passer en mode édition
 * @param {Function} onDeleteClip - Callback pour supprimer le clip
 */
export default function ClipViewer({
  clip,
  users = [],
  expertVotes = {},
  onExpertVote,
  onEditClip,
  onDeleteClip,
}) {
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

  // Pseudo de l'expert qui est en train de voter (pour passer à la modale)
  const [votingExpertPseudo, setVotingExpertPseudo] = useState(null);

  // État non utilisé actuellement (pourrait servir pour un futur feature)
  const [editClicked, setEditClicked] = useState(false);

  // ============================================
  // FILTRAGE DES EXPERTS
  // ============================================

  /**
   * Extrait uniquement les utilisateurs ayant le rôle EXPERT
   * Ces experts peuvent voter sur les clips
   */
  const experts = users.filter((u) => u.role === "EXPERT");

  // ============================================
  // GESTION DES COMMENTAIRES
  // ============================================

  /**
   * Ajoute un nouveau commentaire au clip
   * TODO: Actuellement ne fait que créer l'objet localement, il faut l'envoyer au backend
   */
  const addComment = () => {
    if (!commentInput.trim()) return; // Ne rien faire si le commentaire est vide

    const newComment = {
      user: "Moi",
      text: commentInput.trim(),
      date: new Date(),
    };

    // TODO: Envoyer au backend via une requête POST
    // fetch(...).then(...)

    setCommentInput(""); // Vide le champ de saisie
  };

  // ============================================
  // GESTION DES VOTES
  // ============================================

  /**
   * Enregistre le vote d'un expert et ferme la modale
   *
   * @param {string} pseudo - Le pseudo de l'expert qui vote
   * @param {string} vote - Le vote: "oui", "non" ou "à revoir"
   */
  const handleVote = (pseudo, vote) => {
    onExpertVote?.(pseudo, vote); // Appelle le callback parent (? = optional chaining)
    setShowVoteModal(false); // Ferme la modale
    setVotingExpertPseudo(null); // Réinitialise l'expert en cours de vote
  };

  // ============================================
  // FONCTION UTILITAIRE : COULEUR DU VOTE
  // ============================================

  /**
   * Détermine la classe CSS du ring coloré autour de l'avatar selon le vote
   *
   * @param {string} vote - Le vote de l'expert
   * @returns {string} - Classes Tailwind pour le ring coloré
   */
  const borderColor = (vote) => {
    return vote === "oui"
      ? "ring-4 ring-green-500" // Vote positif = vert
      : vote === "non"
        ? "ring-4 ring-red-600" // Vote négatif = rouge
        : vote === "à revoir"
          ? "ring-4 ring-amber-400" // À revoir = ambre
          : "ring-transparent"; // Pas encore voté = transparent
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
        <div className="flex flex-wrap mb-8 gap-2 my-2">
          {clip.tags.map((tag) => (
            <span
              key={tag}
              className="px-2 py-1 text-sm bg-gray-200 rounded-full text-gray-700"
            >
              #{tag}
            </span>
          ))}
        </div>

        {/* ============================================
            BARRE D'ACTIONS : 3 colonnes
            ============================================ */}
        <div className="grid grid-cols-3 items-center mb-6 px-2">
          {/* COLONNE 1 : Boutons Modifier et Supprimer */}
          <div className="flex justify-start">
            <button
              onClick={onEditClip}
              className="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700 text-sm"
            >
              Modifier
            </button>

            <button
              onClick={() => setShowDeleteModal(true)}
              className="px-3 py-1 ml-4 bg-red-700 text-white rounded hover:bg-red-800 text-sm"
            >
              Supprimer
            </button>
          </div>

          {/* COLONNE 2 : Indicateur "À éditer" (si applicable) */}
          <div className="flex justify-left">
            {clip.editable && (
              <button
                onClick={() => setShowEditModal(true)}
                className="text-m px-3 bg-amber-600 rounded hover:bg-amber-700 font-medium"
              >
                À éditer
              </button>
            )}

            {/* Modale de confirmation pour prendre en charge l'édition */}
            {showEditModal && (
              <EditClaimModal
                onCancel={() => setShowEditModal(false)}
                onConfirm={() => {
                  setShowEditModal(false);
                  // TODO: logique à ajouter ici : prise en charge de l'édition
                  // Pourrait mettre à jour le clip pour assigner un éditeur
                }}
              />
            )}
          </div>

          {/* COLONNE 3 : Bouton Voter et avatars des experts */}
          <div className="flex justify-end items-center gap-3 h-full">
            <button
              onClick={() => {
                // TODO: À adapter pour récupérer le vrai utilisateur connecté
                setVotingExpertPseudo("Boubou"); // Hardcodé pour l'instant
                setShowVoteModal(true);
              }}
              className="px-3 py-1 bg-indigo-500 text-white rounded hover:bg-indigo-600 text-sm"
            >
              Voter
            </button>

            {/* Avatars des experts avec indicateur de vote */}
            <div className="flex gap-2">
              {experts.map((user) => {
                const vote = expertVotes[user.username];
                return (
                  <img
                    key={user.username}
                    src={user.avatar_url || default_user}
                    alt={user.username}
                    title={user.username}
                    className={`w-14 h-14 rounded-full ring-2 ${borderColor(vote)}`}
                  />
                );
              })}
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
        <div className="mt-4 flex gap-2 px-2">
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
            className="px-3 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600"
          >
            Envoyer
          </button>
        </div>
      </div>

      {/* ============================================
          MODALES : Affichées conditionnellement
          ============================================ */}

      {/* Modale de vote pour les experts */}
      {showVoteModal && votingExpertPseudo && (
        <ExpertVoteModale
          user={
            users.find((u) => u.pseudo === votingExpertPseudo) || {
              pseudo: votingExpertPseudo,
            }
          }
          onClose={() => {
            setShowVoteModal(false);
            setVotingExpertPseudo(null);
          }}
          onVote={(vote) => handleVote(votingExpertPseudo, vote)}
        />
      )}

      {/* Modale de confirmation de suppression */}
      {showDeleteModal && (
        <ConfirmDeleteModal
          onConfirm={() => {
            onDeleteClip?.(clip._id); // Supprime le clip via le callback parent
            setShowDeleteModal(false);
          }}
          onCancel={() => setShowDeleteModal(false)}
        />
      )}
    </div>
  );
}

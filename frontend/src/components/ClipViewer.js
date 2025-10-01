import { useState } from "react";
import { formatHumanDate } from "./utils/date";
import ExpertVoteModale from "./utils/vote";
import EditClaimModal from "./utils/EditClaimModal";
import ConfirmDeleteModal from "./utils/ConfirmDeleteModal";
import default_user from "./images/default_user.png";

export default function ClipViewer({
  clip,
  users = [],
  expertVotes = {},
  onExpertVote,
  onEditClip,
  onDeleteClip,
}) {
  const [commentInput, setCommentInput] = useState("");
  const [showVoteModal, setShowVoteModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [votingExpertPseudo, setVotingExpertPseudo] = useState(null);

  const experts = users.filter((u) => u.role === "EXPERT");

  const addComment = () => {
    if (!commentInput.trim()) return;
    const newComment = {
      user: "Moi",
      text: commentInput.trim(),
      date: new Date(),
    };
    setCommentInput("");
  };

  const handleVote = (pseudo, vote) => {
    onExpertVote?.(pseudo, vote);
    setShowVoteModal(false);
    setVotingExpertPseudo(null);
  };

  const [editClicked, setEditClicked] = useState(false);

  const borderColor = (vote) => {
    return vote === "oui"
      ? "ring-4 ring-green-500"
      : vote === "non"
        ? "ring-4 ring-red-600"
        : vote === "à revoir"
          ? "ring-4 ring-amber-400"
          : "ring-transparent";
  };

  return (
    <div className="h-full flex flex-col text-white">
      {/* Partie supérieure : contenu du clip */}
      <div className="overflow-auto px-2">
        <h2 className="text-3xl mb-2 font-bold text-gray-200">
          {clip.subject}
        </h2>
        <p className="text-sm mb-6 text-gray-400">
          Par {clip.authorId.username || "Inconnu"} —{" "}
          {new Date(clip.createdAt).toLocaleDateString("fr-FR")}
        </p>

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

        <div className="grid grid-cols-3 items-center mb-6 px-2">
          {/* Colonne 1 : Bouton Modifier */}
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

          {/* Colonne 2 : Indicateur editable */}
          <div className="flex justify-left">
            {clip.editable && (
              <button
                onClick={() => setShowEditModal(true)}
                className="text-m px-3 bg-amber-600 rounded hover:bg-amber-700 font-medium"
              >
                À éditer
              </button>
            )}

            {showEditModal && (
              <EditClaimModal
                onCancel={() => setShowEditModal(false)}
                onConfirm={() => {
                  setShowEditModal(false);
                  // logiques à ajouter ici : prise en charge de l'édition
                }}
              />
            )}
          </div>
          {/* Colonne 3 : Voter + Avatars */}
          <div className="flex justify-end items-center gap-3 h-full">
            <button
              onClick={() => {
                setVotingExpertPseudo("Boubou"); // ← à adapter pour gérer le vrai utilisateur connecté
                setShowVoteModal(true);
              }}
              className="px-3 py-1 bg-indigo-500 text-white rounded hover:bg-indigo-600 text-sm"
            >
              Voter
            </button>

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

      {/* Commentaires scrollables */}
      <div className="mt-auto">
        <h3 className="text-lg font-semibold text-gray-200 mb-1">
          Commentaires
        </h3>
        <div className="h-[375px] overflow-y-auto bg-gray-900 p-4 rounded-md shadow-inner border-t border-gray-700 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
          {(clip.comments?.length ?? 0) === 0 ? (
            <p className="text-gray-400 text-sm">Aucun commentaire encore.</p>
          ) : (
            <ul className="space-y-2 mb-4">
              {clip.comments.map((c, i) => (
                <li
                  key={i}
                  className="text-sm bg-gray-100 p-2 rounded text-gray-800"
                >
                  <div>{c.text}</div>
                  <div className="text-gray-500 text-xs">
                    — {c.userName}, {formatHumanDate(c.createdAt)}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Champ d’ajout de commentaire */}
        <div className="mt-4 flex gap-2 px-2">
          <input
            type="text"
            value={commentInput}
            onChange={(e) => setCommentInput(e.target.value)}
            onKeyDown={(e) => {
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

      {/* Modale de vote */}
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

      {showDeleteModal && (
        <ConfirmDeleteModal
          onConfirm={() => {
            onDeleteClip?.(clip._id);
            setShowDeleteModal(false);
          }}
          onCancel={() => setShowDeleteModal(false)}
        />
      )}
    </div>
  );
}

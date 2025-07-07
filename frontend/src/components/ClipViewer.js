import { useEffect, useState } from "react";
import { formatHumanDate } from "./utils/date";

export default function ClipViewer({ clip }) {
  const [comments, setComments] = useState(clip.comments || []);
  const [commentInput, setCommentInput] = useState("");

  useEffect(() => {
    setComments(clip.comments || []);
  }, [clip]);

  const addComment = () => {
    if (!commentInput.trim()) return;
    const newComment = {
      user: "Moi",
      text: commentInput.trim(),
      date: new Date(),
    };
    setComments((prev) => [...prev, newComment]);
    setCommentInput("");
  };

  return (
    <div className="h-full flex flex-col text-white">
      {/* Partie supérieure : contenu du clip */}
      <div className="overflow-auto px-2">
        <h2 className="text-2xl font-bold text-gray-200">{clip.subject}</h2>
        <p className="text-sm text-gray-400">
          Par {clip.author || "Inconnu"} —{" "}
          {new Date(clip.createdAt).toLocaleDateString("fr-FR")}
        </p>

        <div className="flex flex-wrap gap-2 my-2">
          {clip.tags.map((tag) => (
            <span
              key={tag}
              className="px-2 py-1 text-sm bg-gray-200 rounded-full text-gray-700"
            >
              #{tag}
            </span>
          ))}
        </div>

        <p className="whitespace-pre-wrap text-gray-100 mb-4">{clip.body}</p>
      </div>

      {/* Commentaires scrollables, collés en bas */}
      <div className="mt-auto">
        <h3 className="text-lg font-semibold text-gray-200 mb-1">
          Commentaires
        </h3>

        <div className="h-[300px] overflow-y-auto bg-gray-900 p-4 rounded-md shadow-inner border-t border-gray-700 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
          {comments.length === 0 ? (
            <p className="text-gray-400 text-sm">Aucun commentaire encore.</p>
          ) : (
            <ul className="space-y-2 mb-4">
              {comments.map((c, i) => (
                <li
                  key={i}
                  className="text-sm bg-gray-100 p-2 rounded text-gray-800"
                >
                  <div>{c.text}</div>
                  <div className="text-gray-500 text-xs">
                    — {c.user}, {formatHumanDate(c.date)}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Champ d’ajout toujours visible */}
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
    </div>
  );
}

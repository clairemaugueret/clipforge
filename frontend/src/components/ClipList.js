import { formatHumanDate } from "./utils/date";
import default_user from "./images/default_user.png";

function ClipList({
  clips,
  onSelect,
  selectedClipId,
  users = [],
  expertVotes = {},
}) {
  const experts = users.filter((u) => u.profil === "expert");

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
    <ul className="divide-y">
      {clips.map((clip) => (
        <div
          key={clip._id}
          onClick={() => onSelect(clip._id)} // 👈 corriger ici
          className={`px-4 py-3 cursor-pointer hover:bg-gray-600 ${
            selectedClipId === clip._id ? "bg-gray-600" : ""
          }`}
        >
          <div className="flex justify-between items-start">
            {/* Partie gauche : titre + auteur */}
            <div>
              <h3 className="text-white font-semibold flex items-center gap-2">
                {clip.subject}
                {clip.draft && (
                  <span className="text-xs text-yellow-500 px-2 py-0.5 rounded">
                    Brouillon
                  </span>
                )}
              </h3>
              <p className="text-xs text-gray-400">
                par {clip.author || "Inconnu"}
              </p>
            </div>

            {/* Partie droite : date */}
            <div className="flex flex-col items-end gap-1">
              <span className="text-xs text-gray-400 whitespace-nowrap">
                {formatHumanDate(clip.createdAt)}
              </span>

              <div className="flex gap-2 pr-2">
                {experts.map((user) => {
                  const vote = expertVotes[user.pseudo];
                  return (
                    <img
                      key={user.pseudo}
                      src={user.userImage || default_user}
                      title={user.pseudo}
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

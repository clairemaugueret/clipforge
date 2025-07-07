import { formatHumanDate } from "./utils/date";

function ClipList({ clips, onSelect, selectedClip }) {
  return (
    <ul className="divide-y">
      {clips.map((clip) => (
        <div
          key={clip._id}
          onClick={() => onSelect(clip)}
          className={`px-4 py-3 cursor-pointer hover:bg-gray-600 ${
            selectedClip === clip ? "bg-gray-600" : ""
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
            <span className="text-xs text-gray-400 whitespace-nowrap pl-4">
              {formatHumanDate(clip.createdAt)}
            </span>
          </div>
        </div>
      ))}
    </ul>
  );
}
export default ClipList;

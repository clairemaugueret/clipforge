import {
  getAvailableStatuses,
  getAvailableEditStatuses,
  getStatusColor,
  getEditStatusColor,
} from "../utils/translations";

function FilterModal({
  allTags,
  selectedTags,
  selectedStatuses,
  selectedEditStatuses,
  selectedVoteStatus,
  onToggleTag,
  onToggleStatus,
  onToggleEditStatus,
  onToggleVoteStatus,
  onClearFilters,
  onClose,
}) {
  const availableStatuses = getAvailableStatuses();
  const availableEditStatuses = getAvailableEditStatuses();

  const voteOptions = [
    { key: "VOTED", label: "Déjà voté" },
    { key: "NOT_VOTED", label: "Pas encore voté" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-gray-800 rounded-lg shadow-2xl max-w-md w-full mx-4 border-2 border-gray-700 animate-scale-in">
        {/* Barre colorée */}
        <div className="h-2 bg-indigo-500 rounded-t-lg" />

        <div className="p-6 text-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-white">🔎 Filtres</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white text-2xl"
            >
              ✕
            </button>
          </div>

          {/* SECTION TAGS */}
          <section className="mb-6">
            <h3 className="text-sm font-semibold mb-3 text-gray-300">
              Filtrer par tags
            </h3>
            <div className="flex flex-wrap gap-2">
              {allTags.length === 0 ? (
                <p className="text-sm text-gray-500">Aucun tag disponible</p>
              ) : (
                allTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => onToggleTag(tag)}
                    className={`px-3 py-1 rounded text-sm border transition-colors ${
                      selectedTags.includes(tag)
                        ? "bg-indigo-600 text-white border-indigo-600"
                        : "bg-gray-700 text-gray-300 border-gray-600 hover:border-indigo-400"
                    }`}
                  >
                    {tag}
                  </button>
                ))
              )}
            </div>
          </section>

          {/* SECTION STATUTS */}
          <section className="mb-6">
            <h3 className="text-sm font-semibold mb-3 text-gray-300">
              Filtrer par statut
            </h3>
            <div className="flex flex-wrap gap-2">
              {availableStatuses.map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => onToggleStatus(key)}
                  className={`px-3 py-1 rounded text-sm border transition-colors ${
                    selectedStatuses.includes(key)
                      ? `${getStatusColor(key)} text-white`
                      : "bg-gray-700 text-gray-300 border-gray-600 hover:border-gray-500"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </section>

          {/* SECTION ÉDITION */}
          <section className="mb-6">
            <h3 className="text-sm font-semibold mb-3 text-gray-300">
              Filtrer par édition
            </h3>
            <div className="flex flex-wrap gap-2">
              {availableEditStatuses.map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => onToggleEditStatus(key)}
                  className={`px-3 py-1 rounded text-sm border transition-colors ${
                    selectedEditStatuses.includes(key)
                      ? `${getEditStatusColor(key)} text-white`
                      : "bg-gray-700 text-gray-300 border-gray-600 hover:border-gray-500"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </section>

          {/* SECTION VOTE */}
          <section className="mb-4">
            <h3 className="text-sm font-semibold mb-3 text-gray-300">
              Filtrer par vote
            </h3>
            <div className="flex flex-wrap gap-2">
              {voteOptions.map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => onToggleVoteStatus(key)}
                  className={`px-3 py-1 rounded text-sm border transition-colors ${
                    selectedVoteStatus.includes(key)
                      ? "bg-emerald-600 text-white border-emerald-600"
                      : "bg-gray-700 text-gray-300 border-gray-600 hover:border-emerald-400"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </section>

          {/* BOUTONS */}
          <div className="flex justify-between gap-3 mt-6">
            <button
              onClick={onClearFilters}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded font-medium transition-colors"
            >
              🗑️ Effacer les filtres
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded font-medium transition-colors"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-scale-in {
          animation: scale-in 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}

export default FilterModal;

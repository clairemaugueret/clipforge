export default function ExpertVoteModal({ user, onVote, onClose }) {
  const handleVote = (choice) => {
    onVote(user.pseudo, choice);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className="bg-white text-gray-900 p-6 rounded-lg shadow-lg w-80">
        <h2 className="text-lg font-bold mb-4">Vote de {user.pseudo}</h2>
        <div className="space-y-2">
          <button
            onClick={() => handleVote("oui")}
            className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            ✅ Oui
          </button>
          <button
            onClick={() => handleVote("non")}
            className="w-full px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            ❌ Non
          </button>
          <button
            onClick={() => handleVote("arevoir")}
            className="w-full px-4 py-2 bg-amber-500 text-white rounded hover:bg-amber-600"
          >
            ⚠️ À revoir
          </button>
        </div>

        <div className="flex justify-end mt-4">
          <button
            onClick={onClose}
            className="w-24 py-1 bg-gray-300 text-gray-950 rounded hover:bg-gray-400"
          >
            Annuler
          </button>
        </div>
      </div>
    </div>
  );
}

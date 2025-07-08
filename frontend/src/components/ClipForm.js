import { useState } from "react";

function ClipForm({
  allTags,
  onSubmit,
  onAddTag,
  onCancel,
  onChange,
  initialData,
}) {
  const [title, setTitle] = useState(initialData?.subject || "");
  const [link, setLink] = useState(() => {
    const parts = initialData?.body?.split("\n\n") || [];
    return parts[0] || "";
  });
  const [comment, setComment] = useState(() => {
    const parts = initialData?.body?.split("\n\n") || [];
    return parts[1] || "";
  });
  const [tags, setTags] = useState(initialData?.tags || []);
  const [editable, setEditable] = useState(initialData?.editable || false);
  const [newTag, setNewTag] = useState("");

  const emitChange = () => {
    if (onChange) {
      onChange({
        ...initialData,
        subject: title,
        body: `${link}\n\n${comment}`,
        tags,
        editable,
        draft: true,
      });
    }
  };

  const toggleTag = (tag) => {
    setTags((prev) => {
      const updated = prev.includes(tag)
        ? prev.filter((t) => t !== tag)
        : [...prev, tag];
      setTimeout(emitChange, 0);
      return updated;
    });
  };

  const handleAddTag = () => {
    const trimmed = newTag.trim();
    if (trimmed && !allTags.includes(trimmed)) {
      onAddTag(trimmed);
      setTags((prev) => {
        const updated = [...prev, trimmed];
        setTimeout(emitChange, 0);
        return updated;
      });
    }
    setNewTag("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...initialData,
      subject: title,
      body: `${link}\n\n${comment}`,
      tags,
      editable,
      draft: false,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-xl">
      <h2 className="text-xl font-bold text-gray-100">Proposer un clip</h2>

      <div>
        <label className="block mb-1 text-sm text-gray-100 font-medium">
          Lien du clip
        </label>
        <input
          type="url"
          value={link}
          onChange={(e) => setLink(e.target.value)}
          onBlur={emitChange}
          required
          className="w-full p-2 border rounded"
        />
      </div>

      <div>
        <label className="block mb-1 text-sm text-gray-100 font-medium">
          Titre
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={emitChange}
          required
          className="w-full p-2 border rounded"
        />
      </div>

      <div>
        <label className="block mb-1 text-sm text-gray-100 font-medium">
          Tags
        </label>
        <div className="flex flex-wrap gap-2 mb-2">
          {allTags.map((tag) => (
            <button
              type="button"
              key={tag}
              onClick={() => toggleTag(tag)}
              className={`px-2 py-1 rounded text-sm border ${
                tags.includes(tag)
                  ? "bg-indigo-800 text-white border-indigo-500"
                  : "bg-white text-gray-700 border-gray-300"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Nouveau tag"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            className="flex-1 p-2 border rounded"
          />
          <button
            type="button"
            onClick={handleAddTag}
            className="px-3 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-700"
          >
            Ajouter
          </button>
        </div>
      </div>

      <div className="flex items-center text-gray-100 gap-2">
        <input
          id="editable"
          type="checkbox"
          checked={editable}
          onChange={(e) => {
            const newValue = e.target.checked;
            setEditable(newValue);
            emitChange();
          }}
        />
        <label htmlFor="editable" className="text-sm">
          À éditer
        </label>
      </div>

      <div>
        <label className="block mb-1 text-sm text-gray-100 font-medium">
          Commentaire
        </label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          onBlur={emitChange}
          rows="3"
          className="w-full p-2 border rounded"
        />
      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Soumettre
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
        >
          Annuler
        </button>
      </div>
    </form>
  );
}

export default ClipForm;

import { useState } from "react";
import { useSelector } from "react-redux";

/**
 * Composant formulaire pour créer ou éditer un clip
 * Utilisé en mode brouillon (draft) pour permettre des modifications en temps réel
 *
 * @param {Array} allTags - Liste de tous les tags disponibles dans l'application
 * @param {Function} onSubmit - Callback appelé lors de la soumission du formulaire
 * @param {Function} onAddTag - Callback pour ajouter un nouveau tag à la liste globale
 * @param {Function} onCancel - Callback pour annuler la création/édition
 * @param {Function} onChange - Callback appelé à chaque modification pour mettre à jour le brouillon
 * @param {Object} initialData - Données initiales du clip (vide pour nouveau, rempli pour édition)
 */
function ClipForm({
  allTags,
  onSubmit,
  onAddTag,
  onCancel,
  onChange,
  initialData,
}) {
  // ============================================
  // ÉTATS LOCAUX DU FORMULAIRE
  // ============================================

  // Titre du clip
  const [title, setTitle] = useState(initialData?.subject || "");

  // URL du clip Twitch
  const [link, setLink] = useState(initialData?.link || "");

  // Commentaire/description du clip
  const [comment, setComment] = useState(initialData?.comment || "");

  // Tags sélectionnés pour ce clip
  const [tags, setTags] = useState(initialData?.tags || []);

  // Indicateur si le clip nécessite une édition
  const [editable, setEditable] = useState(initialData?.editable || false);

  // Saisie temporaire pour créer un nouveau tag
  const [newTag, setNewTag] = useState("");

  // Récupère l'utilisateur connecté depuis Redux (pour l'auteur du clip)
  const user = useSelector((state) => state.user);

  // ============================================
  // GESTION DES CHANGEMENTS EN TEMPS RÉEL
  // ============================================

  /**
   * Émet les changements vers le composant parent pour mettre à jour le brouillon
   * Utilisé pour synchroniser l'état du formulaire avec l'état global
   * Permet de ne pas perdre les modifications si l'utilisateur change de clip
   */
  const emitChange = () => {
    if (onChange) {
      onChange({
        ...initialData,
        subject: title,
        link,
        tags,
        editable,
        draft: true,
      });
    }
  };

  // ============================================
  // GESTION DES TAGS
  // ============================================

  /**
   * Ajoute ou retire un tag de la sélection
   * Utilise setTimeout pour émettre le changement après la mise à jour de l'état
   *
   * @param {string} tag - Le tag à toggle
   */
  const toggleTag = (tag) => {
    setTags((prev) => {
      const updated = prev.includes(tag)
        ? prev.filter((t) => t !== tag) // Retire le tag s'il est déjà sélectionné
        : [...prev, tag]; // Ajoute le tag s'il n'est pas sélectionné
      setTimeout(emitChange, 0); // Émet le changement de manière asynchrone
      return updated;
    });
  };

  /**
   * Crée un nouveau tag et l'ajoute à la fois à la liste globale et à la sélection du clip
   * Vérifie que le tag n'existe pas déjà avant de l'ajouter
   */
  const handleAddTag = () => {
    const trimmed = newTag.trim();
    // Vérifie que le tag n'est pas vide et n'existe pas déjà
    if (trimmed && !allTags.includes(trimmed)) {
      onAddTag(trimmed); // Ajoute à la liste globale
      setTags((prev) => {
        const updated = [...prev, trimmed]; // Ajoute à la sélection du clip
        setTimeout(emitChange, 0);
        return updated;
      });
    }
    setNewTag(""); // Vide le champ de saisie
  };

  // ============================================
  // EXTRACTION DE L'ID DU CLIP DEPUIS L'URL TWITCH
  // ============================================

  /**
   * Extrait l'ID unique d'un clip depuis différents formats d'URL Twitch
   * Gère 3 formats possibles :
   * 1. URL directe : https://clips.twitch.tv/MonClipUnique
   * 2. URL in situ : https://www.twitch.tv/Chaîne/clip/MonClipUnique
   * 3. Paramètre URL : ?clip=MonClipUnique
   *
   * @param {string} link - L'URL complète du clip Twitch
   * @returns {string|null} - L'ID du clip ou null si extraction impossible
   */
  function extractClipId(link) {
    try {
      const url = new URL(link);
      const host = url.hostname;

      // 1) URL directe de clips.twitch.tv
      //    ex. https://clips.twitch.tv/MonClipUnique
      if (host === "clips.twitch.tv") {
        // url.pathname === "/MonClipUnique"
        return url.pathname.slice(1); // Retire le "/" initial
      }

      // 2) URL "in situ" sur twitch.tv
      //    ex. https://www.twitch.tv/Chaîne/clip/MonClipUnique
      if (host.includes("twitch.tv") && url.pathname.includes("/clip/")) {
        // Découpe après "/clip/" et retire tout ce qui pourrait suivre
        return url.pathname.split("/clip/")[1].split("/")[0];
      }

      // 3) Cas paramètre ?clip=ID
      if (url.searchParams.has("clip")) {
        return url.searchParams.get("clip");
      }

      return null; // Format d'URL non reconnu
    } catch (err) {
      return null; // Erreur de parsing de l'URL
    }
  }

  // ============================================
  // SOUMISSION DU FORMULAIRE
  // ============================================

  /**
   * Gère la soumission du formulaire
   * Extrait l'ID du clip, compile toutes les données et appelle le callback onSubmit
   *
   * @param {Event} e - L'événement de soumission du formulaire
   */
  const handleSubmit = (e) => {
    e.preventDefault(); // Empêche le rechargement de la page
    onSubmit({
      ...initialData,
      clip_id: extractClipId(link), // Extrait l'ID depuis l'URL
      subject: title,
      link,
      tags,
      editable,
      draft: false, // Passe en mode publié
      authorId: { username: user.username }, // Associe l'auteur
    });
  };

  // ============================================
  // RENDU DU FORMULAIRE
  // ============================================

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-xl">
      <h2 className="text-xl font-bold text-gray-100">Proposer un clip</h2>

      {/* ============================================
          CHAMP : URL DU CLIP
          ============================================ */}
      <div>
        <label className="block mb-1 text-sm text-gray-100 font-medium">
          Lien du clip
        </label>
        <input
          type="url"
          value={link}
          onChange={(e) => setLink(e.target.value)}
          onBlur={emitChange} // Sauvegarde lors de la perte de focus
          required
          className="w-full p-2 border rounded"
        />
      </div>

      {/* ============================================
          CHAMP : TITRE DU CLIP
          ============================================ */}
      <div>
        <label className="block mb-1 text-sm text-gray-100 font-medium">
          Titre
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={emitChange} // Sauvegarde lors de la perte de focus
          required
          className="w-full p-2 border rounded"
        />
      </div>

      {/* ============================================
          SECTION : SÉLECTION DES TAGS
          ============================================ */}
      <div>
        <label className="block mb-1 text-sm text-gray-100 font-medium">
          Tags
        </label>

        {/* Liste des tags existants (boutons toggle) */}
        <div className="flex flex-wrap gap-2 mb-2">
          {allTags.map((tag) => (
            <button
              type="button"
              key={tag}
              onClick={() => toggleTag(tag)}
              className={`px-2 py-1 rounded text-sm border ${
                tags.includes(tag)
                  ? "bg-indigo-800 text-white border-indigo-500" // Tag sélectionné
                  : "bg-white text-gray-700 border-gray-300" // Tag non sélectionné
              }`}
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Champ pour créer un nouveau tag */}
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

      {/* ============================================
          CHECKBOX : À ÉDITER
          ============================================ */}
      <div className="flex items-center text-gray-100 gap-2">
        <input
          id="editable"
          type="checkbox"
          checked={editable}
          onChange={(e) => {
            const newValue = e.target.checked;
            setEditable(newValue);
            emitChange(); // Sauvegarde immédiate du changement
          }}
        />
        <label htmlFor="editable" className="text-sm">
          À éditer
        </label>
      </div>

      {/* ============================================
          CHAMP : COMMENTAIRE
          ============================================ */}
      <div>
        <label className="block mb-1 text-sm text-gray-100 font-medium">
          Commentaire
        </label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          onBlur={emitChange} // Sauvegarde lors de la perte de focus
          rows="3"
          className="w-full p-2 border rounded"
        />
      </div>

      {/* ============================================
          BOUTONS D'ACTION
          ============================================ */}
      <div className="flex gap-2">
        {/* Bouton de soumission - publie le clip */}
        <button
          type="submit"
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Soumettre
        </button>
        {/* Bouton d'annulation - ferme le formulaire et supprime le brouillon */}
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

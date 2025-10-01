import { useState, useEffect } from "react";
import ClipList from "./components/ClipList";
import ClipViewer from "./components/ClipViewer";
import ClipForm from "./components/ClipForm";
import TagFilterModal from "./components/utils/TagFilterModal";
import LoginModal from "./components/utils/LoginModal";
import default_user from "./components/images/default_user.png";
// Import des hooks Redux pour la gestion de l'état global de l'utilisateur
import { useSelector, useDispatch } from "react-redux";
import { login, logout } from "./reducers/userSlice";

const BACK_URL = "http://localhost:3001";

function App() {
  // ============================================
  // REDUX - Gestion de l'état utilisateur global
  // ============================================

  // Récupère l'utilisateur connecté depuis le store Redux (persisté dans localStorage)
  const user = useSelector((state) => state.user);
  // Dispatcher pour déclencher des actions Redux (login/logout)
  const dispatch = useDispatch();

  // ============================================
  // ÉTATS LOCAUX DU COMPOSANT
  // ============================================

  // Liste complète des users récupérés depuis le backend
  const [users, setUsers] = useState([]);

  // Liste complète des clips récupérés depuis le backend
  const [clips, setClips] = useState([]);

  // ID du clip actuellement sélectionné (affiché dans ClipViewer)
  const [selectedClipId, setSelectedClipId] = useState(null);

  // Tags sélectionnés pour filtrer la liste des clips
  const [selectedTags, setSelectedTags] = useState([]);

  // Affichage de la modale de filtrage par tags
  const [showFilterModal, setShowFilterModal] = useState(false);

  // Affichage de la modale de connexion/déconnexion
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Affichage du formulaire de création/édition de clip
  const [showForm, setShowForm] = useState(false);

  // Liste de tous les tags disponibles dans l'application
  const [allTags, setAllTags] = useState(["valorant", "fun", "chat"]);

  // Stocke temporairement le clip en mode brouillon (ID "draft")
  const [draftClip, setDraftClip] = useState(null);

  // Objet stockant les votes des experts par clip
  // Structure: { clipId: { pseudo: "oui"/"non"/"à revoir" } }
  const [expertVotes, setExpertVotes] = useState({});

  // Protection contre les requêtes d'authentification multiples
  const [isAuthInProgress, setIsAuthInProgress] = useState(false);

  // ============================================
  // VARIABLES DÉRIVÉES
  // ============================================

  // Récupère le clip complet correspondant à l'ID sélectionné
  const selectedClip = clips.find((c) => c.clip_id === selectedClipId);

  // ============================================
  // FONCTIONS DE GESTION DES TAGS
  // ============================================

  /**
   * Ajoute ou retire un tag de la sélection pour le filtrage
   */
  const toggleTag = (tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  /**
   * Ajoute un nouveau tag à la liste globale des tags
   */
  const addNewTag = (newTag) => {
    if (!allTags.includes(newTag)) {
      setAllTags((prev) => [...prev, newTag]);
    }
  };

  // ============================================
  // GESTION DES VOTES EXPERTS
  // ============================================

  /**
   * Enregistre le vote d'un expert sur un clip
   */
  const handleExpertVote = (clipId, pseudo, vote) => {
    setExpertVotes((prev) => ({
      ...prev,
      [clipId]: {
        ...(prev[clipId] || {}),
        [pseudo]: vote,
      },
    }));
  };

  // ============================================
  // GESTION DE LA CRÉATION DE CLIP (BROUILLON)
  // ============================================

  /**
   * Crée un nouveau clip en mode brouillon et l'ajoute à la liste
   * Le brouillon a un ID spécial "draft" et est placé en tête de liste
   */
  const handleProposeClick = () => {
    const newDraft = {
      clip_id: "draft",
      subject: "Nouveau clip",
      tags: [],
      editable: false,
      draft: true,
      authorId: { username: user.username },
      createdAt: new Date(),
    };

    setDraftClip(newDraft);

    // Retire l'ancien brouillon s'il existe et ajoute le nouveau en tête
    setClips((prev) => {
      const withoutOldDraft = prev.filter((clip) => clip.clip_id !== "draft");
      return [newDraft, ...withoutOldDraft];
    });

    // Sélectionne automatiquement le brouillon et affiche le formulaire
    setSelectedClipId("draft");
    setShowForm(true);
  };

  // ============================================
  // GESTION DE LA SUPPRESSION DE CLIP
  // ============================================

  /**
   * Supprime un clip de la liste
   * Si le clip supprimé était sélectionné, désélectionne
   */
  const handleDeleteClip = (clipId) => {
    setClips((prev) => prev.filter((clip) => clip.clip_id !== clipId));

    if (selectedClipId === clipId) {
      setSelectedClipId(null);
    }
  };

  // ============================================
  // GESTION DE L'ANNULATION DU FORMULAIRE
  // ============================================

  /**
   * Annule la création/édition d'un clip
   * Si c'est un brouillon, demande confirmation avant suppression
   */
  const handleCancelForm = () => {
    // Si on annule un brouillon, on demande confirmation
    if (selectedClip?.draft) {
      const confirmDelete = window.confirm(
        "Annuler va supprimer ce brouillon. Continuer ?"
      );
      if (!confirmDelete) return;

      // Supprime le brouillon de la liste
      setClips((prev) => prev.filter((clip) => clip.clip_id !== "draft"));
      setDraftClip(null);
    }

    setShowForm(false);
    setSelectedClipId(null);
  };

  // ============================================
  // MISE À JOUR DU BROUILLON
  // ============================================

  /**
   * Met à jour le brouillon en cours d'édition (changements en temps réel)
   */
  const handleDraftUpdate = (updatedClip) => {
    const updated = { ...updatedClip, draft: true };

    // Met à jour le brouillon dans la liste des clips
    setClips((prev) =>
      prev.map((clip) => (clip.clip_id === "draft" ? updated : clip))
    );

    setDraftClip(updated);
    setSelectedClipId("draft");
  };

  // ============================================
  // SÉLECTION D'UN CLIP
  // ============================================

  /**
   * Sélectionne un clip pour l'afficher dans le viewer
   * Si c'est un brouillon, affiche le formulaire au lieu du viewer
   */
  const handleSelectClip = (clipId) => {
    const freshClip = clips.find((c) => c.clip_id === clipId);
    setSelectedClipId(clipId);
    // Affiche le formulaire uniquement si c'est un brouillon
    setShowForm(freshClip?.clip_id === "draft");
  };

  // ============================================
  // ÉDITION D'UN CLIP EXISTANT
  // ============================================

  /**
   * Convertit un clip publié en brouillon pour l'éditer
   * Crée une copie avec l'ID "draft" pour ne pas modifier l'original
   */
  const handleEditClip = () => {
    if (!selectedClipId) return;

    const clipToEdit = clips.find((c) => c.clip_id === selectedClipId);
    if (!clipToEdit) return;

    // Crée un brouillon basé sur le clip à éditer
    const draftClip = {
      ...clipToEdit,
      draft: true,
      clip_id: "draft",
    };

    // Ajoute le brouillon à la liste (en supprimant tout ancien brouillon)
    setClips((prev) => [
      ...prev.filter((c) => c.clip_id !== "draft"),
      draftClip,
    ]);

    setSelectedClipId("draft");
    setShowForm(true);
  };

  // ============================================
  // PUBLICATION D'UN NOUVEAU CLIP
  // ============================================

  /**
   * Envoie le clip au backend pour le sauvegarder
   * Transforme le brouillon en clip publié
   */
  const addNewClip = (clip) => {
    // Envoie une requête POST au backend pour créer le clip
    fetch(`${BACK_URL}/clipmanager/clips/new`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token: user.token,
        link: clip.link,
        subject: clip.subject,
        tags: clip.tags,
        editable: clip.editable,
        text: clip.comment,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.result) {
          // Si succès, retire le brouillon et ajoute le clip publié
          setClips((prev) => [
            ...prev.filter((c) => c.clip_id !== "draft"),
            clip,
          ]);
          // Sélectionne le nouveau clip créé
          setSelectedClipId(data.clip.clip_id);
        } else {
          console.error(data.error);
        }
      })
      .catch((err) => console.error("Erreur backend :", err));

    setShowForm(false);
    setDraftClip(null);
  };

  // ============================================
  // FILTRAGE DES CLIPS
  // ============================================

  /**
   * Filtre les clips selon les tags sélectionnés
   * Si aucun tag sélectionné, affiche tous les clips
   * Si des tags sont sélectionnés, n'affiche que les clips qui ont TOUS les tags
   */
  const filteredClips = clips.filter(
    (clip) =>
      selectedTags.length === 0 ||
      selectedTags.every((tag) => clip.tags.includes(tag))
  );

  // ============================================
  // GESTION DE LA DÉCONNEXION
  // ============================================

  /**
   * Déconnecte l'utilisateur en vidant les données Redux
   */
  const userLogout = () => {
    if (user.username) {
      dispatch(logout());
      alert("✅ Déconnexion réussie !");
    }
  };

  // ============================================
  // EFFET : AUTHENTIFICATION TWITCH
  // ============================================

  /**
   * Gère le retour de l'authentification Twitch
   * Récupère le code dans l'URL et l'envoie au backend pour obtenir les infos utilisateur
   * S'exécute au montage du composant
   *
   * Flux OAuth 2.0 complet :
   * 1. User clique sur "Se connecter" dans LoginModal
   * 2. Redirection vers Twitch pour autorisation
   * 3. Twitch redirige vers notre app avec un code dans l'URL
   * 4. Ce useEffect détecte le code et l'échange contre un token via le backend
   * 5. Les données utilisateur sont stockées dans Redux
   * 6. L'URL est nettoyée pour enlever le code
   */
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");

    // Si un code d'autorisation Twitch est présent dans l'URL ET qu'aucune auth n'est en cours
    if (code && !isAuthInProgress) {
      setIsAuthInProgress(true); // Bloque d'autres tentatives simultanées

      fetch(`${BACK_URL}/clipmanager/users/authtwitch`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.result) {
            // Connecte l'utilisateur via Redux
            dispatch(
              login({
                token: data.user.token,
                username: data.user.username,
                avatar_url: data.user.avatar_url,
              })
            );
            // Nettoie l'URL pour enlever le code (sécurité et esthétique)
            window.history.replaceState({}, document.title, "/");
          } else {
            console.error(data.error);
          }
        })
        .catch((err) => console.error("Erreur backend :", err))
        .finally(() => {
          setIsAuthInProgress(false); // Débloque pour une prochaine tentative
        });
    }
  }, [dispatch, isAuthInProgress]);

  // ============================================
  // EFFET : CHARGEMENT DE LA LISTE DES USERS DE LA BASE DE DONNÉES
  // ============================================

  /**
   * Charge tous les users depuis le backend au montage du composant
   */
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch(`${BACK_URL}/clipmanager/users/all`);
        if (!response.ok) {
          throw new Error("Erreur réseau");
        }
        const data = await response.json();
        setUsers(data.users);
      } catch (error) {
        console.error("Erreur lors du chargement des users :", error);
      }
    };

    fetchUsers();
  }, []);

  // ============================================
  // EFFET : CHARGEMENT DES CLIPS DE LA BASE DE DONNÉES
  // ============================================

  /**
   * Charge tous les clips depuis le backend au montage du composant
   */
  useEffect(() => {
    const fetchClips = async () => {
      try {
        const response = await fetch(`${BACK_URL}/clipmanager/clips/all`);
        if (!response.ok) {
          throw new Error("Erreur réseau");
        }
        const data = await response.json();
        setClips(data.clips);
      } catch (error) {
        console.error("Erreur lors du chargement des clips :", error);
      }
    };

    fetchClips();
  }, []);

  // ============================================
  // RENDU DU COMPOSANT
  // ============================================

  return (
    <div className="h-screen flex flex-col">
      {/* ============================================
          HEADER : Titre et bouton de connexion
          ============================================ */}
      <header className="bg-indigo-950 p-4 shadow-md flex justify-between items-center">
        <h1 className="text-xl font-bold text-white">
          Clips Manager{" "}
          <span className="text-base text-indigo-400">
            • TikTok @evoxia.clips
          </span>
        </h1>
        {/* Avatar cliquable pour ouvrir la modale de connexion/déconnexion */}

        <div className="flex justify-between items-center">
          {user.username ? (
            <></>
          ) : (
            <span className="font-bold text-sm text-indigo-800 pr-4 italic">
              En attente de connexion...
            </span>
          )}
          <button onClick={() => setShowLoginModal(true)}>
            <img
              src={user?.avatar_url || default_user}
              alt={user?.username || "Se connecter"}
              className="w-8 h-8 rounded-full border border-white hover:ring-2 ring-indigo-400"
            />
          </button>
        </div>
      </header>

      {/* ============================================
          LAYOUT PRINCIPAL : 3 colonnes
          ============================================ */}
      <div className="flex flex-1 h-0">
        {/* ============================================
            COLONNE GAUCHE : Liste des clips + bouton proposer
            ============================================ */}
        <aside className="w-1/4 max-w-sm bg-gray-700 border-r border-gray-300 flex flex-col">
          {!user.username ? (
            <div></div>
          ) : (
            <>
              {/* En-tête de la liste avec bouton filtrer */}
              <div className="p-4 border-b font-bold text-lg flex text-gray-50 justify-between items-center">
                <span>Liste des clips</span>
                <button
                  onClick={() => setShowFilterModal(true)}
                  className="text-sm text-indigo-400 hover:text-indigo-500"
                >
                  Filtrer
                </button>
              </div>

              {/* Liste scrollable des clips filtrés */}
              <div className="flex-1 overflow-y-auto">
                <ClipList
                  clips={filteredClips}
                  onSelect={handleSelectClip}
                  selectedClipId={selectedClipId}
                  users={users}
                  expertVotes={expertVotes}
                />
              </div>

              {/* Bouton "Proposer un clip" fixé en bas */}
              <div className="p-4 border-t">
                <button
                  onClick={handleProposeClick}
                  className="w-full px-3 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600 text-sm"
                >
                  Proposer un clip
                </button>
              </div>
            </>
          )}
        </aside>

        {/* ============================================
            COLONNE CENTRALE : Formulaire ou Viewer
            ============================================ */}
        <main className="flex-1 bg-gray-800 h-full p-6">
          {/* Affiche le formulaire si showForm est true, sinon le viewer */}
          {showForm && selectedClip ? (
            <ClipForm
              allTags={allTags}
              onSubmit={addNewClip}
              onAddTag={addNewTag}
              onCancel={handleCancelForm}
              onChange={handleDraftUpdate}
              initialData={selectedClip}
            />
          ) : (
            selectedClip && (
              <ClipViewer
                clip={selectedClip}
                users={users}
                expertVotes={expertVotes[selectedClipId] || {}}
                onExpertVote={(pseudo, vote) =>
                  handleExpertVote(selectedClipId, pseudo, vote)
                }
                onEditClip={handleEditClip}
                onDeleteClip={handleDeleteClip}
              />
            )
          )}
        </main>

        {/* ============================================
            COLONNE DROITE : Image et lien Twitch du clip
            ============================================ */}
        <div className="w-[700px] bg-gray-800 p-4 flex flex-col items-end gap-4">
          {selectedClip && (
            <>
              {/* Image d'illustration du clip (ou bannière par défaut) */}
              <img
                src={
                  selectedClip.image?.trim()
                    ? selectedClip.image
                    : "https://static-cdn.jtvnw.net/jtv_user_pictures/f9e5fd9c-4210-4ccf-bb5c-4c84f14d7876-profile_banner-480.png"
                }
                alt="Illustration du clip"
                className="w-full rounded shadow object-cover"
              />

              {/* Bouton pour ouvrir le clip sur Twitch */}
              {selectedClip.link && (
                <a
                  href={selectedClip.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 text-center w-32"
                >
                  Voir sur Twitch
                </a>
              )}
            </>
          )}
        </div>
      </div>

      {/* ============================================
          MODALES : Affichées conditionnellement
          ============================================ */}

      {/* Modale de filtrage par tags */}
      {showFilterModal && (
        <TagFilterModal
          allTags={allTags}
          selectedTags={selectedTags}
          toggleTag={toggleTag}
          onClose={() => setShowFilterModal(false)}
        />
      )}

      {/* Modale de connexion/déconnexion */}
      {showLoginModal && (
        <LoginModal
          user={user.username}
          onClose={() => setShowLoginModal(false)}
          onLogout={userLogout}
          isAuthInProgress={isAuthInProgress}
        />
      )}
    </div>
  );
}

export default App;

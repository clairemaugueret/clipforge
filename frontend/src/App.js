import { useState, useEffect } from "react";
import ClipList from "./components/ClipList";
import ClipViewer from "./components/ClipViewer";
import ClipForm from "./components/ClipForm";
import TagFilterModal from "./components/utils/TagFilterModal";
import LoginModal from "./components/utils/LoginModal";
import { formatHumanDate } from "./components/utils/date";
import default_user from "./components/images/default_user.png";
//CLAIRE
import { useSelector, useDispatch } from "react-redux";
import { login, logout } from "./reducers/userSlice";
//CLAIRE

const Users = [
  {
    userId: 1,
    pseudo: "Boubou",
    profil: "expert",
    userImage: "https://i.pravatar.cc/40?u=user1",
  },
  {
    userId: 2,
    pseudo: "Claire",
    profil: "expert",
    userImage: "https://i.pravatar.cc/40?u=user2",
  },
  {
    userId: 3,
    pseudo: "TrasTop",
    profil: "expert",
    userImage: "",
  },
  {
    userId: 4,
    pseudo: "Heaven",
    profil: "random",
    userImage: "https://i.pravatar.cc/40?u=user1",
  },
];

const initialClips = [
  {
    _id: 1,
    subject: "Ace au sniper",
    tags: ["valorant", "fun"],
    editable: true,
    author: "Boubou",
    createdAt: new Date("2025-07-02T17:57:28"),
    link: "https://www.twitch.tv/evoxia/clip/CreativeManlySlothDansGame-0Lo1bVZVA142TCTj",
    image: "",
    comments: [
      {
        user: "Claire",
        text: "C'est bien mais il manque un truc.",
        date: new Date("2025-07-03T22:17:13"),
      },
      {
        user: "TrasTop",
        text: "J'avoue t'aurais pu faire un effort...",
        date: new Date("2025-07-04T00:03:42"),
      },
    ],
    draft: false,
  },
  {
    _id: 2,
    subject: "Chat rigolo",
    tags: ["chat", "fun"],
    editable: false,
    author: "Claire",
    createdAt: new Date("2025-07-01T12:36:25"),
    link: "https://www.twitch.tv/evoxia/clip/KathishInnocentBorkChocolateRain-4xjxykiJVieiAvVd",
    image:
      "https://static-cdn.jtvnw.net/twitch-clips-thumbnails-prod/TolerantTransparentMuleJonCarnage-iYzVhoNG4hzOLzKu/5c56d6ce-498c-4627-b3fb-14d0830762a2/preview.jpg",
    comments: [
      {
        user: "Boubou",
        text: "C'est cool !",
        date: new Date("2025-07-01T13:25:25"),
      },
    ],
    draft: false,
  },
  {
    _id: 3,
    subject: "Clutch 1v3",
    tags: ["valorant"],
    editable: true,
    author: "TrasTop",
    createdAt: new Date("2025-06-30T11:35:18"),
    link: "https://www.twitch.tv/evoxia/clip/HardNeighborlyPineappleMVGame-COIRcfSMOMCl8onZ",
    image:
      "https://static-cdn.jtvnw.net/twitch-clips-thumbnails-prod/PlumpCogentLaptopKippa-nMH3oLLKb-gi6_DS/55b174e3-64e6-4edd-945f-553654782b48/preview.jpg",
    comments: [
      {
        user: "Boubou",
        text: "C'est nul",
        date: new Date("2025-07-01T13:25:25"),
      },
    ],
    draft: false,
  },
  {
    _id: 4,
    subject: "ct cho",
    tags: ["valorant", "fun"],
    author: "Sacha",
    createdAt: "2025-07-01T09:00:00Z",
    link: "https://www.twitch.tv/evoxia/clip/VainAntsyMoosePRChase-LwmEmZW7JzcYvAsR",
    image:
      "https://static-cdn.jtvnw.net/twitch-clips-thumbnails-prod/ConfidentEphemeralChickenEagleEye-ZTKRgxgiosFYmydH/a8c1c3d3-6c07-45b8-ad7e-b3bc496e3809/preview.jpg",
    comments: [
      {
        user: "Alex",
        text: "Magnifique clutch 🔥",
        date: formatHumanDate("2025-07-03T10:15:00Z"),
      },
      {
        user: "Nina",
        text: "On voit bien la tension à la fin, gg !",
        date: formatHumanDate("2025-07-03T11:02:00Z"),
      },
      {
        user: "Alex",
        text: "Magnifique clutch 🔥",
        date: "2025-07-03T10:15:00Z",
      },
      {
        user: "Nina",
        text: "On voit bien la tension à la fin, gg !",
        date: "2025-07-03T11:02:00Z",
      },
      {
        user: "Alex",
        text: "Magnifique clutch 🔥",
        date: "2025-07-03T10:15:00Z",
      },
      {
        user: "Nina",
        text: "On voit bien la tension à la fin, gg !",
        date: "2025-07-03T11:02:00Z",
      },
      {
        user: "Alex",
        text: "Magnifique clutch 🔥",
        date: "2025-07-03T10:15:00Z",
      },
      {
        user: "Nina",
        text: "On voit bien la tension à la fin, gg !",
        date: "2025-07-03T11:02:00Z",
      },
      {
        user: "Alex",
        text: "Magnifique clutch 🔥",
        date: "2025-07-03T10:15:00Z",
      },
      {
        user: "Nina",
        text: "On voit bien la tension à la fin, gg !",
        date: "2025-07-03T11:02:00Z",
      },
      {
        user: "Alex",
        text: "Magnifique clutch 🔥",
        date: "2025-07-03T10:15:00Z",
      },
      {
        user: "Nina",
        text: "On voit bien la tension à la fin, gg !",
        date: "2025-07-03T11:02:00Z",
      },
      {
        user: "Alex",
        text: "Magnifique clutch 🔥",
        date: "2025-07-03T10:15:00Z",
      },
      {
        user: "Nina",
        text: "On voit bien la tension à la fin, gg !",
        date: "2025-07-03T11:02:00Z",
      },
    ],
    draft: false,
  },
];

function App() {
  //CLAIRE
  const user = useSelector((state) => state.user);
  const dispatch = useDispatch();
  //CLAIRE

  const [clips, setClips] = useState(initialClips);
  const [selectedClipId, setSelectedClipId] = useState(null);
  const [selectedTags, setSelectedTags] = useState([]);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [allTags, setAllTags] = useState(["valorant", "fun", "chat"]);
  const [draftClip, setDraftClip] = useState(null);

  const selectedClip = clips.find((c) => c._id === selectedClipId);

  const toggleTag = (tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const [expertVotes, setExpertVotes] = useState({});

  const handleExpertVote = (clipId, pseudo, vote) => {
    setExpertVotes((prev) => ({
      ...prev,
      [clipId]: {
        ...(prev[clipId] || {}),
        [pseudo]: vote,
      },
    }));
  };

  const handleProposeClick = () => {
    const newDraft = {
      _id: "draft",
      subject: "Nouveau clip",
      tags: [],
      editable: false,
      draft: true,
      author: "Moi",
      createdAt: new Date(),
    };

    setDraftClip(newDraft);
    setClips((prev) => {
      const withoutOldDraft = prev.filter((clip) => clip._id !== "draft");
      return [newDraft, ...withoutOldDraft];
    });

    setSelectedClipId("draft");
    setShowForm(true);
  };

  const handleCancelForm = () => {
    if (selectedClip?.draft) {
      const confirmDelete = window.confirm(
        "Annuler va supprimer ce brouillon. Continuer ?"
      );
      if (!confirmDelete) return;

      setClips((prev) => prev.filter((clip) => clip._id !== "draft"));
      setDraftClip(null);
    }

    setShowForm(false);
    setSelectedClipId(null);
  };

  const handleDraftUpdate = (updatedClip) => {
    const updated = { ...updatedClip, draft: true };

    setClips((prev) =>
      prev.map((clip) => (clip._id === "draft" ? updated : clip))
    );

    setDraftClip(updated);
    setSelectedClipId("draft");
  };

  const handleSelectClip = (clipId) => {
    const freshClip = clips.find((c) => c._id === clipId);
    console.log(selectedClip);
    setSelectedClipId(clipId);
    setShowForm(freshClip?._id === "draft");
  };

  const handleEditClip = () => {
    if (!selectedClipId) return;

    const clipToEdit = clips.find((c) => c._id === selectedClipId);
    if (!clipToEdit) return;

    const draftClip = {
      ...clipToEdit,
      draft: true,
      _id: "draft",
    };

    setClips((prev) => [...prev.filter((c) => c._id !== "draft"), draftClip]);

    setSelectedClipId("draft");
    setShowForm(true);
  };

  const addNewClip = (clip) => {
    const publishedClip = { ...clip, draft: false };

    setClips((prev) =>
      prev.map((c) => (c._id === "draft" ? publishedClip : c))
    );

    setShowForm(false);
    setSelectedClipId(publishedClip._id);
    setDraftClip(null);
  };

  const addNewTag = (newTag) => {
    if (!allTags.includes(newTag)) {
      setAllTags((prev) => [...prev, newTag]);
    }
  };

  const filteredClips =
    selectedTags.length === 0
      ? clips
      : clips.filter((clip) =>
          (clip.tags || []).some((tag) => selectedTags.includes(tag))
        );

  //CLAIRE
  //Gestion de la déconnexion
  const userLogout = () => {
    if (user.username) {
      dispatch(logout());
      alert("✅ Déconnexion réussie !");
    }
  };

  //Requête vers le back pour se connecter
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");

    if (code) {
      fetch("http://localhost:3001/clipmanager/users/authtwitch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.result) {
            dispatch(
              login({
                token: data.user.token,
                username: data.user.username,
                avatar_url: data.user.avatar_url,
              })
            );
            window.history.replaceState({}, document.title, "/"); // Nettoyer l'URL
          } else {
            console.error(data.error);
          }
        })
        .catch((err) => console.error("Erreur backend :", err));
    }
  }, [dispatch]);
  //CLAIRE

  return (
    <div className="h-screen flex flex-col">
      <header className="bg-indigo-950 text-white p-4 shadow-md flex justify-between items-center">
        <h1 className="text-xl font-bold">Mes Clips</h1>
        {/* CLAIRE */}
        <button
          onClick={() =>
            user.username ? userLogout() : setShowLoginModal(true)
          }
        >
          <img
            src={user.avatar_url || default_user}
            alt={user.username || "Se connecter"}
            className="w-8 h-8 rounded-full border border-white hover:ring-2 ring-indigo-400"
          />
        </button>
        {/* CLAIRE */}
      </header>

      <div className="flex flex-1 h-0">
        <aside className="w-1/4 max-w-sm bg-gray-700 border-r border-gray-300 flex flex-col">
          <div className="p-4 border-b font-bold text-lg flex text-gray-50 justify-between items-center">
            <span>Liste des clips</span>
            <button
              onClick={() => setShowFilterModal(true)}
              className="text-sm text-indigo-400 hover:text-indigo-500"
            >
              Filtrer
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            <ClipList
              clips={filteredClips}
              onSelect={handleSelectClip}
              selectedClipId={selectedClipId}
              users={Users}
              expertVotes={expertVotes}
            />
          </div>

          <div className="p-4 border-t">
            <button
              onClick={handleProposeClick}
              className="w-full px-3 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600 text-sm"
            >
              Proposer un clip
            </button>
          </div>
        </aside>

        <main className="flex-1 bg-gray-800 h-full p-6">
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
                users={Users}
                expertVotes={expertVotes[selectedClipId] || {}}
                onExpertVote={(pseudo, vote) =>
                  handleExpertVote(selectedClipId, pseudo, vote)
                }
                onEditClip={handleEditClip}
              />
            )
          )}
        </main>

        <div className="w-[700px] bg-gray-800 p-4 flex flex-col items-end gap-4">
          {selectedClip && (
            <>
              <img
                src={
                  selectedClip.image?.trim()
                    ? selectedClip.image
                    : "https://static-cdn.jtvnw.net/jtv_user_pictures/f9e5fd9c-4210-4ccf-bb5c-4c84f14d7876-profile_banner-480.png"
                }
                alt="Illustration du clip"
                className="w-full rounded shadow object-cover"
              />

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

      {showFilterModal && (
        <TagFilterModal
          allTags={allTags}
          selectedTags={selectedTags}
          toggleTag={toggleTag}
          onClose={() => setShowFilterModal(false)}
        />
      )}
      {showLoginModal && (
        <LoginModal onClose={() => setShowLoginModal(false)} />
      )}
    </div>
  );
}

export default App;

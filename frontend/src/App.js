import { useState } from "react";
import ClipList from "./components/ClipList";
import ClipViewer from "./components/ClipViewer";
import ClipForm from "./components/ClipForm";
import TagFilterModal from "./components/TagFilterModal";
import { formatHumanDate } from "./components/utils/date";

const initialClips = [
  {
    _id: 1,
    subject: "Ace au sniper",
    body: "Un moment incroyable sur Valorant avec l'Operator.",
    tags: ["valorant", "fun"],
    editable: false,
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
    body: "Un clip où mon chat saute dans une boîte. Trop marrant.",
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
    body: "Clutch tendu sur Ascent, beaucoup de stress !",
    tags: ["valorant"],
    editable: false,
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
    body: "https://youtu.be/exemple\n\nUn moment intense !",
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
  const [clips, setClips] = useState(initialClips);
  const [selectedClip, setSelectedClip] = useState(null);
  const [selectedTags, setSelectedTags] = useState([]);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [allTags, setAllTags] = useState(["valorant", "fun", "chat"]);
  const [draftClip, setDraftClip] = useState(null); //brouillon de clip

  const toggleTag = (tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleProposeClick = () => {
    if (draftClip) {
      setSelectedClip(draftClip);
      setShowForm(true);
      return;
    }

    const draft = {
      subject: "Nouveau clip",
      body: "",
      tags: [],
      editable: true,
      draft: true,
      author: "Moi",
      createdAt: new Date(),
    };
    setDraftClip(draft);
    setClips((prev) => [draft, ...prev]);
    setSelectedClip(draft);
    setShowForm(true);
  };

  const handleCancelForm = () => {
    if (selectedClip?.draft) {
      const confirmDelete = window.confirm(
        "Annuler va supprimer ce brouillon. Continuer ?"
      );
      if (!confirmDelete) return;

      setClips((prev) => prev.filter((clip) => clip !== selectedClip));
      setDraftClip(null);
    }

    setShowForm(false);
    setSelectedClip(null);
  };

  const handleDraftUpdate = (updatedClip) => {
    setClips((prev) =>
      prev.map((clip) => (clip === draftClip ? updatedClip : clip))
    );
    setDraftClip(updatedClip);
    setSelectedClip(updatedClip);
  };

  const addNewClip = (clip) => {
    // remplace le brouillon par la version finale
    setClips((prev) =>
      prev.map((c) => (c === draftClip ? { ...clip, draft: false } : c))
    );
    setShowForm(false);
    setSelectedClip(clip);
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
          clip.tags.some((tag) => selectedTags.includes(tag))
        );

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <header className="bg-indigo-950 text-white p-4 shadow-md">
        <h1 className="text-xl font-bold">Mes Clips</h1>
      </header>

      {/* 3 colonnes sous le header */}
      <div className="flex flex-1 h-0">
        {/* Colonne gauche : liste des clips */}
        <aside className="w-1/4 max-w-sm bg-gray-700 border-r border-gray-300 flex flex-col">
          {/* En-tête liste */}
          <div className="p-4 border-b font-bold text-lg flex text-gray-50 justify-between items-center">
            <span>Liste des clips</span>
            <button
              onClick={() => setShowFilterModal(true)}
              className="text-sm text-indigo-400 hover:text-indigo-500"
            >
              Filtrer
            </button>
          </div>

          {/* Liste scrollable */}
          <div className="flex-1 overflow-y-auto">
            <ClipList
              clips={filteredClips}
              onSelect={setSelectedClip}
              selectedClip={selectedClip}
            />
          </div>

          {/* Bouton proposer en bas */}
          <div className="p-4 border-t">
            <button
              onClick={handleProposeClick}
              className="w-full px-3 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600 text-sm"
            >
              Proposer un clip
            </button>
          </div>
        </aside>

        {/* Colonne centrale : zone scrollable */}
        <main className="flex-1 bg-gray-800 h-full p-6">
          {!showForm && selectedClip && <ClipViewer clip={selectedClip} />}
          {showForm && (
            <ClipForm
              allTags={allTags}
              onSubmit={addNewClip}
              onAddTag={addNewTag}
              onCancel={handleCancelForm}
              onChange={handleDraftUpdate}
              initialData={selectedClip}
            />
          )}
        </main>

        {/* Colonne droite : image + bouton (fixes) */}
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

      {/* Modale de filtres */}
      {showFilterModal && (
        <TagFilterModal
          allTags={allTags}
          selectedTags={selectedTags}
          toggleTag={toggleTag}
          onClose={() => setShowFilterModal(false)}
        />
      )}
    </div>
  );
}

export default App;

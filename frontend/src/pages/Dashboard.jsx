import {
  useCallback,
  useEffect,
  useState,
} from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  FileText,
  Layers3,
  Plus,
  Radio,
  ShieldCheck,
  Users,
} from "lucide-react";
import API from "../services/api";
import Navbar from "../components/Navbar";
import CreateNote from "../components/CreateNote";
import NoteCard from "../components/NoteCard";
import Pagination from "../components/Pagination";
import socket, { refreshSocketAuth } from "../socket/socket";

function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();

  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [editData, setEditData] = useState({
    title: "",
    content: "",
    version: 0,
  });
  const [formData, setFormData] = useState({
    title: "",
    content: "",
  });
  const [darkMode, setDarkMode] = useState(
    () => localStorage.getItem("theme") === "dark"
  );

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userName = user?.name || "User";
  const userInitials = userName
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const sharedNotes = notes.filter((note) => note.collaborators?.length).length;
  const privateNotes = notes.length - sharedNotes;

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.setItem("theme", "light");
    document.documentElement.classList.remove("dark");
    setDarkMode(false);
    navigate("/");
  };

  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  };

  const handleSearchChange = (value) => {
    setSearch(value);
    setPage(1);
  };

  const getNotes = useCallback(async () => {
    setLoading(true);

    try {
      const response = await API.get(`/notes?search=${search}&page=${page}`);

      setNotes(response.data.notes);
      setHasMore(response.data.notes.length === 5);
    } catch (error) {
      console.log(error);
      toast.error("Failed to load notes");
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  const handleCreateNote = async (event) => {
    event.preventDefault();

    try {
      const response = await API.post("/notes", formData);

      toast.success(response.data.message);
      getNotes();
      setFormData({
        title: "",
        content: "",
      });
    } catch (error) {
      console.log(error);
      toast.error("Failed to create note");
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await API.delete(`/notes/${id}`);

      toast.success(response.data.message);
      getNotes();
    } catch (error) {
      console.log(error);
      toast.error("Failed to delete note");
    }
  };

  const handleEditClick = (note) => {
    setEditingId(note._id);
    setEditData({
      title: note.title,
      content: note.content,
      version: note.version,
    });
  };

  const handleUpdateNote = async (id) => {
    try {
      const response = await API.put(`/notes/${id}`, editData);

      toast.success(response.data.message);
      setEditingId(null);
      getNotes();
    } catch (error) {
      console.log(error);

      if (error.response?.status === 409) {
        toast.error("Conflict detected. Latest note loaded, try again.");
        getNotes();
      } else {
        toast.error("Failed to update note");
      }
    }
  };

  const handleShareNote = async (id) => {
    const email = window.prompt(
      "Enter the registered email address to share this note with:"
    );

    if (!email) return;

    try {
      const response = await API.post(`/notes/${id}/share`, { email });

      toast.success(response.data.message);
      getNotes();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to share note");
    }
  };

  useEffect(() => {
    const loadNotes = async () => {
      await getNotes();
    };

    loadNotes();
  }, [getNotes, location.key]);

  useEffect(() => {
    const refreshNotes = () => {
      if (document.visibilityState === "visible") {
        getNotes();
      }
    };

    window.addEventListener("focus", getNotes);
    document.addEventListener("visibilitychange", refreshNotes);
    window.addEventListener("pageshow", getNotes);

    return () => {
      window.removeEventListener("focus", getNotes);
      document.removeEventListener("visibilitychange", refreshNotes);
      window.removeEventListener("pageshow", getNotes);
    };
  }, [getNotes]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    localStorage.setItem("theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  useEffect(() => {
    const handleConnect = () => {
      setIsConnected(true);
      setIsReconnecting(false);
    };

    const handleDisconnect = () => {
      setIsConnected(false);
      setIsReconnecting(true);
    };

    const handleReconnectAttempt = () => {
      refreshSocketAuth();
      setIsConnected(false);
      setIsReconnecting(true);
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.io.on("reconnect_attempt", handleReconnectAttempt);

    if (!socket.connected) {
      refreshSocketAuth();
      socket.connect();
    }

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.io.off("reconnect_attempt", handleReconnectAttempt);
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 transition-colors dark:bg-gray-950 dark:text-white">
      <div className="flex min-h-screen flex-col lg:flex-row">
        <aside className="border-b border-slate-200 bg-white px-4 py-5 dark:border-gray-800 dark:bg-gray-950 lg:sticky lg:top-0 lg:h-screen lg:w-[310px] lg:border-b-0 lg:border-r">
          <div className="mb-7 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-slate-950 text-white dark:bg-white dark:text-slate-950">
              <Layers3 size={22} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-950 dark:text-white">
                NotesKeeper
              </h1>
              <p className="text-xs font-semibold text-slate-500 dark:text-gray-400">
                Real-time notes rooms
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => document.getElementById("create-note-title")?.focus()}
            className="mb-5 flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-sky-600 text-sm font-bold text-white transition hover:bg-sky-700"
          >
            <Plus size={17} />
            New collaborative note
          </button>

          <nav className="mb-5 space-y-1">
            <div className="flex items-center justify-between rounded-lg bg-slate-100 px-3 py-2 text-sm font-bold text-slate-900 dark:bg-gray-900 dark:text-white">
              <span className="inline-flex items-center gap-2">
                <FileText size={16} />
                All notes
              </span>
              <span>{notes.length}</span>
            </div>
            <div className="flex items-center justify-between rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 dark:text-gray-400">
              <span className="inline-flex items-center gap-2">
                <Users size={16} />
                Shared
              </span>
              <span>{sharedNotes}</span>
            </div>
            <div className="flex items-center justify-between rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 dark:text-gray-400">
              <span className="inline-flex items-center gap-2">
                <ShieldCheck size={16} />
                Private
              </span>
              <span>{privateNotes}</span>
            </div>
          </nav>

          <CreateNote
            formData={formData}
            handleChange={handleChange}
            handleCreateNote={handleCreateNote}
          />
        </aside>

        <main className="min-w-0 flex-1">
          <Navbar
            search={search}
            setSearch={handleSearchChange}
            handleLogout={handleLogout}
            userInitials={userInitials}
            userName={userName}
            darkMode={darkMode}
            setDarkMode={setDarkMode}
            isConnected={isConnected}
            isReconnecting={isReconnecting}
          />

          <section className="px-5 py-6 sm:px-7">
            <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
              <div>
                <p className="mb-2 inline-flex items-center gap-2 rounded-full bg-sky-50 px-3 py-1 text-xs font-bold text-sky-700 dark:bg-sky-950/40 dark:text-sky-300">
                  <Radio size={13} />
                  Live editing enabled
                </p>
                <h2 className="text-2xl font-bold text-slate-950 dark:text-white">
                  Your collaborative notes
                </h2>
                <p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-slate-500 dark:text-gray-400">
                  Open a live room to edit with collaborators, see typing,
                  presence, connection state, auto-save, and version updates.
                </p>
              </div>

              <div className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-600 shadow-sm dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300">
                Page {page}
              </div>
            </div>

            {loading ? (
              <div className="rounded-lg border border-slate-200 bg-white py-20 text-center shadow-sm dark:border-gray-800 dark:bg-gray-900">
                <p className="text-sm font-bold text-slate-500 dark:text-gray-400">
                  Loading notes...
                </p>
              </div>
            ) : notes.length === 0 ? (
              <div className="rounded-lg border border-dashed border-slate-300 bg-white py-20 text-center shadow-sm dark:border-gray-800 dark:bg-gray-900">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                  No notes found
                </h2>
                <p className="mt-2 text-sm font-medium text-slate-500 dark:text-gray-400">
                  Create your first collaborative note from the sidebar.
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-3">
                  {notes.map((note) => (
                    <NoteCard
                      key={note._id}
                      note={note}
                      editingId={editingId}
                      editData={editData}
                      setEditData={setEditData}
                      handleEditClick={handleEditClick}
                      handleUpdateNote={handleUpdateNote}
                      handleDelete={handleDelete}
                      handleShareNote={handleShareNote}
                      setEditingId={setEditingId}
                    />
                  ))}
                </div>

                <Pagination page={page} setPage={setPage} hasMore={hasMore} />
              </>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}

export default Dashboard;

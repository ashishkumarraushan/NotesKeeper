import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  CircleAlert,
  Cloud,
  CloudOff,
  Loader2,
  UserMinus,
  UserPlus,
  Users,
} from "lucide-react";
import socket, { refreshSocketAuth } from "../socket/socket";
import API from "../services/api";

function LiveNote() {
  const { id: noteId } = useParams();
  const navigate = useNavigate();

  const [content, setContent] = useState("");
  const [noteTitle, setNoteTitle] = useState("");
  const [users, setUsers] = useState([]);
  const [presenceEvents, setPresenceEvents] = useState([]);
  const [typingUsers, setTypingUsers] = useState({});
  const [isDirty, setIsDirty] = useState(false);
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [version, setVersion] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [autoSaveStatus, setAutoSaveStatus] = useState("idle");

  const autoSaveTimeoutRef = useRef(null);
  const typingTimersRef = useRef({});
  const presenceTimersRef = useRef([]);
  const lastTypingSentRef = useRef(0);
  const contentRef = useRef("");
  const dirtyRef = useRef(false);
  const versionRef = useRef(0);

  const currentUser = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  }, []);

  const fetchNote = useCallback(async () => {
    const response = await API.get(`/notes/${noteId}`);
    const note = response.data.note;

    setContent(note.content || "");
    setNoteTitle(note.title || "Untitled");
    setVersion(note.version || 0);
    setIsDirty(false);
    contentRef.current = note.content || "";
    versionRef.current = note.version || 0;
    dirtyRef.current = false;

    return note;
  }, [noteId]);

  useEffect(() => {
    contentRef.current = content;
  }, [content]);

  useEffect(() => {
    versionRef.current = version;
  }, [version]);

  useEffect(() => {
    dirtyRef.current = isDirty;
  }, [isDirty]);

  const saveLatestNote = useCallback(async () => {
    if (!noteId || !dirtyRef.current) return;

    const response = await API.put(`/notes/autosave/${noteId}`, {
      content: contentRef.current,
      version: versionRef.current,
    });

    const nextVersion = response.data.note?.version || versionRef.current + 1;

    setVersion(nextVersion);
    setIsDirty(false);
    setAutoSaveStatus("saved");
    versionRef.current = nextVersion;
    dirtyRef.current = false;
    localStorage.setItem("notes:last-updated", String(Date.now()));
  }, [noteId]);

  useEffect(() => {
    const loadNote = async () => {
      try {
        setLoading(true);
        setError(null);
        await fetchNote();
      } catch (loadError) {
        if ([401, 403].includes(loadError.response?.status)) {
          setError("You do not have access to this note.");
          setTimeout(() => navigate("/dashboard"), 1600);
        } else {
          setError(loadError.response?.data?.message || "Failed to load note.");
        }
      } finally {
        setLoading(false);
      }
    };

    if (noteId) {
      loadNote();
    }
  }, [fetchNote, navigate, noteId]);

  const joinRoom = useCallback(() => {
    if (!noteId) return;
    refreshSocketAuth();
    socket.emit("join-note", { noteId });
  }, [noteId]);

  const handleConnect = useCallback(async () => {
    setIsConnected(true);
    setIsReconnecting(false);

    try {
      await fetchNote();
    } catch {
      setError("Reconnected, but could not reload the latest note.");
    }

    joinRoom();
  }, [fetchNote, joinRoom]);

  const handleReceiveNote = useCallback(
    (update) => {
      if (!update || update.author?.userId === currentUser?.id) return;

      setContent(update.content || "");
      setVersion(update.version || 0);
      setIsDirty(false);
      contentRef.current = update.content || "";
      versionRef.current = update.version || 0;
      dirtyRef.current = false;
    },
    [currentUser?.id]
  );

  const handleJoinedNote = useCallback(({ note }) => {
    if (!note) return;
    setContent(note.content || "");
    setNoteTitle(note.title || "Untitled");
    setVersion(note.version || 0);
    contentRef.current = note.content || "";
    versionRef.current = note.version || 0;
    dirtyRef.current = false;
  }, []);

  const handleTyping = useCallback((data) => {
    if (!data?.userId || data.userId === currentUser?.id) return;

    setTypingUsers((previous) => ({
      ...previous,
      [data.userId]: data.userName || "User",
    }));

    clearTimeout(typingTimersRef.current[data.userId]);
    typingTimersRef.current[data.userId] = setTimeout(() => {
      setTypingUsers((previous) => {
        const updated = { ...previous };
        delete updated[data.userId];
        return updated;
      });
    }, 2500);
  }, [currentUser?.id]);

  const pushPresenceEvent = useCallback((type, data) => {
    if (!data?.userId || data.userId === currentUser?.id) return;

    const eventId = `${type}-${data.userId}-${Date.now()}`;

    setPresenceEvents((previous) =>
      [
        {
          id: eventId,
          type,
          userName: data.userName || "User",
        },
        ...previous,
      ].slice(0, 4)
    );

    const timeoutId = setTimeout(() => {
      setPresenceEvents((previous) =>
        previous.filter((event) => event.id !== eventId)
      );
    }, 5000);

    presenceTimersRef.current.push(timeoutId);
  }, [currentUser?.id]);

  useEffect(() => {
    if (!noteId || !currentUser) return;

    const handleDisconnect = () => {
      setIsConnected(false);
      setIsReconnecting(true);
      setUsers([]);
    };

    const handleSocketError = (socketError) => {
      setError(socketError?.message || "Socket connection error.");
    };

    const handleReconnectAttempt = () => {
      refreshSocketAuth();
      setIsConnected(false);
      setIsReconnecting(true);
    };

    const handleNoteConflict = async () => {
      try {
        setAutoSaveStatus("conflict");
        await fetchNote();
        setTimeout(() => setAutoSaveStatus("idle"), 3000);
      } catch {
        setAutoSaveStatus("error");
      }
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("joined-note", handleJoinedNote);
    socket.on("active-users", setUsers);
    socket.on("user-joined", (data) => pushPresenceEvent("joined", data));
    socket.on("user-left", (data) => pushPresenceEvent("left", data));
    socket.on("receive-note", handleReceiveNote);
    socket.on("user-typing", handleTyping);
    socket.on("socket-error", handleSocketError);
    socket.on("note-conflict", handleNoteConflict);
    socket.io.on("reconnect_attempt", handleReconnectAttempt);

    if (socket.connected) {
      joinRoom();
    } else {
      refreshSocketAuth();
      socket.connect();
    }

    return () => {
      socket.emit("leave-note", { noteId });
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("joined-note", handleJoinedNote);
      socket.off("active-users", setUsers);
      socket.off("user-joined");
      socket.off("user-left");
      socket.off("receive-note", handleReceiveNote);
      socket.off("user-typing", handleTyping);
      socket.off("socket-error", handleSocketError);
      socket.off("note-conflict", handleNoteConflict);
      socket.io.off("reconnect_attempt", handleReconnectAttempt);
      Object.values(typingTimersRef.current).forEach(clearTimeout);
      typingTimersRef.current = {};
      presenceTimersRef.current.forEach(clearTimeout);
      presenceTimersRef.current = [];
    };
  }, [
    currentUser,
    fetchNote,
    handleConnect,
    handleJoinedNote,
    handleReceiveNote,
    handleTyping,
    joinRoom,
    noteId,
    pushPresenceEvent,
  ]);

  useEffect(() => {
    if (!isDirty || !noteId) return;

    clearTimeout(autoSaveTimeoutRef.current);

    autoSaveTimeoutRef.current = setTimeout(async () => {
      try {
        setAutoSaveStatus("saving");
        await saveLatestNote();
        setAutoSaveStatus("saved");
        setTimeout(() => setAutoSaveStatus("idle"), 1800);
      } catch (saveError) {
        if (saveError.response?.status === 409) {
          setAutoSaveStatus("conflict");
          await fetchNote();
        } else {
          setAutoSaveStatus("error");
        }

        setTimeout(() => setAutoSaveStatus("idle"), 2500);
      }
    }, 1200);

    return () => clearTimeout(autoSaveTimeoutRef.current);
  }, [content, fetchNote, isDirty, noteId, saveLatestNote, version]);

  const handleBackToDashboard = async () => {
    clearTimeout(autoSaveTimeoutRef.current);

    try {
      setAutoSaveStatus("saving");
      await saveLatestNote();
    } catch {
      setAutoSaveStatus("error");
    } finally {
      navigate("/dashboard");
    }
  };

  const handleChange = (event) => {
    const value = event.target.value;
    const clientUpdatedAt = Date.now();

    setContent(value);
    setIsDirty(true);
    contentRef.current = value;
    dirtyRef.current = true;

    socket.emit("note-update", {
      noteId,
      content: value,
      version,
      clientUpdatedAt,
    });

    if (clientUpdatedAt - lastTypingSentRef.current > 900) {
      lastTypingSentRef.current = clientUpdatedAt;
      socket.emit("typing", { noteId });
    }
  };

  const visibleUsers = users.filter((user) => user.userId !== currentUser?.id);
  const typingNames = Object.values(typingUsers);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100 p-8 dark:bg-gray-950">
        <Loader2 className="h-10 w-10 animate-spin text-indigo-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100 p-8 dark:bg-gray-950">
        <div className="max-w-md rounded-lg bg-white p-8 text-center shadow-xl dark:bg-gray-900">
          <CircleAlert className="mx-auto mb-4 h-10 w-10 text-red-500" />
          <p className="mb-5 text-lg font-semibold text-red-600 dark:text-red-300">
            {error}
          </p>
          <button
            onClick={() => navigate("/dashboard")}
            className="rounded-lg bg-indigo-600 px-5 py-2 font-semibold text-white hover:bg-indigo-700"
          >
            Back to dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 text-slate-900 dark:bg-gray-950 dark:text-white sm:p-6">
      <div className="mx-auto max-w-7xl">
        <header className="mb-4 rounded-lg border border-slate-200 bg-white px-5 py-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <button
                onClick={handleBackToDashboard}
                className="mb-3 inline-flex items-center gap-2 text-sm font-bold text-slate-500 transition hover:text-sky-600 dark:text-gray-400 dark:hover:text-sky-300"
              >
                <ArrowLeft size={16} />
                Dashboard
              </button>
              <h1 className="text-2xl font-bold text-slate-950 dark:text-white sm:text-3xl">
                {noteTitle}
              </h1>
              <p className="mt-2 text-sm font-medium text-slate-500 dark:text-gray-400">
                Editing as {currentUser?.name || "User"} in a note-specific live room.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div
                className={`inline-flex h-10 items-center gap-2 rounded-lg border px-3 text-sm font-bold ${
                  isConnected
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300"
                    : isReconnecting
                    ? "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300"
                    : "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300"
                }`}
              >
                {isConnected ? <Cloud size={17} /> : <CloudOff size={17} />}
                {isConnected ? "Connected" : isReconnecting ? "Reconnecting" : "Offline"}
              </div>

              <div className="inline-flex h-10 items-center rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm font-bold text-slate-600 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-300">
                Version {version}
              </div>

              <div className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm font-bold text-slate-600 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-300">
                {autoSaveStatus === "saving" && (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving
                  </>
                )}
                {autoSaveStatus === "saved" && (
                  <>
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    Saved
                  </>
                )}
                {autoSaveStatus === "error" && (
                  <>
                    <CircleAlert className="h-4 w-4 text-rose-500" />
                    Save failed
                  </>
                )}
                {autoSaveStatus === "conflict" && (
                  <>
                    <CircleAlert className="h-4 w-4 text-amber-500" />
                    Latest loaded
                  </>
                )}
                {autoSaveStatus === "idle" && (isDirty ? "Unsaved" : "Auto-save ready")}
              </div>
            </div>
          </div>
        </header>

        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
          <main className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-6">
            {typingNames.length > 0 && (
              <div className="mb-4 rounded-lg border border-sky-100 bg-sky-50 px-4 py-3 text-sm font-bold text-sky-700 dark:border-sky-900 dark:bg-sky-950/40 dark:text-sky-300">
                {typingNames.join(", ")} {typingNames.length === 1 ? "is" : "are"} typing...
              </div>
            )}

            <textarea
              value={content}
              onChange={handleChange}
              placeholder="Start typing your note here..."
              className="min-h-[68vh] w-full resize-none rounded-lg border border-slate-200 bg-slate-50 p-5 text-base leading-8 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sky-300 focus:bg-white focus:ring-4 focus:ring-sky-100 dark:border-gray-800 dark:bg-gray-950 dark:text-white dark:focus:border-sky-700 dark:focus:ring-sky-950 sm:text-lg"
            />

            <div className="mt-3 flex flex-col justify-between gap-2 text-xs font-semibold text-slate-500 dark:text-gray-400 sm:flex-row">
              <span>Updates are scoped to this note room and auto-saved.</span>
              <span>{content.length} characters</span>
            </div>
          </main>

          <aside className="space-y-4">
            <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-slate-600 dark:text-gray-300">
                  <Users size={16} />
                  Collaborators
                </h2>
                <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-bold text-slate-600 dark:bg-gray-800 dark:text-gray-300">
                  {visibleUsers.length + 1}
                </span>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-3 rounded-lg bg-emerald-50 px-3 py-2 text-sm font-bold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  {currentUser?.name || "You"} (You)
                </div>
                {visibleUsers.map((user) => (
                  <div
                    key={user.socketId}
                    className="flex items-center gap-3 rounded-lg bg-slate-50 px-3 py-2 text-sm font-bold text-slate-700 dark:bg-gray-950 dark:text-gray-300"
                  >
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    {user.userName}
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
              <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-600 dark:text-gray-300">
                Room activity
              </h2>

              {presenceEvents.length > 0 ? (
                <div className="space-y-2">
                  {presenceEvents.map((event) => (
                    <div
                      key={event.id}
                      className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold ${
                        event.type === "joined"
                          ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                          : "bg-slate-100 text-slate-600 dark:bg-gray-800 dark:text-gray-300"
                      }`}
                    >
                      {event.type === "joined" ? (
                        <UserPlus size={15} />
                      ) : (
                        <UserMinus size={15} />
                      )}
                      {event.userName} {event.type === "joined" ? "joined" : "left"}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm font-medium leading-6 text-slate-500 dark:text-gray-400">
                  Join and leave events appear here while collaborators move through the room.
                </p>
              )}
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}

export default LiveNote;

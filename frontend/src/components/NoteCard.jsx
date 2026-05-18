import {
  CalendarClock,
  Lock,
  Pencil,
  Radio,
  Share2,
  Trash2,
  Users,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

function NoteCard({
  note,
  editingId,
  editData,
  setEditData,
  handleEditClick,
  handleUpdateNote,
  handleDelete,
  handleShareNote,
  setEditingId,
}) {
  const navigate = useNavigate();
  const isShared = Boolean(note.collaborators?.length);
  const updatedAt = new Date(note.updatedAt || note.createdAt).toLocaleString(
    undefined,
    {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }
  );

  if (editingId === note._id) {
    return (
      <article className="rounded-lg border border-sky-200 bg-white p-5 shadow-sm ring-4 ring-sky-50 dark:border-sky-900 dark:bg-gray-900 dark:ring-sky-950/40">
        <input
          type="text"
          value={editData.title}
          onChange={(event) =>
            setEditData({
              ...editData,
              title: event.target.value,
            })
          }
          className="mb-3 h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm font-bold text-slate-900 outline-none focus:border-sky-300 focus:ring-4 focus:ring-sky-100 dark:border-gray-800 dark:bg-gray-950 dark:text-white"
        />

        <textarea
          value={editData.content}
          onChange={(event) =>
            setEditData({
              ...editData,
              content: event.target.value,
            })
          }
          rows="6"
          className="mb-4 w-full resize-none rounded-lg border border-slate-200 bg-slate-50 px-3 py-3 text-sm font-medium leading-6 text-slate-700 outline-none focus:border-sky-300 focus:ring-4 focus:ring-sky-100 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-100"
        />

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => handleUpdateNote(note._id)}
            className="h-10 rounded-lg bg-slate-950 text-sm font-bold text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-950"
          >
            Save
          </button>
          <button
            onClick={() => setEditingId(null)}
            className="h-10 rounded-lg border border-slate-200 bg-white text-sm font-bold text-slate-600 transition hover:bg-slate-50 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300"
          >
            Cancel
          </button>
        </div>
      </article>
    );
  }

  return (
    <article className="group flex min-h-[260px] flex-col rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-sky-200 hover:shadow-md dark:border-gray-800 dark:bg-gray-900 dark:hover:border-sky-900">
      <div className="mb-4 flex items-start justify-between gap-3">
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${
            isShared
              ? "bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300"
              : "bg-slate-100 text-slate-600 dark:bg-gray-800 dark:text-gray-300"
          }`}
        >
          {isShared ? <Users size={13} /> : <Lock size={13} />}
          {isShared ? "Shared" : "Private"}
        </span>

        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 dark:text-gray-500">
          <CalendarClock size={13} />
          {updatedAt}
        </span>
      </div>

      <h2 className="line-clamp-2 text-xl font-bold leading-7 text-slate-950 dark:text-white">
        {note.title}
      </h2>

      <p className="mt-3 line-clamp-4 flex-1 text-sm font-medium leading-6 text-slate-600 dark:text-gray-400">
        {note.content}
      </p>

      <div className="mt-5 border-t border-slate-100 pt-4 dark:border-gray-800">
        <button
          onClick={() => navigate(`/live-note/${note._id}`)}
          className="mb-3 flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-sky-600 text-sm font-bold text-white transition hover:bg-sky-700"
        >
          <Radio size={16} />
          Open live room
        </button>

        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => handleEditClick(note)}
            className="flex h-9 items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white text-xs font-bold text-slate-600 transition hover:bg-slate-50 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            <Pencil size={14} />
            Edit
          </button>
          <button
            onClick={() => handleShareNote(note._id)}
            className="flex h-9 items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white text-xs font-bold text-slate-600 transition hover:bg-slate-50 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            <Share2 size={14} />
            Share
          </button>
          <button
            onClick={() => handleDelete(note._id)}
            className="flex h-9 items-center justify-center gap-1.5 rounded-lg border border-rose-100 bg-rose-50 text-xs font-bold text-rose-600 transition hover:bg-rose-100 dark:border-rose-950 dark:bg-rose-950/30 dark:text-rose-300"
          >
            <Trash2 size={14} />
            Delete
          </button>
        </div>
      </div>
    </article>
  );
}

export default NoteCard;

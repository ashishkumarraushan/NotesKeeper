import {
  FilePlus2,
  Plus,
} from "lucide-react";

function CreateNote({
  formData,
  handleChange,
  handleCreateNote,
}) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-50 text-sky-600 dark:bg-sky-950/40 dark:text-sky-300">
          <FilePlus2 size={20} />
        </div>
        <div>
          <h2 className="text-base font-bold text-slate-950 dark:text-white">
            New note
          </h2>
          <p className="text-xs font-medium text-slate-500 dark:text-gray-400">
            Create a room-ready document.
          </p>
        </div>
      </div>

      <form onSubmit={handleCreateNote} className="space-y-3">
        <input
          id="create-note-title"
          type="text"
          name="title"
          placeholder="Note title"
          value={formData.title}
          onChange={handleChange}
          className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm font-semibold text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-sky-300 focus:bg-white focus:ring-4 focus:ring-sky-100 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-100 dark:focus:border-sky-700 dark:focus:ring-sky-950"
        />

        <textarea
          name="content"
          placeholder="Start with a short brief..."
          value={formData.content}
          onChange={handleChange}
          rows="6"
          className="min-h-[150px] w-full resize-none rounded-lg border border-slate-200 bg-slate-50 px-3 py-3 text-sm font-medium leading-6 text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-sky-300 focus:bg-white focus:ring-4 focus:ring-sky-100 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-100 dark:focus:border-sky-700 dark:focus:ring-sky-950"
        />

        <button
          type="submit"
          className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-slate-950 text-sm font-bold text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-gray-200"
        >
          <Plus size={17} />
          Create note
        </button>
      </form>
    </section>
  );
}

export default CreateNote;

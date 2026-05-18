import {
  LogOut,
  Moon,
  Search,
  Sun,
} from "lucide-react";

function Navbar({
  search,
  setSearch,
  handleLogout,
  userInitials,
  userName,
  darkMode,
  setDarkMode,
  isConnected,
  isReconnecting,
}) {
  const connectionLabel = isConnected
    ? "Connected"
    : isReconnecting
    ? "Reconnecting"
    : "Offline";

  return (
    <header className="flex flex-col gap-4 border-b border-slate-200 bg-white/90 px-5 py-4 backdrop-blur dark:border-gray-800 dark:bg-gray-950/90 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <p className="text-sm font-medium text-slate-500 dark:text-gray-400">
          Collaborative workspace
        </p>
        <h1 className="text-2xl font-bold text-slate-950 dark:text-white">
          Notes
        </h1>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative min-w-0 sm:w-[360px]">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            size={18}
          />
          <input
            type="text"
            placeholder="Search notes, rooms, collaborators..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-sky-300 focus:bg-white focus:ring-4 focus:ring-sky-100 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-100 dark:focus:border-sky-700 dark:focus:ring-sky-950"
          />
        </div>

        <div
          className={`inline-flex h-11 items-center gap-2 rounded-lg border px-3 text-sm font-semibold ${
            isConnected
              ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300"
              : isReconnecting
              ? "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300"
              : "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300"
          }`}
        >
          <span
            className={`h-2 w-2 rounded-full ${
              isConnected
                ? "bg-emerald-500"
                : isReconnecting
                ? "bg-amber-500"
                : "bg-rose-500"
            }`}
          />
          {connectionLabel}
        </div>

        <button
          type="button"
          onClick={() => setDarkMode((previous) => !previous)}
          className="flex h-11 w-11 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
          title="Toggle theme"
        >
          {darkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2 dark:border-gray-800 dark:bg-gray-900">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white dark:bg-white dark:text-slate-950">
            {userInitials}
          </div>
          <div className="hidden leading-tight sm:block">
            <p className="text-sm font-bold text-slate-900 dark:text-white">
              {userName}
            </p>
            <p className="text-xs font-medium text-slate-500 dark:text-gray-400">
              Workspace user
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="flex h-11 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-bold text-slate-600 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300 dark:hover:border-rose-900 dark:hover:bg-rose-950/30 dark:hover:text-rose-300"
        >
          <LogOut size={17} />
          Logout
        </button>
      </div>
    </header>
  );
}

export default Navbar;

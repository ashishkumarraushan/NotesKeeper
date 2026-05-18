import {
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

function Pagination({
  page,
  setPage,
  hasMore,
}) {
  return (
    <div className="mt-12 flex items-center justify-center gap-3">
      <button
        onClick={() => setPage((prev) => (prev > 1 ? prev - 1 : 1))}
        disabled={page === 1}
        className={`flex h-12 w-12 items-center justify-center rounded-[10px] border transition ${
          page === 1
            ? "border-slate-200 bg-white text-slate-400 cursor-not-allowed dark:border-gray-800 dark:bg-gray-900 dark:text-gray-600"
            : "border-slate-200 bg-white text-slate-600 shadow-sm hover:bg-slate-50 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100 dark:hover:bg-gray-800"
        }`}
      >
        <ChevronLeft size={20} />
      </button>

      <div className="flex h-12 w-12 items-center justify-center rounded-[10px] bg-gradient-to-br from-indigo-600 to-violet-700 font-bold text-white shadow-[0_12px_26px_rgba(79,70,229,0.28)]">
        {page}
      </div>

      <button
        onClick={() => {
          if (hasMore) {
            setPage((prev) => prev + 1);
          }
        }}
        disabled={!hasMore}
        className={`flex h-12 w-12 items-center justify-center rounded-[10px] border transition ${
          !hasMore
            ? "border-slate-200 bg-white text-slate-400 cursor-not-allowed dark:border-gray-800 dark:bg-gray-900 dark:text-gray-600"
            : "border-slate-200 bg-white text-slate-600 shadow-sm hover:bg-slate-50 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100 dark:hover:bg-gray-800"
        }`}
      >
        <ChevronRight size={20} />
      </button>
    </div>
  );
}

export default Pagination;

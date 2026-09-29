export const helpMarkdownComponents = {
  h1: ({ node, ...props }) => (
    <h1 className="text-xl font-bold text-slate-900 mb-2 mt-4" {...props} />
  ),
  h2: ({ node, ...props }) => (
    <h2
      className="text-base font-semibold text-slate-800 mt-5 mb-2"
      {...props}
    />
  ),
  h3: ({ node, ...props }) => (
    <h3
      className="text-sm font-semibold text-slate-800 mt-4 mb-1.5"
      {...props}
    />
  ),
  h4: ({ node, ...props }) => (
    <h4 className="text-sm font-semibold text-slate-700 mt-3 mb-1" {...props} />
  ),
  h6: ({ node, ...props }) => (
    <h6
      className="text-xs font-bold text-slate-600 uppercase tracking-wide mt-3 mb-1"
      {...props}
    />
  ),
  strong: ({ node, ...props }) => (
    <strong className="font-semibold text-slate-800" {...props} />
  ),
  p: ({ node, ...props }) => (
    <p className="text-sm text-slate-600 mb-3 leading-relaxed" {...props} />
  ),
  ul: ({ node, ...props }) => (
    <ul className="list-disc list-inside space-y-1.5 mb-3" {...props} />
  ),
  ol: ({ node, ...props }) => (
    <ol className="list-decimal list-inside space-y-1.5 mb-3" {...props} />
  ),
  li: ({ node, ...props }) => (
    <li className="text-sm text-slate-700" {...props} />
  ),
  table: ({ node, ...props }) => (
    <div className="overflow-x-auto mb-4">
      <table
        className="min-w-full text-sm border border-slate-200 rounded-lg"
        {...props}
      />
    </div>
  ),
  thead: ({ node, ...props }) => <thead className="bg-slate-50" {...props} />,
  th: ({ node, ...props }) => (
    <th
      className="text-left font-semibold text-slate-700 px-3 py-2 border-b border-slate-200"
      {...props}
    />
  ),
  td: ({ node, ...props }) => (
    <td
      className="px-3 py-2 border-b border-slate-100 text-slate-600 align-top"
      {...props}
    />
  ),
  a: ({ node, ...props }) => (
    <a
      className="text-blue-600 hover:text-blue-700 hover:underline font-medium cursor-pointer"
      {...props}
      onClick={(e) => e.preventDefault()}
    />
  ),
  hr: () => <hr className="my-4 border-slate-100" />,
  em: ({ node, ...props }) => (
    <em className="text-xs text-slate-400 not-italic" {...props} />
  ),
  img: ({ node, ...props }) => (
    <img
      className="rounded-lg border border-slate-200 shadow-sm my-4 w-full block"
      loading="lazy"
      {...props}
    />
  ),
};

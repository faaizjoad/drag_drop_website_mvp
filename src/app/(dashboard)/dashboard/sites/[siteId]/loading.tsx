export default function SiteLoading() {
  return (
    <div className="px-4 sm:px-8 py-8 max-w-4xl mx-auto space-y-8 animate-pulse">
      {/* Breadcrumb */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <div className="h-4 w-10 bg-gray-200 rounded" />
          <div className="h-4 w-3 bg-gray-200 rounded" />
          <div className="h-4 w-24 bg-gray-200 rounded" />
        </div>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 bg-gray-200 rounded-lg" />
            <div>
              <div className="h-7 w-40 bg-gray-200 rounded-lg mb-1" />
              <div className="h-3 w-24 bg-gray-200 rounded" />
            </div>
          </div>
          <div className="h-9 w-24 bg-gray-200 rounded-lg" />
        </div>
      </div>

      {/* Settings card */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="h-4 w-24 bg-gray-200 rounded mb-5" />
        <div className="space-y-4">
          <div className="h-9 bg-gray-100 rounded-lg" />
          <div className="h-9 bg-gray-100 rounded-lg" />
        </div>
      </div>

      {/* Theme card */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="h-4 w-16 bg-gray-200 rounded mb-5" />
        <div className="grid grid-cols-5 gap-3 mb-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-8 bg-gray-100 rounded-lg" />
          ))}
        </div>
      </div>

      {/* Pages */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="h-5 w-16 bg-gray-200 rounded" />
          <div className="h-9 w-24 bg-gray-200 rounded-lg" />
        </div>
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-4 py-4 border-b border-gray-100 last:border-0">
              <div className="h-4 w-4 bg-gray-200 rounded-full" />
              <div className="flex-1">
                <div className="h-4 w-32 bg-gray-200 rounded mb-1" />
                <div className="h-3 w-16 bg-gray-200 rounded" />
              </div>
              <div className="h-5 w-16 bg-gray-200 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

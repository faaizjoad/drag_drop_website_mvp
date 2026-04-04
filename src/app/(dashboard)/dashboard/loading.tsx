export default function DashboardLoading() {
  return (
    <div className="px-4 sm:px-8 py-8 max-w-6xl mx-auto animate-pulse">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="h-7 w-20 bg-gray-200 rounded-lg mb-2" />
          <div className="h-4 w-28 bg-gray-200 rounded" />
        </div>
        <div className="h-9 w-24 bg-gray-200 rounded-lg" />
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="p-5">
              <div className="flex justify-between items-start mb-3">
                <div className="h-5 w-2/3 bg-gray-200 rounded" />
                <div className="h-4 w-4 bg-gray-200 rounded" />
              </div>
              <div className="h-3 w-1/2 bg-gray-200 rounded mb-4" />
              <div className="flex gap-4">
                <div className="h-3 w-14 bg-gray-200 rounded" />
                <div className="h-3 w-18 bg-gray-200 rounded" />
              </div>
            </div>
            <div className="px-5 py-3 border-t border-gray-100 bg-gray-50">
              <div className="h-3 w-16 bg-gray-200 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

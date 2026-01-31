export default function SeverityLegend() {
  return (
    <div className="absolute bottom-6 left-6 bg-black/60 backdrop-blur-md rounded-lg p-4 border border-white/10">
      <div className="text-sm font-semibold text-white mb-3">Severity Levels</div>
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-critical"></div>
          <span className="text-xs text-gray-300">Critical (9-10)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-high"></div>
          <span className="text-xs text-gray-300">High (7-8.9)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-medium"></div>
          <span className="text-xs text-gray-300">Medium (5-6.9)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-low"></div>
          <span className="text-xs text-gray-300">Low (3-4.9)</span>
        </div>
      </div>
    </div>
  )
}

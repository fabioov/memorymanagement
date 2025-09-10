"use client";

interface AllocationMetricsProps {
  processCount: number;
  memoryInfo: {
    free: number;
    used: number;
  };
  externalFragmentation: number;
}

export default function AllocationMetrics({
  processCount,
  memoryInfo,
  externalFragmentation,
}: AllocationMetricsProps) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 w-full max-w-sm">
      <h3 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2 text-center">Métricas</h3>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-2">
          <span className="text-base font-medium text-gray-700">Processos alocados:</span>
          <div className="w-px h-4 bg-gray-300 mx-2"></div>
          <span className="text-xl font-bold text-blue-600 text-right">{processCount}</span>
        </div>
        
        <div className="flex items-center justify-between gap-2">
          <span className="text-base font-medium text-gray-700">Memória livre:</span>
          <div className="w-px h-4 bg-gray-300 mx-2"></div>
          <span className="text-xl font-bold text-green-600 text-right whitespace-nowrap">{memoryInfo.free} un</span>
        </div>
        
        <div className="flex items-center justify-between gap-2">
          <span className="text-base font-medium text-gray-700">Memória utilizada:</span>
          <div className="w-px h-4 bg-gray-300 mx-2"></div>
          <span className="text-xl font-bold text-blue-600 text-right whitespace-nowrap">{memoryInfo.used} un</span>
        </div>
        
        <div className="flex items-center justify-between gap-2">
          <span className="text-base font-medium text-gray-700">Fragmentação Externa:</span>
          <div className="w-px h-4 bg-gray-300 mx-2"></div>
          <span className="text-xl font-bold text-orange-600 text-right whitespace-nowrap">{externalFragmentation.toFixed(2)}%</span>
        </div>
      </div>
    </div>
  );
}
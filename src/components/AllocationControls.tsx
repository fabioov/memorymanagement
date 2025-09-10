"use client";
import * as Label from "@radix-ui/react-label";

interface Props {
  memorySize: string;
  processSize: string;
  algorithm: string;
  setMemorySize: (v: string) => void;
  setProcessSize: (v: string) => void;
  setAlgorithm: (v: string) => void;
}

export default function AllocationControls({
  memorySize,
  processSize,
  algorithm,
  setMemorySize,
  setProcessSize,
  setAlgorithm,
}: Props) {
  return (
    <div className="space-y-4 mb-8">
      <div>
        <Label.Root
          className="block text-sm font-medium text-gray-900 mb-1"
          htmlFor="memory-size"
        >
          Tamanho da Memória
        </Label.Root>
        <input
          type="number"
          id="memory-size"
          className="w-full p-2 border rounded text-gray-800 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          value={memorySize}
          onChange={(e) => setMemorySize(e.target.value)}
          min={1}
        />
      </div>

      <div>
        <Label.Root
          className="block text-sm font-medium text-gray-900 mb-1"
          htmlFor="process-size"
        >
          Tamanho do Processo
        </Label.Root>
        <input
          type="number"
          id="process-size"
          className="w-full p-2 border rounded text-gray-800 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          value={processSize}
          onChange={(e) => setProcessSize(e.target.value)}
          min={1}
        />
      </div>

      <div>
        <Label.Root
          className="block text-sm font-medium text-gray-900 mb-1"
          htmlFor="algorithm"
        >
          Algoritmo de Alocação
        </Label.Root>
        <select
          id="algorithm"
          className="w-full p-2 border rounded text-gray-800 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          value={algorithm}
          onChange={(e) => setAlgorithm(e.target.value)}
        >
          <option value="first-fit">First-Fit</option>
          <option value="best-fit">Best-Fit</option>
          <option value="worst-fit">Worst-Fit</option>
          <option value="circular-fit">Circular-Fit</option>
        </select>
      </div>
    </div>
  );
}

"use client";

import React from "react";
import * as Label from "@radix-ui/react-label";

interface PaginationControlsProps {
  pageMemorySize: string;
  pageSize: string;
  requestSequence: string;
  algorithm: string;
  setPageMemorySize: (value: string) => void;
  setPageSize: (value: string) => void;
  setRequestSequence: (value: string) => void;
  setAlgorithm: (value: string) => void;
}

export default function PaginationControls({
  pageMemorySize,
  pageSize,
  requestSequence,
  algorithm,
  setPageMemorySize,
  setPageSize,
  setRequestSequence,
  setAlgorithm,
}: PaginationControlsProps) {
  return (
    <div className="space-y-4 mb-8">
      <div>
        <Label.Root
          className="block text-sm font-medium text-gray-900 mb-1"
          htmlFor="page-memory-size"
        >
          Tamanho da Memória (em frames)
        </Label.Root>
        <input
          type="number"
          id="page-memory-size"
          className="w-full p-2 border rounded text-gray-800 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          value={pageMemorySize}
          onChange={(e) => setPageMemorySize(e.target.value)}
          min={1}
        />
      </div>

      <div>
        <Label.Root
          className="block text-sm font-medium text-gray-900 mb-1"
          htmlFor="page-size"
        >
          Número Total de Páginas
        </Label.Root>
        <input
          type="number"
          id="page-size"
          className="w-full p-2 border rounded text-gray-800 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          value={pageSize}
          onChange={(e) => setPageSize(e.target.value)}
          min={1}
        />
      </div>

      <div>
        <Label.Root
          className="block text-sm font-medium text-gray-900 mb-1"
          htmlFor="request-sequence"
        >
          Sequência de Requisições (páginas separadas por vírgula)
        </Label.Root>
        <input
          type="text"
          id="request-sequence"
          className="w-full p-2 border rounded text-gray-800 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder:text-gray-500"
          value={requestSequence}
          onChange={(e) => setRequestSequence(e.target.value)}
          placeholder="Ex: 1,2,3,4,5,1,2"
        />
      </div>

      <div>
        <Label.Root
          className="block text-sm font-medium text-gray-900 mb-1"
          htmlFor="algorithm"
        >
          Algoritmo de Substituição
        </Label.Root>
        <select
          id="algorithm"
          className="w-full p-2 border rounded text-gray-800 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          value={algorithm}
          onChange={(e) => setAlgorithm(e.target.value)}
        >
          <option value="fifo">FIFO (First-In-First-Out)</option>
          <option value="lru">LRU (Least Recently Used)</option>
          <option value="optimal">Ótimo</option>
        </select>
      </div>
    </div>
  );
}
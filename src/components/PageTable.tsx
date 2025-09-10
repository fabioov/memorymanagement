"use client";

import React, { useEffect, useRef } from "react";

interface PageTableProps {
  frames: Array<{
    frameId: number;
    pageId: number | null;
    lastUsed: number;
  }>;
  pageFaults: number;
  highlightFrame: number | null;
}

export default function PageTable({ frames, pageFaults, highlightFrame }: PageTableProps) {
  const pageFaultCounterRef = useRef<HTMLDivElement>(null);
  const tableRowRefs = useRef<(HTMLTableRowElement | null)[]>([]);

  // Efeito para animar o contador de page faults quando ele aumenta
  useEffect(() => {
    if (pageFaultCounterRef.current) {
      pageFaultCounterRef.current.classList.add("scale-110", "text-red-600");
      const timer = setTimeout(() => {
        pageFaultCounterRef.current?.classList.remove("scale-110", "text-red-600");
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [pageFaults]);

  // Efeito para destacar a linha da tabela quando ocorre um page fault
  useEffect(() => {
    if (highlightFrame !== null && tableRowRefs.current[highlightFrame]) {
      const row = tableRowRefs.current[highlightFrame];
      row?.classList.add("bg-red-100");
      const timer = setTimeout(() => {
        row?.classList.remove("bg-red-100");
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [highlightFrame]);

  return (
    <div className="mt-6 space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Tabela de Frames</h3>
      </div>
      
      <div className="overflow-hidden border rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Frame ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Page ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Último Acesso
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {frames.map((frame, index) => (
              <tr 
                key={frame.frameId}
                ref={(el) => {
                  tableRowRefs.current[index] = el;
                  return undefined;
                }}
                className="transition-colors duration-300"
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {frame.frameId}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {frame.pageId !== null ? frame.pageId : "-"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {frame.lastUsed > 0 ? frame.lastUsed : "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
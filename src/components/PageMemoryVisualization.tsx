"use client";

import React from "react";

interface PageMemoryVisualizationProps {
  frames: Array<{
    frameId: number;
    pageId: number | null;
    lastUsed: number;
    loadedAt: number;
  }>;
  totalFrames: number;
  highlightFrame: number | null;
}

export default function PageMemoryVisualization({
  frames,
  totalFrames,
  highlightFrame,
}: PageMemoryVisualizationProps) {
  // Determina o tamanho dos frames com base na quantidade
  const getFrameSize = () => {
    if (frames.length <= 10) return 'w-14 h-14'; // Tamanho padrão para poucos frames
    if (frames.length <= 20) return 'w-12 h-12'; // Tamanho médio para quantidade média
    return 'w-10 h-10'; // Tamanho menor para muitos frames
  };

  // Determina o tamanho da fonte com base na quantidade de frames
  const getFontSize = () => {
    if (frames.length <= 10) return 'text-lg'; // Fonte padrão para poucos frames
    if (frames.length <= 20) return 'text-base'; // Fonte média para quantidade média
    return 'text-sm'; // Fonte menor para muitos frames
  };

  // Determina o espaçamento entre os frames
  const getGapSize = () => {
    if (frames.length <= 10) return 'gap-2';
    if (frames.length <= 20) return 'gap-1.5';
    return 'gap-1';
  };

  const frameSize = getFrameSize();
  const fontSize = getFontSize();
  const gapSize = getGapSize();

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">Visualização da Memória</h3>
      <div className="border rounded-lg p-3 bg-gray-50 max-h-[300px] overflow-y-auto">
        <div className={`flex flex-wrap ${gapSize} justify-center`}>
          {frames.map((frame) => (
            <div
              key={frame.frameId}
              className={`${frameSize} rounded-lg flex items-center justify-center ${frame.pageId !== null ? 'bg-blue-500 text-white' : 'bg-green-400 text-gray-700'} ${highlightFrame === frame.frameId ? 'ring-4 ring-yellow-400' : ''} transition-all duration-300 shadow-sm`}
            >
              <div className="text-center">
                <div className="text-xs font-semibold">F{frame.frameId}</div>
                <div className={`font-bold ${fontSize}`}>
                  {frame.pageId !== null ? frame.pageId : '-'}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}



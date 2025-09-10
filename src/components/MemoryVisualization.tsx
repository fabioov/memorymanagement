"use client";
import React from "react";
import { Block } from "@/types";

interface Props {
  blocks: Block[];
  totalMemory: number;
  onRemove: (index: number) => void;
}

export default function MemoryVisualization({
  blocks,
  totalMemory,
  onRemove,
}: Props) {
  // Calcula a posição inicial de cada bloco para exibir o valor correto
  const getBlockPosition = (index: number) => {
    let position = 0;
    for (let i = 0; i < index; i++) {
      position += blocks[i].size;
    }
    return position;
  };

  // Função para gerar os marcadores de posição específicos
  const generatePositionMarkers = () => {
    // Se não houver blocos, retorna apenas o marcador 0 e o total da memória
    if (blocks.length === 0) return [0, totalMemory];
    
    // Queremos mostrar apenas o início (0), as posições onde os blocos terminam
    // e o final da memória (totalMemory)
    
    const markers = [0]; // Sempre começa com 0
    let currentPosition = 0;
    
    // Adiciona apenas as posições onde os blocos terminam
    for (let i = 0; i < blocks.length; i++) {
      currentPosition += blocks[i].size;
      // Evita duplicação de marcadores (quando dois blocos terminam na mesma posição)
      if (markers[markers.length - 1] !== currentPosition) {
        markers.push(currentPosition);
      }
    }
    
    // Garante que o último marcador seja o tamanho total da memória
    if (markers[markers.length - 1] !== totalMemory) {
      markers.push(totalMemory);
    }
    
    return markers;
  };

  const positionMarkers = generatePositionMarkers();

  return (
    <div className="relative">
      <div className="flex justify-center mb-4">
          {/* Marcadores de posição à esquerda */}
          <div className="flex flex-col h-[400px] relative text-xs text-gray-700 py-1 bg-gray-50">
            {positionMarkers.map((position, idx) => (
              <div 
                key={`pos-marker-${idx}`}
                className="absolute right-2 font-medium"
                style={{ top: `${(position / totalMemory) * 100}%`, transform: 'translateY(-50%)' }}
              >
                {position}
              </div>
            ))}
          </div>
          
          {/* Barra de memória vertical */}
          <div className="rounded-r w-64 flex flex-col cursor-pointer relative h-[400px] bg-white">
            {/* Linhas horizontais para indicar as posições dos marcadores */}
            {positionMarkers.map((position, idx) => (
              <div 
                key={`line-${idx}`} 
                className="absolute w-full border-t border-gray-300" 
                style={{ top: `${(position / totalMemory) * 100}%` }}
              />
            ))}
            
            {/* Linhas horizontais para marcar o final de cada processo */}
            {blocks.map((block, idx) => {
              // Calcula a posição final do bloco
              const startPosition = getBlockPosition(idx);
              const endPosition = startPosition + block.size;
              
              // Só adiciona linha para processos alocados (usados)
              return block.used ? (
                <div 
                  key={`process-end-${idx}`} 
                  className="absolute w-full border-t-2 border-white z-10" 
                  style={{ top: `${(endPosition / totalMemory) * 100}%` }}
                />
              ) : null;
            })}
            
            {blocks.map((block, idx) => (
              <div
                key={idx}
                onClick={() => onRemove(idx)}
                className={`w-full relative ${
                  block.used ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-200 hover:bg-gray-300"
                } transition-colors duration-200`}
                style={{ height: `${(block.size / totalMemory) * 100}%` }}
              >
                {/* Número do processo (apenas para blocos usados) */}
                {block.used && (
                  <div className="absolute inset-0 flex items-center justify-center text-white font-bold text-lg">
                    P{block.processId || idx + 1}
                  </div>
                )}
              </div>
            ))}
        </div>
      </div>
      
      {/* Legenda */}
      <div className="text-sm text-gray-700 flex flex-col items-center bg-white p-3 rounded-lg shadow-sm border border-gray-200 max-w-xs mx-auto">
        <div className="flex items-center mb-2">
          <div className="w-5 h-5 bg-blue-600 mr-3 rounded-sm"></div>
          <span className="font-medium">Processo alocado na memória (clique para liberar)</span>
        </div>
        <div className="flex items-center">
          <div className="w-5 h-5 bg-gray-200 mr-3 rounded-sm"></div>
          <span className="font-medium">Espaço livre na memória</span>
        </div>
      </div>
    </div>
  );
}

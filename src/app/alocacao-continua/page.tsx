"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import AllocationControls from "@/components/AllocationControls";
import MemoryVisualization from "@/components/MemoryVisualization";
import AllocationMetrics from "@/components/AllocationMetrics";
import { Block } from "@/types";
import Link from "next/link";
import toast from "react-hot-toast";

export default function AlocacaoContinua() {
  const [memorySize, setMemorySize] = useState("");
  const [processSize, setProcessSize] = useState("");
  const [algorithm, setAlgorithm] = useState("first-fit");
  const [memoryBlocks, setMemoryBlocks] = useState<Block[]>([]);
  const [lastCircularIndex, setLastCircularIndex] = useState(0);
  const [externalFragmentation, setExternalFragmentation] = useState(0);
  const [isStarted, setIsStarted] = useState(false);
  const [processCount, setProcessCount] = useState(0);
  const [nextProcessId, setNextProcessId] = useState(1); // Contador para gerar IDs únicos de processos
  const [memoryInfo, setMemoryInfo] = useState<{free: number, used: number}>({free: 0, used: 0});
  const [lastReleasedBlockIndex, setLastReleasedBlockIndex] = useState<number | null>(null);
  const [isAutoExecuting, setIsAutoExecuting] = useState(false); // Controla se está executando automaticamente
  const isAutoExecutingRef = useRef(false); // Referência para verificar o estado dentro de closures

  const parseMemory = useCallback(() => parseInt(memorySize) || 1, [memorySize]);

  const mergeFreeBlocks = (blocks: Block[]) => {
    const merged: Block[] = [];
    blocks.forEach((b) => {
      if (!b.used && merged.length && !merged[merged.length - 1].used) {
        merged[merged.length - 1].size += b.size;
      } else {
        merged.push({ ...b });
      }
    });
    return merged;
  };

  const handleRemoveBlock = (index: number) => {
    const blocks = [...memoryBlocks];
    if (blocks[index].used) {
      blocks[index].used = false;
      setLastReleasedBlockIndex(index);
      setMemoryBlocks(mergeFreeBlocks(blocks));
      // Decrementar o contador de processos quando um bloco é liberado
      setProcessCount(prevCount => Math.max(0, prevCount - 1));
    }
  };

  const handleReset = () => {
    setIsAutoExecuting(false); // Para a execução automática
    isAutoExecutingRef.current = false; // Sincronizar a referência
    // Forçar a limpeza completa do estado usando setTimeout
    // para garantir que todas as atualizações de estado sejam aplicadas
    // em um novo ciclo de eventos, evitando problemas de sincronização
    setTimeout(() => {
      // Primeiro, resetamos os blocos de memória e contadores
      setMemoryBlocks([]);
      setProcessCount(0);
      setNextProcessId(1); // Resetar o contador de IDs de processos
      
      // Em seguida, resetamos os índices e métricas
      setLastCircularIndex(0);
      setExternalFragmentation(0);
      setMemoryInfo({free: 0, used: 0});
      setLastReleasedBlockIndex(null);
      
      // Por último, resetamos os controles de entrada
      setMemorySize("");
      setProcessSize("");
      setAlgorithm("first-fit");
      setIsStarted(false);
    }, 0);
    toast.success("Simulação resetada!");
  };

  // Calcula a fragmentação externa para alocação contígua
  const calculateExternalFragmentation = (currentBlocks: Block[]): number => {
    const freeBlocks = currentBlocks.filter((block: Block) => !block.used);
    const totalFreeMemory = freeBlocks.reduce((sum: number, block: Block) => sum + block.size, 0);
    const largestFreeBlock = freeBlocks.reduce((max: number, block: Block) => Math.max(max, block.size), 0);
    
    if (totalFreeMemory === 0) return 0;
    
    return ((totalFreeMemory - largestFreeBlock) / totalFreeMemory) * 100;
  };

  // Atualiza a fragmentação externa e informações de memória quando os blocos mudam
  useEffect(() => {
    if (memoryBlocks.length > 0) {
      const fragmentation = calculateExternalFragmentation(memoryBlocks);
      setExternalFragmentation(fragmentation);
      
      // Calcula informações de memória
      const totalMem = parseMemory();
      const usedMem = memoryBlocks.reduce((sum, block) => sum + (block.used ? block.size : 0), 0);
      const freeMem = totalMem - usedMem;
      setMemoryInfo({free: freeMem, used: usedMem});
    }
  }, [memoryBlocks, parseMemory]);

  const allocateProcess = (currentBlocksParam?: Block[], currentProcessId?: number) => {
    if (!memorySize || !processSize) return { success: false, newBlocks: [] };
    const totalMemory = parseMemory();
    const procSize = parseInt(processSize);
    const processId = currentProcessId || nextProcessId;
    
    // Usar os blocos passados como parâmetro ou o estado atual
    const blocksToUse = currentBlocksParam ? [...currentBlocksParam] : 
      (memoryBlocks.length ? [...memoryBlocks] : [{ size: totalMemory, used: false }]);
    
    let indexToAllocate = -1;

    switch (algorithm) {
      case "first-fit":
        // Comportamento padrão do first-fit: encontrar o primeiro bloco livre que caiba o processo
        indexToAllocate = blocksToUse.findIndex(
          (b: Block) => !b.used && b.size >= procSize
        );
        
        // Resetamos o índice do último bloco liberado se existir
        if (lastReleasedBlockIndex !== null) {
          setLastReleasedBlockIndex(null);
        }
        break;
      case "best-fit":
        let smallestFit = Infinity;
        blocksToUse.forEach((b: Block, i: number) => {
          if (!b.used && b.size >= procSize && b.size < smallestFit) {
            smallestFit = b.size;
            indexToAllocate = i;
          }
        });
        
        // Resetar o índice do último bloco liberado se existir
        if (lastReleasedBlockIndex !== null) {
          setLastReleasedBlockIndex(null);
        }
        break;
      case "worst-fit":
        let largestFit = -1;
        blocksToUse.forEach((b: Block, i: number) => {
          if (!b.used && b.size >= procSize && b.size > largestFit) {
            largestFit = b.size;
            indexToAllocate = i;
          }
        });
        
        // Resetar o índice do último bloco liberado se existir
        if (lastReleasedBlockIndex !== null) {
          setLastReleasedBlockIndex(null);
        }
        break;
      case "circular-fit":
        const n = blocksToUse.length;
        for (let offset = 0; offset < n; offset++) {
          const i = (lastCircularIndex + offset) % n;
          if (!blocksToUse[i].used && blocksToUse[i].size >= procSize) {
            indexToAllocate = i;
            setLastCircularIndex(i);
            break;
          }
        }
        
        // Resetar o índice do último bloco liberado se existir
        if (lastReleasedBlockIndex !== null) {
          setLastReleasedBlockIndex(null);
        }
        break;
    }

    if (indexToAllocate !== -1) {
      const block = blocksToUse[indexToAllocate];
      const newBlocks = [...blocksToUse]; // Create a copy to modify
      if (block.size === procSize) {
        newBlocks[indexToAllocate].used = true;
        newBlocks[indexToAllocate].processId = processId;
      } else {
        const remaining = block.size - procSize;
        newBlocks.splice(
          indexToAllocate,
          1,
          { size: procSize, used: true, processId: processId },
          { size: remaining, used: false }
        );
      }
      
      return { success: true, newBlocks: newBlocks };
    } else {
      return { success: false, newBlocks: blocksToUse };
    }
  };

  const handleStart = () => {
    const result = allocateProcess();
    if (result.success) {
      setMemoryBlocks(result.newBlocks);
      setProcessCount(prevCount => prevCount + 1);
      setNextProcessId(prevId => prevId + 1);
      setIsStarted(true);
      return true;
    } else {
      toast.error("Não há bloco suficiente para este processo!", {
        style: {
          background: '#e53e3e',
          color: '#fff',
          fontWeight: 'bold',
          padding: '16px',
          borderRadius: '8px',
        },
        iconTheme: {
          primary: '#fff',
          secondary: '#e53e3e',
        },
      });
      return false;
    }
  };

  return (
    <main className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-5xl mx-auto bg-white p-6 rounded-lg shadow-md border border-gray-200">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            ALOCAÇÃO CONTÍGUA
          </h1>
          <Link 
            href="/"
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors text-sm"
          >
            Voltar
          </Link>
        </div>

        <div className="space-y-4 mb-8">
          <AllocationControls
            memorySize={memorySize}
            setMemorySize={setMemorySize}
            processSize={processSize}
            setProcessSize={setProcessSize}
            algorithm={algorithm}
            setAlgorithm={setAlgorithm}
          />
        </div>

        {!isStarted ? (
          <div className="flex justify-center gap-4 mt-6">
            <button
              onClick={handleStart}
              className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              INICIAR
            </button>
          </div>
        ) : (
          <>
            {/* Layout com três colunas quando a simulação está em andamento */}
            <div className="flex flex-col md:flex-row gap-10 mt-6 items-start justify-center">
              {/* Coluna da esquerda - Botões de controle */}
              <div className="md:w-1/4 flex flex-col">
                <div className="flex flex-col space-y-4">
                  <button
                    onClick={handleStart}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors duration-200"
                  >
                    PRÓXIMO PASSO
                  </button>
                  <button
                    onClick={async () => {
                      if (isAutoExecuting) {
                        setIsAutoExecuting(false);
                        isAutoExecutingRef.current = false;
                        return;
                      }
                      
                      setIsAutoExecuting(true);
                      isAutoExecutingRef.current = true;
                      
                      // Executar até não conseguir mais alocar
                      const executeUntilFull = async () => {
                        let currentBlocks = memoryBlocks.length ? [...memoryBlocks] : [{ size: parseMemory(), used: false }];
                        let currentProcessId = nextProcessId;
                        
                        while (isAutoExecutingRef.current) {
                          const result = allocateProcess(currentBlocks, currentProcessId);
                          
                          if (!result.success) {
                            setIsAutoExecuting(false);
                            isAutoExecutingRef.current = false;
                            toast.error("Não há bloco suficiente para este processo!", {
                              style: {
                                background: '#e53e3e',
                                color: '#fff',
                                fontWeight: 'bold',
                                padding: '16px',
                                borderRadius: '8px',
                              },
                              iconTheme: {
                                primary: '#fff',
                                secondary: '#e53e3e',
                              },
                            });
                            break;
                          }
                          
                          // Atualizar os blocos locais e o estado
                          currentBlocks = result.newBlocks;
                          currentProcessId = currentProcessId + 1;
                          setMemoryBlocks(currentBlocks);
                          setProcessCount(prevCount => prevCount + 1);
                          setNextProcessId(prevId => prevId + 1);
                          setIsStarted(true);
                          
                          // Espera um ciclo para permitir que React atualize a UI
                          await new Promise((resolve) => setTimeout(resolve, 300));
                        }
                      };
                      
                      // Iniciar a execução
                      executeUntilFull();
                    }}
                    className={`${isAutoExecuting ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'} text-white font-bold py-2 px-4 rounded transition-colors duration-200`}
                  >
                    {isAutoExecuting ? 'PARAR' : 'EXECUTAR TUDO'}
                  </button>
                  <button
                    onClick={handleReset}
                    className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition-colors duration-200"
                  >
                    RESETAR
                  </button>
                </div>
              </div>
              
              {/* Coluna do meio - Visualização da memória */}
              <div className="md:w-2/4 flex justify-center">
                {memoryBlocks.length > 0 && (
                  <MemoryVisualization
                    blocks={memoryBlocks}
                    totalMemory={parseMemory()}
                    onRemove={handleRemoveBlock}
                  />
                )}
              </div>
              
              {/* Coluna da direita - Métricas */}
              <div className="md:w-1/4 flex justify-center">
                {memoryBlocks.length > 0 && (
                  <AllocationMetrics
                    processCount={processCount}
                    memoryInfo={memoryInfo}
                    externalFragmentation={externalFragmentation}
                  />
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  );
}



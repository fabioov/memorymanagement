"use client";

import { useState, useEffect, useRef } from "react";
import PaginationControls from "@/components/PaginationControls";
import PageTable from "@/components/PageTable";
import PageMemoryVisualization from "@/components/PageMemoryVisualization";
import Link from "next/link";

export default function Paginacao() {
  const [pageSize, setPageSize] = useState("");
  const [pageMemorySize, setPageMemorySize] = useState("");
  const [requestSequence, setRequestSequence] = useState("");
  const [paginationAlgorithm, setPaginationAlgorithm] = useState("fifo");
  const [frames, setFrames] = useState<Array<{frameId: number; pageId: number | null; lastUsed: number; loadedAt: number}>>([]);
  const [pageFaults, setPageFaults] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [isSimulating, setIsSimulating] = useState(false);
  const [highlightFrame, setHighlightFrame] = useState<number | null>(null);
  const simulationIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const handleReset = () => {
    setPageSize("");
    setPageMemorySize("");
    setRequestSequence("");
    setPaginationAlgorithm("fifo");
    setFrames([]);
    setPageFaults(0);
    setCurrentStep(0);
    setIsSimulating(false);
    setHighlightFrame(null);
    if (simulationIntervalRef.current) {
      clearInterval(simulationIntervalRef.current);
      simulationIntervalRef.current = null;
    }
  };

  const handleStart = () => {
    if (!pageMemorySize || !pageSize || !requestSequence) return;
    
    if (!isSimulating) {
      handleStartPagination();
    } else {
      handleNextStep();
    }
  };
  
  const handleNextStep = () => {
    const requests = requestSequence.split(',').map(r => parseInt(r.trim())).filter(r => !isNaN(r));
    
    if (currentStep >= requests.length) {
      setIsSimulating(false);
      if (simulationIntervalRef.current) {
        clearInterval(simulationIntervalRef.current);
        simulationIntervalRef.current = null;
      }
      return;
    }
    
    simulateStep(requests[currentStep]);
    setCurrentStep(prev => prev + 1);
  };
  
  const handleRunAll = () => {
    const requests = requestSequence.split(',').map(r => parseInt(r.trim())).filter(r => !isNaN(r));
    if (currentStep >= requests.length) return;

    setIsSimulating(true);
    if (simulationIntervalRef.current) {
      clearInterval(simulationIntervalRef.current);
    }

    simulationIntervalRef.current = setInterval(() => {
      setCurrentStep(prevStep => {
        const nextStep = prevStep + 1;
        if (nextStep > requests.length) {
          if (simulationIntervalRef.current) {
            clearInterval(simulationIntervalRef.current);
            simulationIntervalRef.current = null;
          }
          setIsSimulating(false);
          return prevStep;
        }
        simulateStep(requests[prevStep]);
        return nextStep;
      });
    }, 500);
  };

  const handleStartPagination = () => {
    setPageFaults(0);
    setCurrentStep(0);
    setIsSimulating(true);
    setHighlightFrame(null);
    
    const totalFrames = parseInt(pageMemorySize) || 4;
    const initialFrames = Array.from({ length: totalFrames }, (_, i) => ({
      frameId: i,
      pageId: null,
      lastUsed: 0,
      loadedAt: 0
    }));
    setFrames(initialFrames);
    
    // Inicia a simulação com o primeiro passo se houver requisições
    const requests = requestSequence.split(',').map(r => parseInt(r.trim())).filter(r => !isNaN(r));
    if (requests.length > 0) {
      simulateStep(requests[0]);
      setCurrentStep(1);
    }
  };

  const simulateStep = (requestedPage: number) => {
    setFrames(prevFrames => {
      const updatedFrames = [...prevFrames];
      let newPageFault = false;
      let frameToHighlight: number | null = null;

      const frameIndex = updatedFrames.findIndex(frame => frame.pageId === requestedPage);
      
      if (frameIndex !== -1) {
        // Page hit
        updatedFrames[frameIndex].lastUsed = currentStep;
      } else {
        // Page fault
        newPageFault = true;
        setPageFaults(prev => prev + 1);
        
        const emptyFrameIndex = updatedFrames.findIndex(frame => frame.pageId === null);
        
        if (emptyFrameIndex !== -1) {
          // Empty frame available
          updatedFrames[emptyFrameIndex].pageId = requestedPage;
          updatedFrames[emptyFrameIndex].lastUsed = currentStep;
          updatedFrames[emptyFrameIndex].loadedAt = currentStep;
          frameToHighlight = emptyFrameIndex;
        } else {
          // No empty frames, replace a page
          const frameToReplaceIndex = selectFrameToReplace(updatedFrames, requestedPage);
          updatedFrames[frameToReplaceIndex].pageId = requestedPage;
          updatedFrames[frameToReplaceIndex].lastUsed = currentStep;
          updatedFrames[frameToReplaceIndex].loadedAt = currentStep;
          frameToHighlight = frameToReplaceIndex;
        }
      }
      
      setHighlightFrame(frameToHighlight);
      if (frameToHighlight !== null) {
        setTimeout(() => {
          setHighlightFrame(null);
        }, 500);
      }

      return updatedFrames;
    });
  };

  const selectFrameToReplace = (
    currentFrames: Array<{frameId: number; pageId: number | null; lastUsed: number; loadedAt: number}>,
    requestedPage: number
  ) => {
    const requests = requestSequence.split(',').map(r => parseInt(r.trim())).filter(r => !isNaN(r));

    switch (paginationAlgorithm) {
      case "fifo": {
        // FIFO: replace the page that has been in memory the longest
        let oldestFrameIndex = 0;
        let oldestLoadedTime = Infinity;
        
        currentFrames.forEach((frame, index) => {
          if (frame.loadedAt < oldestLoadedTime) {
            oldestLoadedTime = frame.loadedAt;
            oldestFrameIndex = index;
          }
        });
        return oldestFrameIndex;
      }
      
      case "lru": {
        // LRU: replace the page that has not been used for the longest time
        let lruFrameIndex = 0;
        let leastRecentTime = Infinity;
        
        currentFrames.forEach((frame, index) => {
          if (frame.lastUsed < leastRecentTime) {
            leastRecentTime = frame.lastUsed;
            lruFrameIndex = index;
          }
        });
        return lruFrameIndex;
      }
      
      case "optimal": {
        // Optimal: replace the page that will not be used for the longest time in the future
        let optimalFrameIndex = 0;
        let furthestUse = -1;
        
        currentFrames.forEach((frame, frameIndex) => {
          const futureRequests = requests.slice(currentStep);
          const nextUseIndex = futureRequests.indexOf(frame.pageId as number);
          
          if (nextUseIndex === -1) {
            optimalFrameIndex = frameIndex;
            furthestUse = Infinity;
            return;
          }
          
          if (nextUseIndex > furthestUse) {
            furthestUse = nextUseIndex;
            optimalFrameIndex = frameIndex;
          }
        });
        return optimalFrameIndex;
      }
      
      default:
        return 0;
    }
  };

  return (
    <main className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-5xl mx-auto bg-white p-6 rounded-lg shadow-md border border-gray-200">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            PAGINAÇÃO
          </h1>
          <Link 
            href="/"
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors text-sm flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-arrow-left">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
            Voltar
          </Link>
        </div>

        <PaginationControls
          pageMemorySize={pageMemorySize}
          pageSize={pageSize}
          requestSequence={requestSequence}
          algorithm={paginationAlgorithm}
          setPageMemorySize={setPageMemorySize}
          setPageSize={setPageSize}
          setRequestSequence={setRequestSequence}
          setAlgorithm={setPaginationAlgorithm}
        />
        
        {!isSimulating ? (
          <div className="flex justify-center gap-4 mt-6">
            <button
              onClick={handleStart}
              className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              INICIAR
            </button>
            <button
              onClick={handleReset}
              className="px-6 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
            >
              RESETAR
            </button>
          </div>
        ) : (
          <>
            <div className="flex flex-col md:flex-row gap-6 mt-6">
              <div className="md:w-1/5 flex flex-col space-y-4">
                <div className="flex flex-col space-y-2">
                  <button
                    onClick={handleNextStep}
                    disabled={currentStep >= requestSequence.split(',').length}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                  >
                    PRÓXIMO PASSO
                  </button>
                  <button
                    onClick={handleRunAll}
                    disabled={currentStep >= requestSequence.split(',').length}
                    className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                  >
                    EXECUTAR TUDO
                  </button>
                  <button
                    onClick={handleReset}
                    className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition-colors duration-200"
                  >
                    RESETAR
                  </button>
                </div>
                
                {frames.length > 0 && (
                  <div className="bg-white p-3 rounded-lg shadow-sm">
                    <div className="flex items-center mb-2">
                      <span className="text-sm font-medium text-gray-900 mr-2">Passo atual:</span>
                      <span className="text-lg font-bold text-gray-500">{currentStep}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-gray-900 mr-2">Page Faults:</span>
                      <span className="text-lg font-bold text-gray-500">{pageFaults}</span>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="md:w-4/5">
                {frames.length > 0 && (
                  <>
                    <div className="flex flex-col space-y-4 mb-4">
                      <div className="flex-grow">
                        <PageMemoryVisualization 
                          frames={frames} 
                          totalFrames={parseInt(pageMemorySize) || 0} 
                          highlightFrame={highlightFrame}
                        />
                      </div>
                      
                      <PageTable 
                        frames={frames} 
                        pageFaults={pageFaults} 
                        highlightFrame={highlightFrame} 
                      />
                    </div>
                  </>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  );
}



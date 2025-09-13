"use client";

import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-md border border-gray-200">
        <h1 className="text-2xl font-bold text-center mb-8 text-gray-900">
          SIMULADOR DE GERENCIAMENTO DE MEMÓRIA
        </h1>

        <div className="flex flex-col space-y-6 mt-8">
          <Link 
            href="/alocacao-contigua"
            className="px-6 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-center font-medium"
          >
            ALOCAÇÃO CONTÍGUA
          </Link>
          
          <Link 
            href="/paginacao"
            className="px-6 py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-center font-medium"
          >
            PAGINAÇÃO
          </Link>
        </div>

        <div className="mt-8 p-4 bg-gray-50 rounded-lg border">
          <h2 className="text-lg font-semibold mb-2 text-gray-900">Sobre o Simulador</h2>
          <p className="text-gray-700">
            Este simulador permite visualizar e compreender diferentes técnicas de gerenciamento de memória em sistemas operacionais.
            Escolha uma das opções acima para iniciar a simulação desejada.
          </p>
        </div>
      </div>
    </main>
  );
}

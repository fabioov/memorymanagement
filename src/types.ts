// Define os tipos utilizados no simulador de gerenciamento de memória

// Representa um bloco de memória
export interface Block {
  size: number;  // Tamanho do bloco em unidades de memória
  used: boolean; // Indica se o bloco está em uso (true) ou livre (false)
  processId?: number; // Identificador único do processo (opcional, apenas para blocos usados)
}
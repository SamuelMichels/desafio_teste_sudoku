/**
 * Sudoku binario (tambem chamado Takuzu ou Binairo) de 6 x 6.
 *
 * As coordenadas sao (linha, coluna), ambas de 0 a 5. Uma celula vale 0, 1 ou
 * null, que e a celula vazia.
 */

export const LADO = 6;

const VALORES = [0, 1];

export class Tabuleiro {
  constructor(linhas) {
    if (linhas === undefined) {
      this.celulas = Array.from({ length: LADO }, () => Array(LADO).fill(null));
      return;
    }

    if (!Array.isArray(linhas) || linhas.length !== LADO) {
      throw new Error(`A grade precisa ter ${LADO} linhas.`);
    }
    for (const linha of linhas) {
      if (!Array.isArray(linha) || linha.length !== LADO) {
        throw new Error(`Cada linha precisa ter ${LADO} colunas.`);
      }
      for (const valor of linha) {
        if (valor !== null && !VALORES.includes(valor)) {
          throw new Error(`Valor invalido: ${valor}. Use 0, 1 ou null.`);
        }
      }
    }

    this.celulas = linhas.map((linha) => [...linha]);
  }

  valor(linha, coluna) {
    return this.celulas[linha][coluna];
  }

  grade() {
    return this.celulas.map((linha) => [...linha]);
  }

  vazias() {
    return this.celulas.flat().filter((valor) => valor === null).length;
  }
}

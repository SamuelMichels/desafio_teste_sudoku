/**
 * Sudoku binario (tambem chamado Takuzu ou Binairo) de 6 x 6.
 *
 * As coordenadas sao (linha, coluna), ambas de 0 a 5. Uma celula vale 0, 1 ou
 * null, que e a celula vazia.
 */

export const LADO = 6;

const VALORES = [0, 1];

const dentroDoTabuleiro = (indice) => Number.isInteger(indice) && indice >= 0 && indice < LADO;

export class Tabuleiro {
  constructor(linhas) {
    if (linhas === undefined) {
      this.celulas = Array.from({ length: LADO }, () => Array(LADO).fill(null));
      this.pistas = new Set();
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

    // As celulas que vem preenchidas na construcao sao as pistas do puzzle: o
    // jogador preenche o resto, mas nao reescreve o enunciado.
    this.pistas = new Set();
    for (let linha = 0; linha < LADO; linha += 1) {
      for (let coluna = 0; coluna < LADO; coluna += 1) {
        if (this.celulas[linha][coluna] !== null) {
          this.pistas.add(`${linha},${coluna}`);
        }
      }
    }
  }

  ehPista(linha, coluna) {
    return this.pistas.has(`${linha},${coluna}`);
  }

  /** Preenche (linha, coluna) com 0 ou 1, ou apaga a celula com null. */
  jogar(linha, coluna, valor) {
    if (!dentroDoTabuleiro(linha) || !dentroDoTabuleiro(coluna)) {
      throw new Error(`A celula (${linha}, ${coluna}) esta fora do tabuleiro.`);
    }
    if (valor !== null && !VALORES.includes(valor)) {
      throw new Error(`Valor invalido: ${valor}. Use 0, 1 ou null.`);
    }
    if (this.ehPista(linha, coluna)) {
      throw new Error(`A celula (${linha}, ${coluna}) e uma pista do puzzle: nao pode ser alterada.`);
    }

    this.celulas[linha][coluna] = valor;
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

import { Tabuleiro } from "../src/sudoku-binario.js";

/**
 * Monta um tabuleiro a partir de 6 strings de 6 caracteres, onde "." e a celula
 * vazia. Escrever "001.11" em vez de [0, 0, 1, null, 1, 1] faz o cenario do
 * teste caber numa linha e, principalmente, deixa visivel o que esta sendo
 * montado: as seis linhas do puzzle aparecem desenhadas uma embaixo da outra.
 *
 * Fica fora de test/ porque `node --test` conta todo arquivo dentro de test/
 * como arquivo de teste, inclusive um que so exporta ajuda.
 */
export const de = (...linhas) =>
  new Tabuleiro(linhas.map((linha) => [...linha].map((c) => (c === "." ? null : Number(c)))));

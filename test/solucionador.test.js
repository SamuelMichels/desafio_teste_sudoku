import { describe, test } from "node:test";
import assert from "node:assert/strict";

import { Tabuleiro } from "../src/sudoku-binario.js";
import { de, SOLUCAO, PUZZLE } from "../apoio/grade.js";

const grade = (...linhas) => de(...linhas).grade();

describe("Solucionador", () => {
  test("o tabuleiro ja resolvido tem ele mesmo como unica solucao", () => {
    assert.deepEqual(de(...SOLUCAO).solucoes(), [grade(...SOLUCAO)]);
  });

  test("faltando a ultima celula a solucao e unica", () => {
    const tabuleiro = de(...SOLUCAO.slice(0, 5), "11010.");

    assert.deepEqual(tabuleiro.solucoes(), [grade(...SOLUCAO)]);
  });

  test("o puzzle de 8 pistas tem solucao unica, e e a solucao conhecida", () => {
    assert.deepEqual(de(...PUZZLE).solucoes(), [grade(...SOLUCAO)]);
  });

  test("um tabuleiro que ja viola uma regra nao tem solucao", () => {
    assert.deepEqual(de("0000..", "......", "......", "......", "......", "......").solucoes(), []);
  });

  test("um tabuleiro completo e invalido nao tem solucao", () => {
    assert.deepEqual(de("000111", "000111", "000111", "111000", "111000", "111000").solucoes(), []);
  });

  test("o limite corta a busca antes de varrer tudo", () => {
    assert.equal(new Tabuleiro().solucoes(1).length, 1);
    assert.equal(new Tabuleiro().solucoes(5).length, 5);
  });

  test("a busca nao altera o tabuleiro de onde partiu", () => {
    const tabuleiro = de(...PUZZLE);
    const antes = tabuleiro.grade();

    tabuleiro.solucoes();

    assert.deepEqual(tabuleiro.grade(), antes);
    assert.equal(tabuleiro.vazias(), 28);
  });

  test("toda solucao devolvida esta resolvida e respeita as pistas", () => {
    const tabuleiro = de("0.....", "......", "......", "......", "......", "......");

    const encontradas = tabuleiro.solucoes(40);

    assert.equal(encontradas.length, 40);
    for (const solucao of encontradas) {
      assert.equal(new Tabuleiro(solucao).resolvido(), true);
      assert.equal(solucao[0][0], 0, "a pista (0, 0) tem de continuar valendo 0");
    }
  });

  test("o tabuleiro vazio tem 4140 solucoes", () => {
    assert.equal(new Tabuleiro().solucoes(Infinity).length, 4140);
  });
});

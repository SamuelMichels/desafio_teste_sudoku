import { describe, test } from "node:test";
import assert from "node:assert/strict";

import { Tabuleiro, LADO } from "../src/sudoku-binario.js";

describe("Tabuleiro 6 x 6", () => {
  test("tem 6 linhas de 6 colunas", () => {
    const tabuleiro = new Tabuleiro();

    assert.equal(LADO, 6);
    assert.equal(tabuleiro.grade().length, 6);
    assert.ok(tabuleiro.grade().every((linha) => linha.length === 6));
  });

  test("comeca com as 36 celulas vazias", () => {
    const tabuleiro = new Tabuleiro();

    assert.equal(tabuleiro.vazias(), 36);
    assert.equal(tabuleiro.valor(0, 0), null);
  });

  test("aceita uma grade informada, com 0, 1 e vazias", () => {
    const tabuleiro = new Tabuleiro([
      [0, 1, null, null, null, null],
      [null, null, null, null, null, null],
      [null, null, null, null, null, null],
      [null, null, null, null, null, null],
      [null, null, null, null, null, null],
      [null, null, null, null, null, 1],
    ]);

    assert.equal(tabuleiro.valor(0, 0), 0);
    assert.equal(tabuleiro.valor(0, 1), 1);
    assert.equal(tabuleiro.valor(5, 5), 1);
    assert.equal(tabuleiro.vazias(), 33);
  });

  test("grade com numero de linhas diferente de 6 e recusada", () => {
    assert.throws(() => new Tabuleiro([[0, 1, 0, 1, 0, 1]]), /6 linhas/i);
  });

  test("linha com numero de colunas diferente de 6 e recusada", () => {
    const linhas = Array.from({ length: 6 }, () => [null, null, null, null, null, null]);
    linhas[3] = [0, 1, 0];

    assert.throws(() => new Tabuleiro(linhas), /6 colunas/i);
  });

  test("valor que nao e 0, 1 nem vazio e recusado", () => {
    const linhas = Array.from({ length: 6 }, () => [null, null, null, null, null, null]);
    linhas[2][4] = 2;

    assert.throws(() => new Tabuleiro(linhas), /valor/i);
  });

  test("grade() devolve uma copia: mexer nela nao altera o tabuleiro", () => {
    const tabuleiro = new Tabuleiro();

    tabuleiro.grade()[0][0] = 1;

    assert.equal(tabuleiro.valor(0, 0), null);
  });
});

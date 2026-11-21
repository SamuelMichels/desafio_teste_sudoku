import { describe, test } from "node:test";
import assert from "node:assert/strict";

import { Tabuleiro } from "../src/sudoku-binario.js";

/** Puzzle com duas pistas: (0,0) = 0 e (5,5) = 1. O resto esta vazio. */
const comDuasPistas = () => {
  const linhas = Array.from({ length: 6 }, () => Array(6).fill(null));
  linhas[0][0] = 0;
  linhas[5][5] = 1;
  return new Tabuleiro(linhas);
};

describe("A jogada do jogador", () => {
  test("jogar preenche a celula vazia", () => {
    const tabuleiro = comDuasPistas();

    tabuleiro.jogar(2, 3, 1);

    assert.equal(tabuleiro.valor(2, 3), 1);
  });

  test("a jogada desconta do contador de vazias", () => {
    const tabuleiro = comDuasPistas();

    tabuleiro.jogar(2, 3, 1);

    assert.equal(tabuleiro.vazias(), 33);
  });

  test("o jogador pode trocar o valor que ele mesmo pos", () => {
    const tabuleiro = comDuasPistas();
    tabuleiro.jogar(2, 3, 1);

    tabuleiro.jogar(2, 3, 0);

    assert.equal(tabuleiro.valor(2, 3), 0);
  });

  test("jogar null apaga a celula que o jogador tinha preenchido", () => {
    const tabuleiro = comDuasPistas();
    tabuleiro.jogar(2, 3, 1);

    tabuleiro.jogar(2, 3, null);

    assert.equal(tabuleiro.valor(2, 3), null);
    assert.equal(tabuleiro.vazias(), 34);
  });
});

describe("Pistas do puzzle", () => {
  test("as celulas dadas na construcao sao pistas; as do jogador nao", () => {
    const tabuleiro = comDuasPistas();
    tabuleiro.jogar(2, 3, 1);

    assert.equal(tabuleiro.ehPista(0, 0), true);
    assert.equal(tabuleiro.ehPista(5, 5), true);
    assert.equal(tabuleiro.ehPista(2, 3), false);
  });

  test("a pista nao pode ser alterada", () => {
    const tabuleiro = comDuasPistas();

    assert.throws(() => tabuleiro.jogar(0, 0, 1), /pista/i);
  });

  test("a pista nao pode ser apagada", () => {
    const tabuleiro = comDuasPistas();

    assert.throws(() => tabuleiro.jogar(5, 5, null), /pista/i);
  });
});

describe("Jogadas recusadas", () => {
  test("coordenada fora do tabuleiro e recusada", () => {
    const tabuleiro = comDuasPistas();

    assert.throws(() => tabuleiro.jogar(-1, 0, 1), /fora do tabuleiro/i);
    assert.throws(() => tabuleiro.jogar(0, 6, 1), /fora do tabuleiro/i);
    assert.throws(() => tabuleiro.jogar(6, 0, 1), /fora do tabuleiro/i);
    assert.throws(() => tabuleiro.jogar(1.5, 0, 1), /fora do tabuleiro/i);
  });

  test("valor diferente de 0, 1 e vazio e recusado", () => {
    const tabuleiro = comDuasPistas();

    assert.throws(() => tabuleiro.jogar(2, 2, 2), /valor/i);
    assert.throws(() => tabuleiro.jogar(2, 2, "1"), /valor/i);
  });

  test("uma jogada recusada nao altera nada na grade", () => {
    const tabuleiro = comDuasPistas();
    tabuleiro.jogar(2, 3, 1);
    const antes = tabuleiro.grade();

    assert.throws(() => tabuleiro.jogar(0, 0, 1));
    assert.throws(() => tabuleiro.jogar(9, 9, 1));
    assert.throws(() => tabuleiro.jogar(4, 4, 7));

    assert.deepEqual(tabuleiro.grade(), antes);
  });
});

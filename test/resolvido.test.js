import { describe, test } from "node:test";
import assert from "node:assert/strict";

import { Tabuleiro } from "../src/sudoku-binario.js";
import { de, SOLUCAO } from "../apoio/grade.js";

/** A solucao com a ultima celula, (5, 5), apagada para o jogador preencher. */
const faltandoAUltima = () => de(...SOLUCAO.slice(0, 5), "11010.");

describe("Tabuleiro completo", () => {
  test("o tabuleiro vazio nao esta completo", () => {
    assert.equal(new Tabuleiro().completo(), false);
  });

  test("uma unica celula vazia impede o tabuleiro de estar completo", () => {
    assert.equal(faltandoAUltima().completo(), false);
  });

  test("as 36 celulas preenchidas deixam o tabuleiro completo", () => {
    assert.equal(de(...SOLUCAO).completo(), true);
  });

  test("completo nao olha as regras: um tabuleiro cheio e errado tambem esta completo", () => {
    const cheioEErrado = de("000111", "000111", "000111", "111000", "111000", "111000");

    assert.equal(cheioEErrado.completo(), true);
    assert.equal(cheioEErrado.valido(), false);
  });
});

describe("Puzzle resolvido", () => {
  test("o tabuleiro completo e sem violacao esta resolvido", () => {
    assert.equal(de(...SOLUCAO).resolvido(), true);
  });

  test("o tabuleiro valido mas incompleto nao esta resolvido", () => {
    const tabuleiro = faltandoAUltima();

    assert.equal(tabuleiro.valido(), true);
    assert.equal(tabuleiro.resolvido(), false);
  });

  test("o tabuleiro completo com violacao nao esta resolvido", () => {
    assert.equal(de("000111", "000111", "000111", "111000", "111000", "111000").resolvido(), false);
  });

  test("preencher a ultima celula com o valor certo resolve o puzzle", () => {
    const tabuleiro = faltandoAUltima();

    tabuleiro.jogar(5, 5, 0);

    assert.equal(tabuleiro.resolvido(), true);
  });

  test("preencher a ultima celula com o valor errado completa sem resolver", () => {
    const tabuleiro = faltandoAUltima();

    tabuleiro.jogar(5, 5, 1);

    assert.equal(tabuleiro.completo(), true);
    assert.equal(tabuleiro.resolvido(), false);
    assert.deepEqual(tabuleiro.violacoes(), [
      { regra: "balanco", tipo: "linha", indice: 5 },
      { regra: "balanco", tipo: "coluna", indice: 5 },
    ]);
  });
});

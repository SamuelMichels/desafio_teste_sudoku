import { describe, test } from "node:test";
import assert from "node:assert/strict";

import { Tabuleiro } from "../src/sudoku-binario.js";
import { de } from "../apoio/grade.js";

describe("Regra do balanco: 3 zeros e 3 uns por linha e por coluna", () => {
  test("o tabuleiro vazio nao tem violacao", () => {
    assert.deepEqual(new Tabuleiro().violacoes(), []);
  });

  test("quatro zeros numa linha violam o balanco", () => {
    const tabuleiro = de(
      "00100.",
      "......",
      "......",
      "......",
      "......",
      "......",
    );

    assert.deepEqual(tabuleiro.violacoes(), [{ regra: "balanco", tipo: "linha", indice: 0 }]);
  });

  test("quatro uns numa linha violam o balanco", () => {
    const tabuleiro = de(
      "......",
      "110110",
      "......",
      "......",
      "......",
      "......",
    );

    assert.deepEqual(tabuleiro.violacoes(), [{ regra: "balanco", tipo: "linha", indice: 1 }]);
  });

  test("quatro zeros numa coluna violam o balanco", () => {
    const tabuleiro = de(
      "0.....",
      "0.....",
      "1.....",
      "0.....",
      "0.....",
      "......",
    );

    assert.deepEqual(tabuleiro.violacoes(), [{ regra: "balanco", tipo: "coluna", indice: 0 }]);
  });

  test("uma linha incompleta com dois zeros nao viola nada", () => {
    const tabuleiro = de(
      "00....",
      "......",
      "......",
      "......",
      "......",
      "......",
    );

    assert.deepEqual(tabuleiro.violacoes(), []);
  });

  test("tres zeros e tres uns na linha nao violam o balanco", () => {
    const tabuleiro = de(
      "010101",
      "......",
      "......",
      "......",
      "......",
      "......",
    );

    assert.deepEqual(tabuleiro.violacoes(), []);
  });

  test("a violacao aponta a regra, o tipo e o indice certos", () => {
    const tabuleiro = de(
      ".....0",
      "110110",
      "......",
      ".....0",
      ".....0",
      "......",
    );

    assert.deepEqual(tabuleiro.violacoes(), [
      { regra: "balanco", tipo: "linha", indice: 1 },
      { regra: "balanco", tipo: "coluna", indice: 5 },
    ]);
  });

  test("valido() e o oposto de ter violacao", () => {
    assert.equal(new Tabuleiro().valido(), true);
    assert.equal(de("00100.", "......", "......", "......", "......", "......").valido(), false);
  });
});

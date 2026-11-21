import { describe, test } from "node:test";
import assert from "node:assert/strict";

import { de } from "../apoio/grade.js";

describe("Regra do trio: nunca tres iguais consecutivos", () => {
  test("tres zeros consecutivos no inicio da linha violam o trio", () => {
    const tabuleiro = de(
      "000...",
      "......",
      "......",
      "......",
      "......",
      "......",
    );

    assert.deepEqual(tabuleiro.violacoes(), [{ regra: "trio", tipo: "linha", indice: 0 }]);
  });

  test("tres uns consecutivos no fim da linha violam o trio", () => {
    const tabuleiro = de(
      "......",
      "...111",
      "......",
      "......",
      "......",
      "......",
    );

    assert.deepEqual(tabuleiro.violacoes(), [{ regra: "trio", tipo: "linha", indice: 1 }]);
  });

  test("tres iguais no meio da linha violam o trio", () => {
    const tabuleiro = de(
      "......",
      "......",
      ".000..",
      "......",
      "......",
      "......",
    );

    assert.deepEqual(tabuleiro.violacoes(), [{ regra: "trio", tipo: "linha", indice: 2 }]);
  });

  test("tres iguais consecutivos na coluna violam o trio", () => {
    const tabuleiro = de(
      "..0...",
      "..0...",
      "..0...",
      "......",
      "......",
      "......",
    );

    assert.deepEqual(tabuleiro.violacoes(), [{ regra: "trio", tipo: "coluna", indice: 2 }]);
  });

  test("dois iguais consecutivos nao violam nada", () => {
    const tabuleiro = de(
      "00.11.",
      "......",
      "......",
      "......",
      "......",
      "......",
    );

    assert.deepEqual(tabuleiro.violacoes(), []);
  });

  test("a sequencia interrompida por uma celula vazia nao viola o trio", () => {
    const tabuleiro = de(
      "00.0..",
      "......",
      "......",
      "......",
      "......",
      "......",
    );

    assert.deepEqual(tabuleiro.violacoes(), []);
  });

  test("duas sequencias na mesma linha contam como uma violacao de trio", () => {
    const tabuleiro = de(
      "000111",
      "......",
      "......",
      "......",
      "......",
      "......",
    );

    assert.deepEqual(tabuleiro.violacoes(), [{ regra: "trio", tipo: "linha", indice: 0 }]);
  });

  test("a mesma linha pode violar o balanco e o trio ao mesmo tempo", () => {
    const tabuleiro = de(
      "0000..",
      "......",
      "......",
      "......",
      "......",
      "......",
    );

    assert.deepEqual(tabuleiro.violacoes(), [
      { regra: "balanco", tipo: "linha", indice: 0 },
      { regra: "trio", tipo: "linha", indice: 0 },
    ]);
  });
});

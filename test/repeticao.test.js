import { describe, test } from "node:test";
import assert from "node:assert/strict";

import { de, SOLUCAO } from "../apoio/grade.js";

describe("Regra da repeticao: nenhuma linha ou coluna igual a outra", () => {
  test("duas linhas completas iguais violam a repeticao", () => {
    const tabuleiro = de(
      "001011",
      "001011",
      "......",
      "......",
      "......",
      "......",
    );

    assert.deepEqual(tabuleiro.violacoes(), [{ regra: "repeticao", tipo: "linha", indice: 1 }]);
  });

  test("a violacao aponta a linha repetida, nao a primeira ocorrencia", () => {
    const tabuleiro = de(
      "......",
      "......",
      "001011",
      "......",
      "001011",
      "......",
    );

    assert.deepEqual(tabuleiro.violacoes(), [{ regra: "repeticao", tipo: "linha", indice: 4 }]);
  });

  test("duas colunas completas iguais violam a repeticao", () => {
    const tabuleiro = de(
      "00....",
      "00....",
      "11....",
      "00....",
      "11....",
      "11....",
    );

    assert.deepEqual(tabuleiro.violacoes(), [{ regra: "repeticao", tipo: "coluna", indice: 1 }]);
  });

  test("duas linhas iguais mas incompletas nao violam a repeticao", () => {
    const tabuleiro = de(
      "00....",
      "00....",
      "......",
      "......",
      "......",
      "......",
    );

    assert.deepEqual(tabuleiro.violacoes(), []);
  });

  test("duas linhas completas diferentes nao violam nada", () => {
    const tabuleiro = de(
      "001011",
      "010011",
      "......",
      "......",
      "......",
      "......",
    );

    assert.deepEqual(tabuleiro.violacoes(), []);
  });

  test("tres linhas iguais rendem uma violacao por repeticao, nao por par", () => {
    const tabuleiro = de(
      "001011",
      "......",
      "001011",
      "......",
      "001011",
      "......",
    );

    assert.deepEqual(tabuleiro.violacoes(), [
      { regra: "repeticao", tipo: "linha", indice: 2 },
      { regra: "repeticao", tipo: "linha", indice: 4 },
    ]);
  });

  test("um tabuleiro resolvido nao viola nenhuma das regras", () => {
    assert.deepEqual(de(...SOLUCAO).violacoes(), []);
  });
});

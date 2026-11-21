import { describe, test } from "node:test";
import assert from "node:assert/strict";

import { Tabuleiro, LADO } from "../src/sudoku-binario.js";
import { de, SOLUCAO, PUZZLE } from "../apoio/grade.js";

const LIMITE_DE_JOGADAS = LADO * LADO;

const coordenadas = (filtro) => {
  const lista = [];
  for (let linha = 0; linha < LADO; linha += 1) {
    for (let coluna = 0; coluna < LADO; coluna += 1) {
      if (filtro(linha, coluna)) {
        lista.push([linha, coluna]);
      }
    }
  }
  return lista;
};

const vaziasDe = (tabuleiro) => coordenadas((linha, coluna) => tabuleiro.valor(linha, coluna) === null);

/** Uma copia jogavel do tabuleiro, com a jogada (linha, coluna) = valor feita. */
const comJogada = (tabuleiro, linha, coluna, valor) => {
  const copia = new Tabuleiro(tabuleiro.grade());
  copia.jogar(linha, coluna, valor);
  return copia;
};

/**
 * O jogador do teste. Nao conhece a SOLUCAO: olha so o que a API publica
 * mostra e so joga o que esta logicamente forcado, em duas etapas.
 *
 * 1. contradicao imediata: se por 0 numa celula ja viola uma regra, a celula
 *    tem de ser 1 (e vice-versa). E a deducao que um jogador humano faz.
 * 2. sem solucao: se por 0 numa celula deixa um tabuleiro que nao completa de
 *    forma nenhuma, a celula tem de ser 1. Precisa olhar adiante, e por isso
 *    so entra quando a primeira etapa nao decide nada.
 *
 * Devolve null quando nenhuma celula esta forcada: ai o puzzle exigiria palpite,
 * e o jogador se recusa a adivinhar.
 */
const proximaJogada = (tabuleiro) => {
  const vazias = vaziasDe(tabuleiro);

  for (const [linha, coluna] of vazias) {
    for (const valor of [0, 1]) {
      if (!comJogada(tabuleiro, linha, coluna, valor).valido()) {
        return { linha, coluna, valor: 1 - valor, motivo: "contradicao-imediata" };
      }
    }
  }

  for (const [linha, coluna] of vazias) {
    for (const valor of [0, 1]) {
      if (comJogada(tabuleiro, linha, coluna, valor).solucoes(1).length === 0) {
        return { linha, coluna, valor: 1 - valor, motivo: "sem-solucao" };
      }
    }
  }

  return null;
};

/** Confere, no meio da partida, o que tem de valer em qualquer estado. */
const conferirInvariantes = (tabuleiro, pistas, onde) => {
  for (const [linha, coluna] of pistas) {
    assert.equal(
      tabuleiro.valor(linha, coluna),
      de(...PUZZLE).valor(linha, coluna),
      `${onde}: a pista (${linha}, ${coluna}) mudou de valor`,
    );
    assert.equal(tabuleiro.ehPista(linha, coluna), true, `${onde}: a pista (${linha}, ${coluna}) deixou de ser pista`);
  }

  assert.deepEqual(tabuleiro.violacoes(), [], `${onde}: o tabuleiro entrou num estado invalido`);

  const vazias = tabuleiro.grade().flat().filter((valor) => valor === null).length;
  assert.equal(tabuleiro.vazias(), vazias, `${onde}: vazias() discorda da grade`);

  const copia = tabuleiro.grade();
  copia[0][0] = 9;
  assert.notEqual(tabuleiro.valor(0, 0), 9, `${onde}: grade() vazou a estrutura interna`);

  assert.equal(tabuleiro.resolvido(), tabuleiro.completo(), `${onde}: completo sem estar resolvido`);
};

/** Joga o puzzle inteiro, conferindo os invariantes antes e depois de cada jogada. */
const jogarAteOFim = (tabuleiro) => {
  const pistas = coordenadas((linha, coluna) => tabuleiro.ehPista(linha, coluna));
  const porMotivo = { "contradicao-imediata": 0, "sem-solucao": 0 };
  const vaziasPorJogada = [tabuleiro.vazias()];

  conferirInvariantes(tabuleiro, pistas, "antes da primeira jogada");

  let jogadas = 0;
  while (!tabuleiro.resolvido() && jogadas < LIMITE_DE_JOGADAS) {
    const jogada = proximaJogada(tabuleiro);
    if (jogada === null) {
      break;
    }

    tabuleiro.jogar(jogada.linha, jogada.coluna, jogada.valor);
    jogadas += 1;
    porMotivo[jogada.motivo] += 1;
    vaziasPorJogada.push(tabuleiro.vazias());

    conferirInvariantes(tabuleiro, pistas, `jogada ${jogadas}`);
  }

  return { jogadas, porMotivo, vaziasPorJogada, travou: !tabuleiro.resolvido() };
};

describe("Partida completa", () => {
  test("o jogador deduz o puzzle de 8 pistas do inicio ao fim", () => {
    const tabuleiro = de(...PUZZLE);

    const partida = jogarAteOFim(tabuleiro);

    assert.equal(partida.travou, false, "o jogador parou antes de resolver");
    assert.equal(partida.jogadas, 28, "as 36 celulas menos as 8 pistas");
    assert.deepEqual(tabuleiro.grade(), de(...SOLUCAO).grade());
  });

  test("cada jogada tira exatamente uma celula vazia", () => {
    const partida = jogarAteOFim(de(...PUZZLE));

    assert.deepEqual(
      partida.vaziasPorJogada,
      Array.from({ length: 29 }, (_, i) => 28 - i),
    );
  });

  test("as duas formas de deducao sao exercitadas pela partida", () => {
    const partida = jogarAteOFim(de(...PUZZLE));

    // Numeros medidos na propria suite, nao escolhidos: se a etapa de olhar
    // adiante parar de ser necessaria (ou passar a decidir tudo), este caso
    // acusa, e nenhum dos dois mecanismos fica sem ser exercitado.
    assert.deepEqual(partida.porMotivo, { "contradicao-imediata": 26, "sem-solucao": 2 });
  });

  test("no tabuleiro vazio nenhuma jogada esta forcada", () => {
    assert.equal(proximaJogada(new Tabuleiro()), null);
  });

  test("a mesma partida repetida da o mesmo resultado", () => {
    const primeira = jogarAteOFim(de(...PUZZLE));
    const segunda = jogarAteOFim(de(...PUZZLE));

    assert.deepEqual(segunda, primeira);
  });

  test("cada uma das 8 pistas e necessaria para a solucao ser unica", () => {
    const pistas = coordenadas((linha, coluna) => de(...PUZZLE).ehPista(linha, coluna));
    assert.equal(pistas.length, 8);

    for (const [linha, coluna] of pistas) {
      const semAPista = de(...PUZZLE).grade();
      semAPista[linha][coluna] = null;

      assert.equal(
        new Tabuleiro(semAPista).solucoes(2).length,
        2,
        `sem a pista (${linha}, ${coluna}) o puzzle deveria admitir mais de uma solucao`,
      );
    }
  });
});

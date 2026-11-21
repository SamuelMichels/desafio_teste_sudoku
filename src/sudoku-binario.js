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

  #linha(indice) {
    return this.celulas[indice];
  }

  #coluna(indice) {
    return this.celulas.map((linha) => linha[indice]);
  }

  #faixa(tipo, indice) {
    return tipo === "linha" ? this.#linha(indice) : this.#coluna(indice);
  }

  /**
   * As regras violadas pelo que esta no tabuleiro agora. Cada violacao diz a
   * regra, se e numa linha ou numa coluna, e o indice da faixa. A ordem e
   * deterministica (as 6 linhas e depois as 6 colunas, e dentro de cada faixa a
   * ordem das regras) para que o caso de teste possa comparar a lista inteira
   * de uma vez.
   */
  violacoes() {
    const encontradas = [];
    for (const tipo of ["linha", "coluna"]) {
      for (let indice = 0; indice < LADO; indice += 1) {
        const valores = this.#faixa(tipo, indice);

        // Balanco: metade de cada valor, ou seja 3 e 3. O quarto valor igual ja
        // e violacao mesmo com a faixa incompleta, porque nao existe
        // preenchimento das celulas restantes que conserte a contagem.
        if (VALORES.some((valor) => valores.filter((x) => x === valor).length > LADO / 2)) {
          encontradas.push({ regra: "balanco", tipo, indice });
        }

        // Trio: tres iguais em sequencia. A celula vazia nao prolonga a
        // sequencia, porque ainda pode receber o valor diferente.
        if (valores.some((valor, i) => valor !== null && i >= 2 && valores[i - 1] === valor && valores[i - 2] === valor)) {
          encontradas.push({ regra: "trio", tipo, indice });
        }

        // Repeticao: so se cobra entre faixas completas, porque uma faixa com
        // celula vazia ainda pode terminar diferente. A violacao fica na faixa
        // repetida, de indice maior, e nao na primeira ocorrencia.
        if (!valores.includes(null)) {
          const repetida = Array.from({ length: indice }, (_, anterior) => this.#faixa(tipo, anterior))
            .some((outra) => outra.every((valor, i) => valor === valores[i]));
          if (repetida) {
            encontradas.push({ regra: "repeticao", tipo, indice });
          }
        }
      }
    }
    return encontradas;
  }

  /**
   * As grades que completam este tabuleiro sem violar nenhuma regra, no maximo
   * `limite`. Busca por tentativa e erro: preenche as celulas vazias em ordem e
   * volta atras na primeira violacao, o que descarta o ramo inteiro em vez de
   * montar as 2^vazias combinacoes. O tabuleiro de onde a busca partiu nao e
   * alterado, e as pistas nao sao reescritas.
   */
  solucoes(limite = 2) {
    const busca = new Tabuleiro(this.grade());
    const vazias = [];
    for (let linha = 0; linha < LADO; linha += 1) {
      for (let coluna = 0; coluna < LADO; coluna += 1) {
        if (busca.celulas[linha][coluna] === null) {
          vazias.push([linha, coluna]);
        }
      }
    }

    const encontradas = [];
    const passo = (indice) => {
      if (encontradas.length >= limite || !busca.valido()) {
        return;
      }
      if (indice === vazias.length) {
        encontradas.push(busca.grade());
        return;
      }
      const [linha, coluna] = vazias[indice];
      for (const valor of VALORES) {
        busca.celulas[linha][coluna] = valor;
        passo(indice + 1);
        busca.celulas[linha][coluna] = null;
      }
    };
    passo(0);

    return encontradas;
  }

  completo() {
    return this.vazias() === 0;
  }

  /** Resolvido e completo sem violar regra: faltar celula ou violar nao resolve. */
  resolvido() {
    return this.completo() && this.valido();
  }

  valido() {
    return this.violacoes().length === 0;
  }
}

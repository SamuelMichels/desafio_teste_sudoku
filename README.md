# desafio_teste_sudoku

Casos de teste em JavaScript para um **Sudoku binário 6 × 6** (também chamado
*Takuzu* ou *Binairo*), escritos com o executor de testes nativo do Node
(`node:test` + `node:assert/strict`), sem nenhuma dependência externa.

O desafio pedia *casos de teste para testar Sudoku binário de tamanho 6 x 6;
casos de teste em Javascript para testar Javascript*. Como não havia um
programa dado para testar, o repositório traz as duas partes: o **modelo do
jogo** (`src/sudoku-binario.js`), construído por TDD, e a **suíte de casos de
teste** (`test/`), que é o entregável do desafio. Cada ciclo de TDD é um commit,
então o histórico do git mostra o teste chegando antes do código.

## Colaborador

| Nome | RA |
| --- | --- |
| Samuel Fuentes Michels | 24011114-2 |

Trabalho individual.

## Como executar

Node 18 ou mais novo (o `node --test` é nativo; nenhum `npm install` é
necessário).

```bash
node --test
```

Saída esperada:

```
# tests 64
# suites 11
# pass 64
# fail 0
```

---

## 1. Especificação do desafio

Esta é a especificação que os casos de teste cobram. Ela foi fixada antes do
código, e cada item abaixo tem pelo menos um caso de teste correspondente na
tabela da seção 3.

### 1.1 O tabuleiro

| Item | Valor |
| --- | --- |
| Lado | 6 |
| Células | 36 |
| Coordenadas | `(linha, coluna)`, ambas de 0 a 5 |
| Valor de uma célula | `0`, `1` ou `null` (célula vazia) |

Um tabuleiro pode nascer **vazio** (as 36 células em `null`) ou **a partir de
uma grade informada**. No segundo caso, toda célula que já vem preenchida é uma
**pista do puzzle**: o jogador preenche o resto, mas não reescreve o enunciado.

### 1.2 As três regras

| Regra | Enunciado | Exemplo de linha que viola |
| --- | --- | --- |
| `balanco` | cada linha e cada coluna tem exatamente **3 zeros e 3 uns** | `0 0 1 0 0 .` (quatro zeros) |
| `trio` | **nunca três iguais em sequência**, na linha ou na coluna | `0 0 0 . . .` |
| `repeticao` | nenhuma linha é igual a outra linha, nenhuma coluna é igual a outra coluna | duas linhas `0 0 1 0 1 1` |

Quando uma regra passa a valer importa tanto quanto a regra em si, porque o
tabuleiro é conferido **no meio do preenchimento**, não só no fim:

| Regra | Vale com o tabuleiro incompleto? | Por quê |
| --- | --- | --- |
| `balanco` | **sim**, no quarto valor igual | não existe preenchimento das células restantes que conserte a contagem |
| `trio` | **sim**, assim que os três iguais ficam lado a lado | uma célula vazia **não** prolonga a sequência: `0 0 . 0` não é trio |
| `repeticao` | **não**, só entre faixas completas | uma faixa com célula vazia ainda pode terminar diferente |

### 1.3 Como as violações são relatadas

`violacoes()` devolve a lista do que está violado **agora**. Cada item diz a
regra, se é numa linha ou numa coluna, e o índice da faixa:

```js
{ regra: "balanco", tipo: "linha", indice: 0 }
```

A ordem é determinística — as 6 linhas e depois as 6 colunas, e dentro de cada
faixa a ordem das regras (`balanco`, `trio`, `repeticao`) — justamente para que
um caso de teste possa comparar a lista inteira de uma vez, em vez de procurar
um item dentro dela.

Duas sequências de três iguais na mesma linha contam como **uma** violação de
`trio`: a lista é por faixa e por regra, não por ocorrência. Já a `repeticao`
fica registrada na faixa **repetida** (a de índice maior), não na primeira
ocorrência.

### 1.4 Estado do jogo

| Método | Significado |
| --- | --- |
| `vazias()` | quantas das 36 células ainda estão em `null` |
| `valido()` | não há nenhuma violação |
| `completo()` | as 36 células estão preenchidas, **sem olhar as regras** |
| `resolvido()` | `completo()` **e** `valido()` |

Um tabuleiro cheio e errado é `completo()` e não é `resolvido()`; um tabuleiro
correto pela metade é `valido()` e não é `resolvido()`.

### 1.5 Jogadas recusadas

| Situação | Mensagem do erro |
| --- | --- |
| coordenada fora de 0..5, ou não inteira | `A celula (x, y) esta fora do tabuleiro.` |
| valor que não é `0`, `1` nem `null` | `Valor invalido: v. Use 0, 1 ou null.` |
| célula que é pista do puzzle | `A celula (x, y) e uma pista do puzzle: nao pode ser alterada.` |
| grade de construção sem 6 linhas | `A grade precisa ter 6 linhas.` |
| linha de construção sem 6 colunas | `Cada linha precisa ter 6 colunas.` |
| valor inválido na grade de construção | `Valor invalido: v. Use 0, 1 ou null.` |

Uma jogada recusada **não altera nada**: o tabuleiro fica exatamente como
estava.

### 1.6 Solucionador e unicidade

`solucoes(limite = 2)` devolve as grades que completam o tabuleiro sem violar
nenhuma regra, no máximo `limite` delas. O limite existe por causa da pergunta
que de fato importa num puzzle — *a solução é única?* — que se responde pedindo
**duas** soluções e vendo quantas voltam. Buscar todas para descobrir isso seria
desperdício: o tabuleiro vazio tem 4140 soluções.

O tabuleiro de onde a busca partiu não é alterado, e nenhuma solução devolvida
contraria uma pista.

### 1.7 O puzzle de exemplo

As pistas e a única solução usadas pelos casos de teste (`.` é célula vazia):

```
puzzle (8 pistas)        solução
0 . . . 1 .              0 0 1 0 1 1
. 0 . . . .              0 0 1 1 0 1
. . . 0 . .              1 1 0 0 1 0
. . 0 0 . .              0 1 0 0 1 1
1 . . . . .              1 0 1 1 0 0
. . . . . 0              1 1 0 1 0 0
```

As 8 pistas são **mínimas**: apagar qualquer uma delas faz o puzzle admitir mais
de uma solução, e há um caso de teste que confere isso pista por pista.

---

## 2. O modelo testado

`src/sudoku-binario.js` exporta `LADO` (6) e a classe `Tabuleiro`:

| Membro | O que faz |
| --- | --- |
| `new Tabuleiro()` | tabuleiro vazio |
| `new Tabuleiro(grade)` | tabuleiro a partir de uma grade 6 × 6; o que vem preenchido vira pista |
| `jogar(linha, coluna, valor)` | preenche com `0`/`1` ou apaga com `null` |
| `valor(linha, coluna)` | o valor de uma célula |
| `grade()` | **cópia** da grade |
| `ehPista(linha, coluna)` | se a célula veio no enunciado |
| `vazias()`, `completo()`, `resolvido()`, `valido()` | estado |
| `violacoes()` | a lista descrita em 1.3 |
| `solucoes(limite)` | o solucionador de 1.6 |

Duas decisões foram tomadas **para o modelo ser testável**, e as duas aparecem
nos casos de teste:

1. **A grade entra pelo construtor.** Sem isso, todo cenário teria de ser
   montado por uma sequência de jogadas, e um caso que precisa de uma coluna
   quase cheia ficaria ilegível. Como efeito, o construtor também define as
   pistas, o que dá o conceito de enunciado imutável de graça.
2. **`grade()` devolve uma cópia.** Um caso de teste que guarda o estado
   "antes", joga e compara com o "depois" só funciona se o que ele guardou não
   mudar junto. Há um invariante conferido jogada a jogada que tenta sujar a
   cópia e verifica que o tabuleiro não sentiu.

`apoio/grade.js` fica **fora de `test/`** de propósito: `node --test` conta
todo arquivo dentro de `test/` como arquivo de teste, inclusive um que só
exporta ajuda. Ele traz o atalho `de("001011", ...)`, que desenha o cenário
como seis linhas de seis caracteres (`.` é célula vazia) em vez de uma matriz
de números, além das constantes `SOLUCAO` e `PUZZLE` da seção 1.7.

---

## 3. Como funcionam os casos de teste

São **64 casos** em **11 suítes**, divididos em 8 arquivos, 764 linhas de teste
para 185 linhas de modelo:

| Arquivo | Casos | O que cobra |
| --- | --- | --- |
| [test/tabuleiro.test.js](test/tabuleiro.test.js) | 7 | as dimensões, a célula vazia, a grade informada e as grades recusadas na construção |
| [test/jogada.test.js](test/jogada.test.js) | 10 | preencher, trocar e apagar; pista imutável; coordenada e valor recusados |
| [test/balanco.test.js](test/balanco.test.js) | 8 | a regra do balanço em linha e em coluna, e quando ela ainda não vale |
| [test/trio.test.js](test/trio.test.js) | 8 | três iguais consecutivos, no início, no meio e no fim; a sequência interrompida por célula vazia |
| [test/repeticao.test.js](test/repeticao.test.js) | 7 | linha e coluna repetidas, só entre faixas completas, e qual índice é acusado |
| [test/resolvido.test.js](test/resolvido.test.js) | 9 | completo × resolvido, e a última célula certa e errada |
| [test/solucionador.test.js](test/solucionador.test.js) | 9 | solução única, puzzle sem solução, o limite da busca e as 4140 soluções do tabuleiro vazio |
| [test/partida-completa.test.js](test/partida-completa.test.js) | 6 | o puzzle deduzido do início ao fim, com invariantes jogada a jogada, e a minimalidade das 8 pistas |

### 3.1 As três formas de examinar o modelo

**Uma regra por vez, em cenário isolado.** Cada regra tem seu arquivo, e os
cenários são montados para que **só** aquela regra possa disparar. É por isso
que o caso do balanço usa `0 0 1 0 0 .` em vez de `0 0 0 0 . .`: as duas linhas
têm quatro zeros, mas a segunda também tem três iguais em sequência, e aí a
falha não diria qual das duas regras errou. O cenário desenhado em seis
strings deixa isso visível:

```js
const tabuleiro = de(
  "00100.",
  "......",
  // ...
);

assert.deepEqual(tabuleiro.violacoes(), [{ regra: "balanco", tipo: "linha", indice: 0 }]);
```

A comparação é sempre da **lista inteira** de violações, nunca "existe uma
violação de balanço". A diferença importa: com `deepEqual` da lista, um modelo
que acusasse a linha certa **e** uma coluna errada seria pego; com uma busca
dentro da lista, passaria.

**O que deve ser recusado.** Para cada recusa da seção 1.5 há um caso que
confere a mensagem (por expressão regular, não pelo texto exato, para o caso
não quebrar com uma vírgula) e, depois, que o estado não mudou:

```js
assert.throws(() => tabuleiro.jogar(0, 6, 1), /fora do tabuleiro/i);
assert.deepEqual(tabuleiro.grade(), antes);
```

**Uma partida inteira, com invariantes a cada jogada.**
[test/partida-completa.test.js](test/partida-completa.test.js) tem um jogador
que **não conhece a solução**: ele olha só o que a API pública mostra e só joga
o que está logicamente forçado, em duas etapas — primeiro a contradição
imediata (se pôr `0` numa célula já viola uma regra, a célula tem de ser `1`)
e, quando isso não decide nada, o olhar adiante (se pôr `0` deixa um tabuleiro
que não completa de forma nenhuma, a célula tem de ser `1`). Se nenhuma célula
estiver forçada, ele devolve `null` em vez de adivinhar — e há um caso que
confere justamente isso no tabuleiro vazio, para o jogador não poder "deduzir"
o que não está determinado.

Depois de cada uma das 28 jogadas, cinco invariantes são conferidos: as pistas
continuam com o mesmo valor e continuam sendo pistas; não há nenhuma violação;
`vazias()` concorda com a grade; `grade()` não vazou a estrutura interna (o
caso suja a cópia e confere que o tabuleiro não sentiu); e `completo()` só é
verdadeiro junto com `resolvido()`.

### 3.2 A prova de que os casos pegam defeito

**Cada ciclo começou vermelho.** Um ciclo de TDD por commit. A coluna
"falharam" é o que o `node --test` reportou **antes** de o código daquele ciclo
existir — números reconstruídos rodando os testes de cada commit contra o
`src/` do commit anterior, não estimados:

| Ciclo | Commit | Casos novos | Falharam no RED | Passaram vazios |
| --- | --- | --- | --- | --- |
| 1 — tabuleiro | `80d18dd` | 7 | 7 | 0 |
| 2 — jogada e pistas | `13f3f9a` | 10 | 10 | 0 |
| 3 — balanço | `05f987e` | 8 | 8 | 0 |
| 4 — trio | `bb8a5ee` | 8 | 6 | 2 |
| 5 — repetição | `d53b48c` | 7 | 4 | 3 |
| 6 — completo e resolvido | `1fcf106` | 9 | 9 | 0 |
| 7 — solucionador | `17edc15` | 9 | 9 | 0 |
| 8 — partida completa | `0702f0a` | 6 | 1 | 5 |
| | | **64** | **54** | **10** |

**Os 10 casos que passaram já no vermelho**, e por quê — um caso que passa
antes do código existir não provou nada, e vale saber qual é:

| Ciclo | Caso | Por que passou vazio |
| --- | --- | --- |
| 4 | dois iguais consecutivos não violam nada | afirma **ausência** de violação, e a regra do trio ainda não existia |
| 4 | a sequência interrompida por célula vazia não viola o trio | idem |
| 5 | duas linhas iguais mas incompletas não violam | idem, para a repetição |
| 5 | duas linhas completas diferentes não violam nada | idem |
| 5 | um tabuleiro resolvido não viola nenhuma das regras | passou pelas duas regras já prontas |
| 8 | 5 dos 6 casos de partida completa | o ciclo 8 **não acrescentou código**: é teste de integração sobre a API já pronta |

No ciclo 8 o vermelho veio do caso de caracterização: ele foi escrito afirmando
`{ "contradicao-imediata": 0, "sem-solucao": 0 }` justamente para a falha
**imprimir a medida real**, que é 26 e 2 e está fixada no caso. Esse número é o
que garante que o segundo mecanismo de dedução não é decoração: se o olhar
adiante parar de ser necessário, ou passar a decidir tudo, o caso acusa.

**Teste de mutação: 14 defeitos plantados, 14 pegos.** Cada mutante é uma
alteração mínima no `src/` — a suíte roda inteira e o mutante é "morto" se
algum caso falha:

| # | Defeito plantado | Casos que falharam |
| --- | --- | --- |
| M1 | balanço estrito: 3 iguais já violam | 29 |
| M2 | balanço nunca dispara | 13 |
| M3 | trio vira dupla (dois iguais bastam) | 27 |
| M4 | trio ignora a célula vazia | 32 |
| M5 | trio só a partir da quarta célula | 3 |
| M6 | repetição cobrada também em faixa incompleta | 31 |
| M7 | repetição compara a faixa com todas, inclusive ela mesma | 26 |
| M8 | repetição nunca registrada | 9 |
| M9 | as colunas não são conferidas | 10 |
| M10 | `resolvido()` ignora as regras | 2 |
| M11 | `completo()` tolera uma célula vazia | 5 |
| M12 | pista do puzzle pode ser alterada | 3 |
| M13 | limite do solucionador frouxo | 3 |
| M14 | índice do tabuleiro aceita o 6 | 1 |

M14 é pego por **um** caso só (`coordenada fora do tabuleiro e recusada`, cujos
quatro `assert.throws` incluem a coluna 6), e M10 por dois. São os pontos onde
a suíte não tem folga: apagar aquele caso deixaria o defeito passar.

### 3.3 O que o teste de mutação mudou no código

O M6 **sobreviveu** na primeira rodada: cobrar a repetição também em faixas
incompletas não fez nenhum caso falhar. A investigação mostrou que o problema
não era a suíte, e sim o modelo — a condição tinha **duas** guardas contra
célula vazia, uma na faixa atual e outra na faixa comparada, e cada uma já
bastava sozinha, porque uma faixa com célula vazia nunca sai igual a uma faixa
completa. Um mutante que derruba uma guarda redundante não pode ser pego por
caso de teste nenhum.

A guarda a mais saiu (commit `d9adb94`), e o mesmo M6 passou a morrer com 31
casos falhando: sem a redundância, duas linhas incompletas iguais passam a ser
acusadas, e o caso `duas linhas iguais mas incompletas nao violam a repeticao`
pega o defeito. O teste de mutação achou código morto, não um furo de
cobertura.

---

## 4. Resultado final

| Medida | Valor |
| --- | --- |
| Casos de teste | 64, em 11 suítes |
| Linhas de teste / de modelo | 764 / 185 |
| Ciclos de TDD (um commit cada) | 8 |
| Casos que falharam no RED | 54 de 64 |
| Casos que passaram vazios no RED | 10 (todos justificados em 3.2) |
| Mutantes mortos | 14 de 14 |
| Dependências externas | nenhuma |
| Tempo da suíte | menos de 1 segundo |

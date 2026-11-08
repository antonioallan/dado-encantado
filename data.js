// Conteúdo da história e das regras (fonte: docs/regras-e-historia-teste.pdf).
// Para editar ou criar novas aventuras, basta mexer neste arquivo.

const ICONES = {
  forca: { nome: "Força", emoji: "💪", cor: "var(--forca)" },
  esperteza: { nome: "Esperteza", emoji: "🧠", cor: "var(--esperteza)" },
  magia: { nome: "Magia", emoji: "✨", cor: "var(--magia)" },
};

const PERSONAGENS = [
  { id: "cavaleira", nome: "Cavaleira do Caju", emoji: "🛡️", forte: "forca",
    poder: "Escudo de casca: protege todo mundo de um perigo" },
  { id: "tatu", nome: "Menino-Tatu", emoji: "🦔", forte: "forca",
    poder: "Vira bola e rola por baixo de qualquer obstáculo" },
  { id: "inventora", nome: "Inventora de Sucata", emoji: "🔧", forte: "esperteza",
    poder: "Monta uma engenhoca que resolve um problema" },
  { id: "coruja", nome: "Detetive Coruja", emoji: "🦉", forte: "esperteza",
    poder: "Faz uma pergunta e o adulto tem que responder a verdade" },
  { id: "fada", nome: "Fada do Ipê", emoji: "🧚", forte: "magia",
    poder: "Faz uma planta crescer do tamanho que quiser" },
  { id: "guardiao", nome: "Guardião da Mata", emoji: "🌳", forte: "magia",
    poder: "Conversa com qualquer bicho e o bicho ajuda" },
];

const ESTRELAS_INICIAIS = 5;

const REGRAS_RESUMO = [
  "A criança diz o que quer fazer, escolhe um ícone e rola o dado.",
  "Ícone forte (o do personagem): rola 2 dados e fica com o maior.",
  "Ajuda de um amigo: gasta 1 ⭐ e quem rola usa 2 dados e fica com o maior.",
  "Re-rolar o dado: gasta 1 ⭐.",
  "Ganha 1 ⭐: ideia criativa, ser gentil ou fazer todo mundo rir.",
  "Ação fácil ou só de brincar? Não rola, simplesmente consegue.",
  "Ninguém perde, ninguém morre. Se der muito errado, o personagem fica “tonto” até um amigo ajudar ou até a próxima cena.",
  "Se a criança inventar algo fora do cartão: diga “sim” e escolha o ícone que mais combina.",
];

const DICAS_ADULTO = [
  "Ofereça duas opções em vez de perguntas abertas: “Você quer pular ou procurar outro caminho?”",
  "Faça vozes, mesmo que exageradas. É o que mais diverte nessa idade.",
  "Pare quando a atenção acabar, mesmo no meio. “Continua no próximo episódio” também é um bom final.",
  "Medo, só um pouquinho. Vilões podem ser bobos, rabugentos ou tristes, nunca assustadores de verdade.",
];

const FAIXAS = {
  baixo: { rotulo: "1–2", titulo: "Deu errado… mas foi engraçado!", cor: "var(--ruim)" },
  medio: { rotulo: "3–4", titulo: "Conseguiu, mas com uma complicação!", cor: "var(--medio)" },
  alto: { rotulo: "5–6", titulo: "Conseguiu, e bem!", cor: "var(--bom)" },
};

const AVENTURA = {
  titulo: "Aventura 1: O Sumiço do Caju Dourado",
  resumo: "O Caju Dourado, que faz o Cajueiro Gigante dar frutas, sumiu! Os heróis precisam encontrá-lo antes da Festa da Colheita.",
  cenas: [
    {
      titulo: "A árvore triste", emoji: "🌳", voz: "",
      ler: "Hoje é véspera da Festa da Colheita, mas o Cajueiro Gigante está com as folhas caídas. O Caju Dourado, que ficava lá no galho mais alto, sumiu! No chão, vocês veem pegadas de um pé só e um gorro vermelho pequenininho.",
      pergunta: "O que vocês fazem para descobrir quem levou o caju?",
      travar: [
        { icone: "esperteza", texto: "Olhar as pegadas e o gorro com atenção." },
        { icone: "magia", texto: "Perguntar à árvore o que ela viu." },
        { icone: "forca", texto: "Subir no galho mais alto para olhar a vila de cima." },
      ],
      resultados: {
        baixo: "Escorrega e cai num monte de folhas (sem se machucar). Do chão, vê um redemoinho de vento entrando na floresta.",
        medio: "Descobre que as pegadas vão para a floresta, mas o vento começa a apagá-las. É preciso ir logo.",
        alto: "Descobre que foi o Saci e que ele foi para a Trilha dos Vagalumes.",
      },
      proxima: "Cena 2. Antes de sair, os heróis podem passar na Venda da Dona Benedita.",
      extra: {
        titulo: "🛒 Venda da Dona Benedita (opcional)",
        texto: "Cada criança ganha 1 ⭐ e um item pequeno que inventar. A dona sempre sabe uma fofoca!",
        bonusEstrela: true,
      },
    },
    {
      titulo: "O Rio Manso", emoji: "🌊", voz: "",
      ler: "Para chegar à floresta, vocês precisam atravessar o Rio Manso. Mas hoje ele não está nada manso: a ponte de madeira está quebrada no meio!",
      pergunta: "Como vocês atravessam?",
      travar: [
        { icone: "forca", texto: "Pular de pedra em pedra." },
        { icone: "esperteza", texto: "Consertar a ponte com galhos e cipós." },
        { icone: "magia", texto: "Pedir ajuda aos peixes ou às tartarugas." },
      ],
      resultados: {
        baixo: "“Splash!” Cai na água rasa e sai molhado. Fica espirrando pelo resto da aventura (a criança pode espirrar quando quiser).",
        medio: "Atravessa, mas perde uma coisa no rio (a criança escolhe o quê).",
        alto: "Atravessa sem problema e ainda ajuda os amigos.",
      },
      proxima: "Cena 3.",
    },
    {
      titulo: "As Pedras Falantes", emoji: "🪨", voz: "com voz grossa e rabugenta",
      ler: "Alto lá! Ninguém passa pela Clareira das Pedras Falantes sem responder à nossa adivinha!",
      adivinha: { texto: "O que é, o que é: tem dentes mas não morde?", resposta: "O pente. Troque por outra se a criança já souber." },
      pergunta: "O que vocês respondem?",
      travar: [
        { icone: "esperteza", texto: "Pensar na resposta (o adulto pode dar dicas)." },
        { icone: "magia", texto: "Fazer as pedras ficarem com sono para passar escondido." },
        { icone: "forca", texto: "Empurrar as pedras para o lado (elas reclamam muito)." },
      ],
      acerto: "Se a criança acertar a adivinha, passa sem rolar e ganha 1 ⭐. Se tentar outro jeito, role o dado:",
      resultados: {
        baixo: "As pedras ficam ofendidas e cantam uma música muito desafinada. Os heróis passam, mas com dor de ouvido.",
        medio: "Passa, mas uma pedra pequenininha resolve seguir o grupo e não para de falar.",
        alto: "Passa, e as pedras contam que o Saci está na Toca dele.",
      },
      proxima: "Cena 4.",
    },
    {
      titulo: "Dona Onça no caminho", emoji: "🐆", voz: "",
      ler: "Na trilha, uma onça enorme está deitada bem no meio do caminho. Ela olha para vocês e… treme! Dona Onça está com medo: um trovão assustou ela e ela não consegue sair dali.",
      pergunta: "Como vocês ajudam a Dona Onça?",
      travar: [
        { icone: "magia", texto: "Cantar uma canção de ninar para acalmá-la." },
        { icone: "esperteza", texto: "Conversar e mostrar que o trovão já passou." },
        { icone: "forca", texto: "Fazer uma cabaninha de folhas para ela se esconder." },
      ],
      resultados: {
        baixo: "Ela se assusta mais e sobe numa árvore. Os heróis precisam tentar de novo, de outro jeito.",
        medio: "Ela se acalma e deixa o grupo passar.",
        alto: "Ela se acalma e oferece uma carona nas costas até a Toca do Saci.",
      },
      proxima: "Cena 5.",
    },
    {
      titulo: "A Toca do Saci", emoji: "🎩", voz: "com risadinha",
      ler: "Dentro de um tronco oco, está o Saci, rodeado de coisas que ele pegou emprestado: meias, chapéus, colheres… e o Caju Dourado! “Hihihi! Esse caju brilha tanto que eu queria ele só para mim!”",
      pergunta: "Como vocês recuperam o Caju Dourado?",
      travar: [
        { icone: "esperteza", texto: "Propor uma troca ou um desafio (corrida, adivinha, quem pula mais alto num pé só)." },
        { icone: "magia", texto: "Fazer o caju voar de volta para as mãos dos heróis." },
        { icone: "forca", texto: "Pegar o gorro do Saci, porque sem gorro ele perde os poderes." },
      ],
      resultados: {
        baixo: "O Saci vira um redemoinho e foge com o caju. Os heróis têm mais uma tentativa, e todos podem ajudar.",
        medio: "Recuperam o caju, mas o Saci leva a meia de um dos heróis como lembrancinha.",
        alto: "Recuperam o caju, e o Saci pede desculpas e pede para ir à festa.",
      },
      proxima: "Final da aventura!",
      final: "De volta à vila, vocês colocam o Caju Dourado no galho mais alto. O Cajueiro Gigante se enche de folhas e frutas, e a Festa da Colheita começa! Todo mundo comemora os heróis da Vila do Cajueiro.",
      depois: "Pergunte qual foi a parte favorita da criança e o que ela quer que aconteça na próxima aventura.",
    },
  ],
};

const ROTEIRO_TESTE = [
  { id: "t1", titulo: "Teste 1: com a sua filha (você conduz)", itens: [
    "Ela entendeu os 3 ícones sem explicação longa?",
    "Escolheu ações próprias ou só as sugeridas?",
    "Em qual cena a atenção caiu? Quanto tempo durou a sessão?",
    "Os resultados 1–2 a deixaram frustrada ou ela riu?",
    "Ela usou as Estrelas sozinha?",
    "Pediu para jogar de novo?",
  ]},
  { id: "t2", titulo: "Teste 2: com um adulto que nunca jogou RPG", itens: [
    "Entregue só este documento, sem explicar nada.",
    "Anote onde ele parou para perguntar ou se confundiu.",
    "Ele conseguiu responder quando a criança fez algo fora do cartão?",
    "Ele jogaria de novo sem você por perto?",
  ]},
];

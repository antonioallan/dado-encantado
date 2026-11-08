(() => {
  const CHAVE = "dado-encantado-v1";
  const $app = document.getElementById("app");
  const $timer = document.getElementById("timer");
  const $abas = document.getElementById("abas");

  const padrao = () => ({
    aba: "grupo",
    jogadores: [novoJogador()],
    cena: 0,
    inicio: null,        // ms: começo da aventura
    cenaInicio: null,    // ms: começo da cena atual
    log: [],             // [{titulo, ms}]
    testes: { checks: {}, notas: { t1: "", t2: "" } },
    ator: 0, icone: null, ajudante: null,
  });
  function novoJogador() {
    return { nome: "", perso: null, estrelas: ESTRELAS_INICIAIS, poderUsado: false, tonto: false, trocando: false };
  }

  let S = carregar();
  let efemero = { rolando: false, resultado: null, semRolar: null, extra: {} };

  function carregar() {
    try {
      const salvo = JSON.parse(localStorage.getItem(CHAVE));
      if (salvo && salvo.jogadores) return { ...padrao(), ...salvo };
    } catch (e) {}
    return padrao();
  }
  function salvar() {
    try { localStorage.setItem(CHAVE, JSON.stringify(S)); } catch (e) {}
  }

  const esc = (t) => String(t).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const perso = (id) => PERSONAGENS.find((p) => p.id === id);
  const nomeDe = (j, i) => j.nome.trim() || (j.perso ? perso(j.perso).nome : `Criança ${i + 1}`);
  const prontos = () => S.jogadores.map((j, i) => ({ j, i })).filter(({ j }) => j.perso);
  const fmt = (ms) => { const m = Math.floor(ms / 60000); const s = Math.floor(ms / 1000) % 60; return `${m}:${String(s).padStart(2, "0")}`; };
  const d6 = () => 1 + Math.floor(Math.random() * 6);
  const faixaDe = (n) => (n <= 2 ? "baixo" : n <= 4 ? "medio" : "alto");
  const iconeTag = (k) => `<span class="tag" style="background:${ICONES[k].cor}">${ICONES[k].emoji} ${ICONES[k].nome}</span>`;

  /* ---------- Telas ---------- */

  function telaGrupo() {
    const cartas = S.jogadores.map((j, i) => {
      const p = j.perso ? perso(j.perso) : null;
      const estrelas = Array.from({ length: Math.max(ESTRELAS_INICIAIS, j.estrelas) }, (_, k) =>
        `<span class="${k < j.estrelas ? "" : "vazia"}">⭐</span>`).join("");
      const escolha = !p || j.trocando
        ? `<div class="rotulo">Escolha o personagem:</div>
           <div class="escolha">${PERSONAGENS.map((c) => `
             <div class="perso ${j.perso === c.id ? "sel" : ""}" data-act="perso" data-i="${i}" data-id="${c.id}">
               <div class="em">${c.emoji}</div><div class="nm">${esc(c.nome)}</div>
               <div>${iconeTag(c.forte)}</div><div class="pd">${esc(c.poder)}</div>
             </div>`).join("")}</div>`
        : "";
      return `
      <div class="card">
        <input type="text" placeholder="Nome da criança / do personagem" value="${esc(j.nome)}" data-act="nome" data-i="${i}" maxlength="24">
        <div style="height:12px"></div>
        ${p ? `
        <div class="jogador ${j.tonto ? "tonto" : ""}">
          <div class="em">${p.emoji}</div>
          <div><div class="nome">${esc(nomeDe(j, i))} ${j.tonto ? "😵‍💫" : ""}</div>
            <div class="suave">${esc(p.nome)} · forte em ${iconeTag(p.forte)}</div></div>
          <div class="estrelas">${estrelas}</div>
          <div class="acoes">
            <button class="btn mini sec" data-act="estrela" data-i="${i}" data-d="-1">− ⭐</button>
            <button class="btn mini" data-act="estrela" data-i="${i}" data-d="1">+ ⭐</button>
            <button class="btn mini sec" data-act="poder" data-i="${i}">${j.poderUsado ? "✅ Poder usado" : "⚡ Usar poder"}</button>
            <button class="btn mini sec" data-act="tonto" data-i="${i}">${j.tonto ? "Acordou!" : "😵‍💫 Tonto"}</button>
            <button class="btn mini sec" data-act="trocar" data-i="${i}">Trocar</button>
          </div>
        </div>
        <div class="suave" style="margin-top:8px">⚡ ${esc(p.poder)} (1 vez por aventura, sem rolar dado)</div>` : ""}
        ${escolha}
        ${S.jogadores.length > 1 ? `<div style="margin-top:10px"><button class="btn mini sec" data-act="remover" data-i="${i}">Remover criança</button></div>` : ""}
      </div>`;
    }).join("");

    return `
      <h2>Quem vai jogar?</h2>
      <p class="suave">1 a 3 crianças. Cada uma escolhe um personagem e começa com ${ESTRELAS_INICIAIS} ⭐ Estrelas.</p>
      ${cartas}
      <div class="linha" style="margin-bottom:16px">
        ${S.jogadores.length < 3 ? `<button class="btn sec" data-act="add">+ Adicionar criança</button>` : ""}
        <button class="btn" data-act="comecar" ${prontos().length ? "" : "disabled"}>${S.inicio ? "Voltar à aventura ▶" : "Começar a aventura ▶"}</button>
      </div>
      ${S.inicio ? `<button class="btn sec mini" data-act="reiniciar">Recomeçar do zero (zera cenas e Estrelas)</button>` : ""}`;
  }

  function telaCena() {
    const cenas = AVENTURA.cenas;
    const c = cenas[S.cena];
    const prog = cenas.map((_, i) => `<span class="${i < S.cena ? "feito" : i === S.cena ? "atual" : ""}"></span>`).join("");
    const ultima = S.cena === cenas.length - 1;
    const ex = efemero.extra[S.cena];

    return `
      <div class="progresso">${prog}</div>
      <div class="card">
        <div class="cena-titulo"><span class="em">${c.emoji}</span>
          <div><div class="suave">Cena ${S.cena + 1} de ${cenas.length}</div><h2 style="margin:0">${esc(c.titulo)}</h2></div></div>
        <div class="voz" style="margin-top:12px">📢 Leia em voz alta${c.voz ? ` (${esc(c.voz)})` : ""}</div>
        <div class="leia">“${esc(c.ler)}”</div>
        ${c.adivinha ? `<div class="leia" style="border-color:var(--magia)"><b>A adivinha:</b> “${esc(c.adivinha.texto)}”<br><span class="suave">Resposta: ${esc(c.adivinha.resposta)}</span></div>` : ""}
        <div class="pergunta">❓ ${esc(c.pergunta)}</div>
        <details>
          <summary>💡 Se ela travar, sugira…</summary>
          ${c.travar.map((t) => `<div class="sugestao"><span class="em">${ICONES[t.icone].emoji}</span><div>${iconeTag(t.icone)}<div>${esc(t.texto)}</div></div></div>`).join("")}
        </details>
      </div>

      ${c.extra ? `<div class="card"><h3>${esc(c.extra.titulo)}</h3><p>${esc(c.extra.texto)}</p>
        ${c.extra.bonusEstrela ? `<button class="btn mini" data-act="venda" ${ex ? "disabled" : ""}>${ex ? "✅ Estrelas dadas" : "Dar 1 ⭐ para cada criança"}</button>` : ""}</div>` : ""}

      ${rolador(c)}
      ${efemero.semRolar ? `<div class="aviso">${esc(efemero.semRolar)}</div>` : ""}
      ${resultado(c)}

      <div class="card ${ultima ? "" : ""}">
        <div class="suave">Próxima cena</div>
        <p style="margin:4px 0 12px">${esc(c.proxima)}</p>
        <div class="linha">
          ${S.cena > 0 ? `<button class="btn sec" data-act="voltar">◀ Cena anterior</button>` : ""}
          ${ultima
            ? `<button class="btn" data-act="final">🎉 Terminar aventura</button>`
            : `<button class="btn" data-act="proxima">Próxima cena ▶</button>`}
        </div>
      </div>
      ${ultima && efemero.fim ? `<div class="card final"><div class="voz">📢 Final (leia em voz alta)</div>
        <div class="leia">“${esc(c.final)}”</div>
        <p><b>Depois do jogo:</b> ${esc(c.depois)}</p>
        <p class="suave">Aventura concluída em ${fmt(Date.now() - S.inicio)}. Anote como foi na aba 📝 Testes.</p></div>` : ""}`;
  }

  function rolador(c) {
    const pr = prontos();
    if (!pr.length) return `<div class="card"><p>Escolha os personagens na aba 👧 Grupo para poder rolar o dado.</p></div>`;
    if (!pr.some(({ i }) => i === S.ator)) S.ator = pr[0].i;
    const ator = S.jogadores[S.ator];
    const p = perso(ator.perso);
    const forte = S.icone === p.forte;
    const ajudantes = pr.filter(({ i, j }) => i !== S.ator && j.estrelas > 0);
    if (S.ajudante !== null && !ajudantes.some(({ i }) => i === S.ajudante)) S.ajudante = null;
    const dados = forte || S.ajudante !== null ? 2 : 1;

    return `<div class="card rolar">
      <h3>🎲 Hora de rolar</h3>
      <div class="rotulo">Quem vai agir?</div>
      <div class="seletor">${pr.map(({ i, j }) => `<button class="chip ${i === S.ator ? "sel" : ""}" data-act="ator" data-i="${i}">${perso(j.perso).emoji} ${esc(nomeDe(j, i))}</button>`).join("")}</div>
      <div class="rotulo">Qual ícone?</div>
      <div class="seletor">${Object.entries(ICONES).map(([k, v]) => `<button class="chip ${k} ${S.icone === k ? "sel" : ""}" data-act="icone" data-k="${k}">${v.emoji} ${v.nome}${k === p.forte ? " ★" : ""}</button>`).join("")}</div>
      ${pr.length > 1 ? `<div class="rotulo">Ajuda de um amigo? (ele gasta 1 ⭐)</div>
        <div class="seletor"><button class="chip ${S.ajudante === null ? "sel" : ""}" data-act="ajudante" data-i="">Ninguém</button>
        ${ajudantes.map(({ i, j }) => `<button class="chip ${S.ajudante === i ? "sel" : ""}" data-act="ajudante" data-i="${i}">${perso(j.perso).emoji} ${esc(nomeDe(j, i))}</button>`).join("")}</div>` : ""}
      <div class="resumo-roll">${S.icone ? (dados === 2 ? `2 dados, vale o maior ${forte ? "(ícone forte)" : "(ajuda de amigo)"}` : "1 dado") : "Escolha um ícone"}</div>
      <div class="dados">${efemero.rolando ? `<div class="dado rolando" id="d0">?</div>${dados === 2 ? `<div class="dado rolando" id="d1">?</div>` : ""}` : efemero.resultado ? efemero.resultado.dados.map((n, k) => `<div class="dado ${efemero.resultado.dados.length > 1 && k !== efemero.resultado.usadoIdx ? "descartado" : ""}">${n}</div>`).join("") : ""}</div>
      <div class="linha">
        <button class="btn grande" data-act="rolar" ${S.icone && !efemero.rolando ? "" : "disabled"} style="flex:1">🎲 Rolar!</button>
      </div>
      <div class="linha" style="margin-top:10px">
        <button class="btn sec mini" data-act="semrolar">Ação fácil: sem rolar</button>
        ${c.adivinha ? `<button class="btn sec mini" data-act="acertou">🧩 Acertou a adivinha (+1 ⭐)</button>` : ""}
        <button class="btn sec mini" data-act="criativo">🌟 Ideia criativa / gentil / engraçada (+1 ⭐)</button>
      </div>
    </div>`;
  }

  function resultado(c) {
    const r = efemero.resultado;
    if (!r || efemero.rolando) return "";
    const f = FAIXAS[r.faixa];
    const j = S.jogadores[r.ator];
    const podeRepetir = j && j.estrelas > 0;
    return `<div class="resultado" style="background:${f.cor}">
        <div class="tit">${f.rotulo} · ${f.titulo}</div>
        <div class="txt">${esc(c.resultados[r.faixa])}</div>
        ${c.acerto ? `<div class="suave" style="color:#fff;opacity:.85;margin-top:6px">${esc(c.acerto)}</div>` : ""}
      </div>
      <div class="linha" style="margin:10px 0 16px">
        <button class="btn sec" data-act="repetir" ${podeRepetir ? "" : "disabled"}>⭐ Rolar de novo (gasta 1 ⭐${j ? ` de ${esc(nomeDe(j, r.ator))}` : ""})</button>
        ${r.faixa === "baixo" ? `<button class="btn sec" data-act="tonto" data-i="${r.ator}" data-fica="1">😵‍💫 Deixar tonto</button>` : ""}
      </div>`;
  }

  function telaRegras() {
    return `
      <h2>Regras rápidas</h2>
      <div class="card">
        <h3>Os 3 ícones</h3>
        <ul class="limpa">
          <li>${iconeTag("forca")} empurrar, pular, correr, segurar</li>
          <li>${iconeTag("esperteza")} perceber, conversar, achar saídas</li>
          <li>${iconeTag("magia")} encantar, curar, falar com bichos e plantas</li>
        </ul>
      </div>
      <div class="card">
        <h3>O dado</h3>
        ${Object.values(FAIXAS).map((f) => `<div style="margin:6px 0"><span class="tag" style="background:${f.cor}">${f.rotulo}</span> ${f.titulo}</div>`).join("")}
        <ul class="limpa">${REGRAS_RESUMO.map((r) => `<li>${esc(r)}</li>`).join("")}</ul>
      </div>
      <div class="card"><h3>Dicas para quem nunca mestrou</h3>
        <ul class="limpa">${DICAS_ADULTO.map((r) => `<li>${esc(r)}</li>`).join("")}</ul></div>
      <div class="card"><h3>Personagens</h3>
        ${PERSONAGENS.map((c) => `<div class="sugestao"><span class="em">${c.emoji}</span><div><b>${esc(c.nome)}</b> ${iconeTag(c.forte)}<div class="suave">⚡ ${esc(c.poder)}</div></div></div>`).join("")}</div>`;
  }

  function telaTestes() {
    const blocos = ROTEIRO_TESTE.map((t) => `
      <div class="card"><h3>${esc(t.titulo)}</h3>
        ${t.itens.map((it, k) => {
          const id = `${t.id}-${k}`;
          return `<label class="check"><input type="checkbox" data-act="check" data-id="${id}" ${S.testes.checks[id] ? "checked" : ""}><span>${esc(it)}</span></label>`;
        }).join("")}
        <div class="rotulo" style="margin-top:10px">Anotações</div>
        <textarea data-act="nota" data-id="${t.id}" placeholder="O que você observou?">${esc(S.testes.notas[t.id] || "")}</textarea>
      </div>`).join("");
    return `
      <h2>Roteiro de teste</h2>
      <p class="suave">O jogo está validado quando a criança pede para jogar de novo e um adulto que nunca jogou RPG consegue conduzir sozinho.</p>
      <div class="card"><h3>⏱️ Tempo por cena (sessão atual)</h3>
        <div class="log">${S.log.length ? S.log.map((l) => `<div>${esc(l.titulo)} — <b>${fmt(l.ms)}</b></div>`).join("") : `<span class="suave">Os tempos aparecem conforme você avança as cenas.</span>`}</div>
        ${S.inicio ? `<p class="suave">Total até agora: ${fmt(Date.now() - S.inicio)}</p>` : ""}
      </div>
      ${blocos}
      <div class="linha"><button class="btn sec" data-act="copiar">📋 Copiar relatório</button>
        <button class="btn sec" data-act="limpar-testes">Limpar anotações</button></div>
      <p class="suave" id="msg-copia"></p>`;
  }

  /* ---------- Render ---------- */

  function render() {
    const telas = { grupo: telaGrupo, cena: telaCena, regras: telaRegras, testes: telaTestes };
    const ativoEl = document.activeElement;
    const ehInput = ativoEl && ativoEl.matches && ativoEl.matches("input[type=text], textarea");
    if (ehInput) return; // não re-renderiza enquanto digita
    $app.innerHTML = telas[S.aba]();
    [...$abas.children].forEach((b) => b.classList.toggle("ativa", b.dataset.aba === S.aba));
    salvar();
  }
  function forcarRender() {
    if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
    render();
  }

  /* ---------- Ações ---------- */

  function fecharCena() {
    if (S.cenaInicio) S.log.push({ titulo: `Cena ${S.cena + 1}: ${AVENTURA.cenas[S.cena].titulo}`, ms: Date.now() - S.cenaInicio });
    S.cenaInicio = Date.now();
  }
  function limparRolagem() { efemero.resultado = null; efemero.semRolar = null; S.icone = null; S.ajudante = null; }

  function rolar(repetindo) {
    const ator = S.jogadores[S.ator];
    const p = perso(ator.perso);
    let dobro = S.icone === p.forte || S.ajudante !== null;
    if (repetindo && efemero.resultado) {
      dobro = efemero.resultado.dados.length === 2;
      ator.estrelas = Math.max(0, ator.estrelas - 1);
    } else if (S.ajudante !== null) {
      const h = S.jogadores[S.ajudante];
      h.estrelas = Math.max(0, h.estrelas - 1);
    }
    efemero.semRolar = null;
    efemero.rolando = true;
    efemero.resultado = repetindo ? { ...efemero.resultado } : null;
    const atorIdx = S.ator, icone = S.icone;
    render();
    const ids = dobro ? ["d0", "d1"] : ["d0"];
    const tick = setInterval(() => ids.forEach((id) => { const el = document.getElementById(id); if (el) el.textContent = d6(); }), 80);
    setTimeout(() => {
      clearInterval(tick);
      const dados = ids.map(d6);
      const max = Math.max(...dados);
      efemero.rolando = false;
      efemero.resultado = { dados, usadoIdx: dados.indexOf(max), faixa: faixaDe(max), ator: atorIdx, icone };
      if (S.aba === "cena") forcarRender();
    }, 800);
  }

  const acoes = {
    nome(el) { S.jogadores[+el.dataset.i].nome = el.value; salvar(); },
    nota(el) { S.testes.notas[el.dataset.id] = el.value; salvar(); },
    check(el) { S.testes.checks[el.dataset.id] = el.checked; salvar(); },
    perso(el) { const j = S.jogadores[+el.dataset.i]; j.perso = el.dataset.id; j.trocando = false; },
    trocar(el) { S.jogadores[+el.dataset.i].trocando = true; },
    add() { if (S.jogadores.length < 3) S.jogadores.push(novoJogador()); },
    remover(el) { S.jogadores.splice(+el.dataset.i, 1); S.ator = 0; S.ajudante = null; },
    estrela(el) { const j = S.jogadores[+el.dataset.i]; j.estrelas = Math.max(0, j.estrelas + +el.dataset.d); },
    poder(el) { const j = S.jogadores[+el.dataset.i]; j.poderUsado = !j.poderUsado; },
    tonto(el) { const j = S.jogadores[+el.dataset.i]; j.tonto = el.dataset.fica ? true : !j.tonto; },
    comecar() {
      if (!S.inicio) { S.inicio = Date.now(); S.cenaInicio = Date.now(); S.cena = 0; S.log = []; }
      S.aba = "cena";
    },
    reiniciar() {
      if (!confirm("Recomeçar? As cenas e as Estrelas voltam ao início.")) return;
      S.inicio = null; S.cenaInicio = null; S.cena = 0; S.log = [];
      S.jogadores.forEach((j) => { j.estrelas = ESTRELAS_INICIAIS; j.poderUsado = false; j.tonto = false; });
      efemero = { rolando: false, resultado: null, semRolar: null, extra: {} };
    },
    ator(el) { S.ator = +el.dataset.i; S.ajudante = null; },
    icone(el) { S.icone = el.dataset.k; },
    ajudante(el) { S.ajudante = el.dataset.i === "" ? null : +el.dataset.i; },
    rolar() { if (S.icone) rolar(false); },
    repetir() { rolar(true); },
    semrolar() {
      efemero.resultado = null;
      efemero.semRolar = "Ação fácil ou só de brincar: a criança simplesmente consegue! Conte o que acontece e siga em frente.";
    },
    acertou() {
      const j = S.jogadores[S.ator]; if (j) j.estrelas++;
      efemero.resultado = null;
      efemero.semRolar = "Acertou! Passa sem rolar e ganha 1 ⭐. Pode seguir para a próxima cena.";
    },
    criativo() {
      const j = S.jogadores[S.ator]; if (j) j.estrelas++;
      efemero.semRolar = `+1 ⭐ para ${nomeDe(j, S.ator)}! Ideia criativa, gentileza ou risada merecem uma Estrela.`;
    },
    venda() {
      S.jogadores.forEach((j) => { if (j.perso) j.estrelas++; });
      efemero.extra[S.cena] = true;
    },
    proxima() {
      fecharCena(); S.cena++; limparRolagem();
      S.jogadores.forEach((j) => { j.tonto = false; }); // "tonto" passa na próxima cena
      window.scrollTo(0, 0);
    },
    voltar() { S.cena--; limparRolagem(); window.scrollTo(0, 0); },
    final() { if (!efemero.fim) fecharCena(); efemero.fim = true; setTimeout(() => window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" }), 50); },
    "limpar-testes"() {
      if (confirm("Apagar todas as anotações e marcações dos testes?")) S.testes = { checks: {}, notas: { t1: "", t2: "" } };
    },
    copiar() {
      let t = `Relatório — ${AVENTURA.titulo}\n`;
      if (S.log.length) t += "\nTempo por cena:\n" + S.log.map((l) => `- ${l.titulo}: ${fmt(l.ms)}`).join("\n") + "\n";
      ROTEIRO_TESTE.forEach((b) => {
        t += `\n${b.titulo}\n` + b.itens.map((it, k) => `[${S.testes.checks[`${b.id}-${k}`] ? "x" : " "}] ${it}`).join("\n");
        if (S.testes.notas[b.id]) t += `\nNotas: ${S.testes.notas[b.id]}`;
        t += "\n";
      });
      const msg = () => { const m = document.getElementById("msg-copia"); if (m) m.textContent = "Relatório copiado ✔"; };
      (navigator.clipboard ? navigator.clipboard.writeText(t).then(msg) : Promise.reject()).catch(() => {
        const ta = document.createElement("textarea"); ta.value = t; document.body.appendChild(ta); ta.select();
        try { document.execCommand("copy"); msg(); } catch (e) {} ta.remove();
      });
      return "semrender";
    },
  };

  $app.addEventListener("click", (e) => {
    const el = e.target.closest("[data-act]");
    if (!el || el.tagName === "INPUT" || el.tagName === "TEXTAREA") return;
    const fn = acoes[el.dataset.act];
    if (fn && fn(el) !== "semrender") forcarRender();
  });
  $app.addEventListener("input", (e) => {
    const el = e.target.closest("[data-act]");
    if (!el) return;
    if (el.dataset.act === "nome" || el.dataset.act === "nota") acoes[el.dataset.act](el);
  });
  $app.addEventListener("change", (e) => {
    const el = e.target.closest("[data-act]");
    if (el && el.dataset.act === "check") acoes.check(el);
  });
  $abas.addEventListener("click", (e) => {
    const b = e.target.closest("button");
    if (!b) return;
    S.aba = b.dataset.aba; forcarRender(); window.scrollTo(0, 0);
  });

  setInterval(() => {
    $timer.textContent = S.inicio ? `⏱️ ${fmt(Date.now() - S.inicio)}` : "";
  }, 1000);

  if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
    navigator.serviceWorker.register("sw.js").catch(() => {});
  }
  render();
})();

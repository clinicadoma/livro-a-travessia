const urlBase = "https://clinicadoma.github.io/livro-a-travessia";
window.modulos = [];
let moduloAtual = 0;
let moedasTotais = parseInt(localStorage.getItem('doma_coins')) || 0;

const elCoins = document.getElementById('doma-coins-valor');
if (elCoins) elCoins.innerText = moedasTotais;

async function iniciarSistema() {
    const palco = document.getElementById('palco-doma');
    
    const cssLink = document.createElement("link");
    cssLink.rel = "stylesheet";
    cssLink.href = `${urlBase}/estilos.css?v=${new Date().getTime()}`;
    document.head.appendChild(cssLink);

    try {
        const res = await fetch(`${urlBase}/mapa.json?v=${new Date().getTime()}`);
        const config = await res.json();
        window.modulos = config.modulos;
        injetarModulo(moduloAtual);
    } catch (error) {
        palco.innerHTML = '<div class="loading-doma" style="text-align:center; margin-top: 40vh;">Erro ao carregar o mapa. Atualize a página.</div>';
    }
}

async function injetarModulo(index) {
    const palco = document.getElementById('palco-doma');
    palco.innerHTML = '<div class="loading-doma" style="text-align:center; margin-top: 40vh; color:#ea580c; font-weight:bold; font-family:sans-serif;">Avançando...</div>';
    
    try {
        const response = await fetch(`${urlBase}/${window.modulos[index]}?v=${new Date().getTime()}`);
        const html = await response.text();
        palco.innerHTML = html;
        window.scrollTo(0, 0);

        // RASTREADOR DE PROGRESSO (Desbloqueia o Sumário)
        let maxPag = parseInt(localStorage.getItem('doma_max_pagina')) || 0;
        if (index > maxPag) {
            localStorage.setItem('doma_max_pagina', index);
        }

        const scripts = palco.querySelectorAll('script');
        scripts.forEach(oldScript => {
            const newScript = document.createElement('script');
            Array.from(oldScript.attributes).forEach(attr => newScript.setAttribute(attr.name, attr.value));
            newScript.appendChild(document.createTextNode(oldScript.innerHTML));
            oldScript.parentNode.replaceChild(newScript, oldScript);
        });
    } catch (error) {
        palco.innerHTML = '<div class="loading-doma" style="text-align:center; margin-top: 40vh;">Houve uma oscilação na conexão.</div>';
    }
}

window.mudarPagina = function(direcao) {
    let proximoIndex = moduloAtual + direcao;
    if (proximoIndex >= 0 && proximoIndex < window.modulos.length) {
        moduloAtual = proximoIndex;
        injetarModulo(moduloAtual);
    }
};

window.irParaModulo = function(index) {
    let maxPag = parseInt(localStorage.getItem('doma_max_pagina')) || 0;
    if (index >= 0 && index < window.modulos.length && index <= maxPag) {
        moduloAtual = index;
        injetarModulo(moduloAtual);
    }
};

// ==========================================
// O TRADUTOR DO SUMÁRIO (NOVA FUNÇÃO)
// ==========================================
// Como não temos mais todas as telas no DOM ao mesmo tempo, 
// o irParaTela converte o ID clicado (ex: 'pag-5') no Índice real do seu mapa.json (ex: 4).
// IMPORTANTE: Ajuste os números abaixo para baterem com a ordem exata dos arquivos no seu mapa.json (Lembrando que começa no 0)
const dicionarioDeTelas = {
    'pag-3': 4,               // Boas Vindas
    'pag-5': 6,               // Economia Doma
    'pag-7': 7,               // O Monstrinho Interno
    'pag-8': 8,               // A Travessia
    'pag-10': 9,              // Imersão Total
    'pag-proximo-nivel': 10,   // O Próximo Nível
    'pag-mapa-final': 10,      // O Mapa da Travessia
    'pag-roleta': 11,          // Roleta de Boas Vindas
    'pag-capitulo-1': 12,      // O Acolhimento
    'pag-mecanica-mente': 13, // Mecânica da Mente
    'pag-intro-darkmode': 14, // Laboratório
    'pag-26': 15,             // O Papel de Pão
    'slide-intro-1': 16,      // Triagem
    'pag-25-b': 17,           // Quem é o Domador
    'pag-bagagem-domador': 18,// Bagagem do Domador
    'acendendo-lanterna': 19, // Acendendo a Lanterna
    'roleta_interna': 20,     // Roleta Interna
    'pag-polvo': 21,          // Acolhendo o Polvo
    'superpoder': 22,         // O Superpoder
    'malabarista': 23,        // Malabarista
    'aliviando-mochila': 24,  // Aliviando a Mochila
    'espelho-restaura': 25,   // Espelho Restaura
    'ponte-cristal': 26,      // Ponte Cristal
    'checkin-ouro': 27,       // Check-in Ouro
    'jogo-verdade': 28,       // Jogo da Verdade
    'pag-diagnostico-profundo': 29, 
    'pag-tribunal-intro': 30, 
    'quem-voz': 31,           
    'retrato-falado': 32,     
    'resgate-crianca': 33,    
    'pag-tesouro': 34,        
    'loja-discos': 35,        
    'pag-jogo-insights': 36,  
    'pag-72': 37              // Final
};

window.irParaTela = function(idAlvo) {
    let maxPag = parseInt(localStorage.getItem('doma_max_pagina')) || 0;
    let isPremium = localStorage.getItem('acesso_vip_doma_liberado') === 'true';
    
    // Descobre qual é o número da página baseada no ID clicado
    let alvoIndex = dicionarioDeTelas[idAlvo];
    
    if (alvoIndex === undefined) {
        console.warn("Tela não mapeada no dicionário do motor.js: " + idAlvo);
        return;
    }

    // TRAVA JAVASCRIPT: Impede clicar em itens não alcançados (exceto os que sempre ficam livres)
    if (idAlvo !== 'pag-3' && idAlvo !== 'pag-roleta' && alvoIndex > maxPag) {
        return; 
    }

    // Chama o seu próprio sistema modular para carregar a página
    window.irParaModulo(alvoIndex);
};

window.ganharMoedas = function(quantidade, eventoClick = null) {
    if(quantidade <= 0) return;
    moedasTotais += quantidade;
    localStorage.setItem('doma_coins', moedasTotais);
    
    const elCoins = document.getElementById('doma-coins-valor');
    if (elCoins) elCoins.innerText = moedasTotais;

    const sMoeda = document.getElementById('S_MOEDA');
    if(sMoeda) { sMoeda.currentTime = 0; sMoeda.play().catch(e=>{}); }

    let posX = window.innerWidth / 2;
    let posY = window.innerHeight / 2;

    if(eventoClick && eventoClick.clientX) {
        posX = eventoClick.clientX;
        posY = eventoClick.clientY;
    }

    const animText = document.createElement('div');
    animText.className = 'texto-moeda-voadora';
    animText.innerText = '+' + quantidade;
    animText.style.left = (posX - 20) + 'px';
    animText.style.top = (posY - 20) + 'px';
    document.body.appendChild(animText);

    const carteira = document.getElementById('carteira-ui');
    if(carteira) carteira.classList.add('carteira-pulse');
    
    setTimeout(() => { 
        animText.remove(); 
        if(carteira) carteira.classList.remove('carteira-pulse');
    }, 1500);
};

window.fecharModal = function() {
    const overlay = document.getElementById('domaModal');
    const box = document.getElementById('domaModalBox');
    if(!overlay) return;
    overlay.style.opacity = '0';
    box.style.transform = 'scale(0.8)';
    setTimeout(() => { overlay.style.display = 'none'; }, 300);
};

window.abrirModalDoma = function(titulo, texto, tipo, acaoAposFechar = null) {
    const overlay = document.getElementById('domaModal');
    const box = document.getElementById('domaModalBox');
    const tit = document.getElementById('domaModalTitulo');
    const txt = document.getElementById('domaModalTexto');
    const img = document.getElementById('domaModalImg');
    const btnOk = document.querySelector('.doma-modal-btn'); 

    if (!overlay) return;

    if (tipo === 'sucesso') {
        img.src = 'https://i.postimg.cc/cHCq7BvW/autoestisma.png'; img.style.borderColor = '#10b981'; tit.style.color = '#047857';
    } else if (tipo === 'amor') {
        img.src = 'https://i.postimg.cc/ht0PpMtg/amor-proprio.png'; img.style.borderColor = '#be185d'; tit.style.color = '#be185d';
    } else if (tipo === 'alerta') {
        img.src = 'https://i.postimg.cc/7LxrhkDv/ansiedade.png'; img.style.borderColor = '#e11d48'; tit.style.color = '#be123c';
    } else {
        img.src = 'https://i.postimg.cc/HLGxyf9V/Captura-de-tela-2025-09-27-133248.png'; img.style.borderColor = '#f59e0b'; tit.style.color = '#b45309';
    }

    tit.innerText = titulo; txt.innerHTML = texto || "";
    
    btnOk.onclick = function() {
        window.fecharModal();
        if (acaoAposFechar) setTimeout(acaoAposFechar, 350); 
    };
    
    overlay.style.display = 'flex';
    setTimeout(() => { overlay.style.opacity = '1'; box.style.transform = 'scale(1)'; }, 10);
};

window.isCoerente = function(texto) {
    let txt = texto.trim().toLowerCase();
    if (txt.length < 4) return false; 
    let vogais = txt.match(/[aeiouáéíóúãõâêô]/g);
    if (!vogais || vogais.length === 0) return false; 
    if (/(.)\1{4,}/.test(txt)) return false; 
    if (/[bcdfghjklmnpqrstvwxyz]{5,}/.test(txt)) return false; 
    if (txt.length > 15 && txt.indexOf(' ') === -1) return false; 
    return true;
};

window.processarFormulario = function(idsArray, taskId, moedasVal, modalTit, modalTxt, modalTipo, pagAvanco) {
    let todosVazios = true;
    let incoerente = false;

    for(let id of idsArray) {
        let el = document.getElementById(id);
        if(el && el.value.trim() !== '') {
            todosVazios = false;
            if(!window.isCoerente(el.value)) incoerente = true;
        }
    }

    if(todosVazios) {
        window.abrirModalDoma('🚨 EM BRANCO!', 'Por favor, escreva algo antes de validar. Não fuja do exercício!', 'alerta');
        return;
    }

    if(incoerente) {
        window.abrirModalDoma('🚨 CONCENTRE-SE!', 'O texto digitado não parece fazer sentido. Por favor, respire, concentre-se e escreva palavras reais. A fuga alimenta o monstro.', 'alerta');
        return;
    }

    let jaGanhou = localStorage.getItem('doma_task_' + taskId);
    if(!jaGanhou) {
        if (window.ganharMoedas) window.ganharMoedas(moedasVal, null);
        localStorage.setItem('doma_task_' + taskId, 'true');
    }

    window.abrirModalDoma(modalTit, modalTxt, modalTipo, function(){
        if(pagAvanco !== null) window.mudarPagina(pagAvanco);
    });
};

iniciarSistema();

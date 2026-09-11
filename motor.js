const urlBase = "https://clinicadoma.github.io/livro-a-travessia";
let modulos = [];
let moduloAtual = 0;
let moedasTotais = parseInt(localStorage.getItem('doma_coins')) || 0;

// Atualiza a carteira na tela logo ao carregar
const elCoins = document.getElementById('doma-coins-valor');
if (elCoins) elCoins.innerText = moedasTotais;

async function iniciarSistema() {
    const palco = document.getElementById('palco-doma');
    
    // 1. Injeta os estilos dinamicamente sem cache
    const cssLink = document.createElement("link");
    cssLink.rel = "stylesheet";
    cssLink.href = `${urlBase}/estilos.css?v=${new Date().getTime()}`;
    document.head.appendChild(cssLink);

    // 2. Lê o mapa de slides
    try {
        const res = await fetch(`${urlBase}/mapa.json?v=${new Date().getTime()}`);
        const config = await res.json();
        modulos = config.modulos;
        injetarModulo(moduloAtual);
    } catch (error) {
        palco.innerHTML = '<div class="loading-doma" style="text-align:center; margin-top: 40vh;">Erro ao carregar o mapa. Atualize a página.</div>';
    }
}

async function injetarModulo(index) {
    const palco = document.getElementById('palco-doma');
    palco.innerHTML = '<div class="loading-doma" style="text-align:center; margin-top: 40vh; color:#ea580c; font-weight:bold; font-family:sans-serif;">Avançando...</div>';
    
    try {
        const response = await fetch(`${urlBase}/${modulos[index]}?v=${new Date().getTime()}`);
        const html = await response.text();
        palco.innerHTML = html;
        window.scrollTo(0, 0);

        // 3. RECRIADOR DE SCRIPTS (Vital para a Roleta e Jogos funcionarem)
        // Navegadores bloqueiam <script> injetados via innerHTML. Isso recria e executa as funções ativamente.
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

// Funções Globais expostas para a interface
window.mudarPagina = function(direcao) {
    let proximoIndex = moduloAtual + direcao;
    if (proximoIndex >= 0 && proximoIndex < modulos.length) {
        moduloAtual = proximoIndex;
        injetarModulo(moduloAtual);
    }
};

window.ganharMoedas = function(qtd, event) {
    moedasTotais += qtd;
    localStorage.setItem('doma_coins', moedasTotais);
    const elCoins = document.getElementById('doma-coins-valor');
    if (elCoins) elCoins.innerText = moedasTotais;
};

// Dá a partida no sistema
iniciarSistema();

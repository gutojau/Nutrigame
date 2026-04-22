/**
 * PEQUENO CHEF - FASE 1: O MERCADO
 * Objetivo: Ensinar a identificação de alimentos e matemática básica (compra).
 */

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Configuração do tamanho do Canvas (proporcional à imagem gerada)
canvas.width = 1152;
canvas.height = 648;

// ESTADO DO JOGO
let money = 50;
let points = 0;
let inventory = [];

// DICIONÁRIO DE ASSETS
const images = {};
const assetsLoaded = { fundo: false };

/**
 * Carrega a imagem do cenário que contém prateleiras e alimentos integrados
 */
function loadAssets() {
    images.fundo_mercado = new Image();
    // Certifica-te que guardaste a imagem gerada como 'cenario_fase1.png' em assets/img/
    images.fundo_mercado.src = 'assets/img/cenario_fase1.png'; 
    
    images.fundo_mercado.onload = () => {
        assetsLoaded.fundo = true;
        console.log("Cenário carregado com sucesso!");
    };
}

/**
 * MAPEAMENTO DE ÁREAS DE CLIQUE (Coordenadas baseadas na imagem 1152x648)
 * Cada item possui uma "caixa invisível" sobre a posição dele na prateleira.
 */
const shelfItems = [
    { 
        id: 1, name: 'Maçã', price: 2, points: 10, 
        clickX: 250, clickY: 400, radius: 60 
    },
    { 
        id: 2, name: 'Brócolis', price: 3, points: 15, 
        clickX: 430, clickY: 400, radius: 60 
    },
    { 
        id: 3, name: 'Frango', price: 12, points: 25, 
        clickX: 580, clickY: 420, radius: 70 
    },
    { 
        id: 4, name: 'Ovos', price: 5, points: 12, 
        clickX: 740, clickY: 420, radius: 60 
    }
];

/**
 * DESENHO PRINCIPAL
 */
function draw() {
    // 1. Desenha o fundo completo (Cenário + Itens + Preços já estão na imagem)
    if (assetsLoaded.fundo) {
        ctx.drawImage(images.fundo_mercado, 0, 0, canvas.width, canvas.height);
    } else {
        // Fallback enquanto carrega
        ctx.fillStyle = "#e0f7fa";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "#000";
        ctx.fillText("A carregar mercado...", canvas.width/2 - 50, canvas.height/2);
    }

    // 2. Feedback Visual: Desenhar um "X" ou transparência sobre itens já comprados
    inventory.forEach(boughtItem => {
        ctx.fillStyle = "rgba(255, 255, 255, 0.6)"; // Efeito de item "esgotado"
        ctx.beginPath();
        ctx.arc(boughtItem.clickX, boughtItem.clickY, boughtItem.radius, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = "red";
        ctx.font = "bold 40px Arial";
        ctx.textAlign = "center";
        ctx.fillText("OK", boughtItem.clickX, boughtItem.clickY + 15);
    });
}

/**
 * LÓGICA DE INTERAÇÃO (CLIQUE/TOQUE)
 */
canvas.addEventListener('mousedown', (e) => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    shelfItems.forEach((item, index) => {
        // Verifica se o item já foi comprado
        const isBought = inventory.some(i => i.id === item.id);
        if (isBought) return;

        // Cálculo de distância para clique circular
        const dist = Math.sqrt((mouseX - item.clickX) ** 2 + (mouseY - item.clickY) ** 2);
        
        if (dist < item.radius) {
            processPurchase(item);
        }
    });
});

/**
 * PROCESSA A COMPRA
 */
function processPurchase(item) {
    if (money >= item.price) {
        money -= item.price;
        points += item.points;
        inventory.push(item);
        
        // Atualiza a Interface (HTML)
        document.getElementById('money').innerText = money;
        document.getElementById('points').innerText = points;
        document.getElementById('message').innerText = `Boa escolha! Compraste ${item.name}! 😋`;
        document.getElementById('message').style.color = "#27ae60";

        // Verifica se todos os itens foram comprados
        if (inventory.length === shelfItems.length) {
            document.getElementById('message').innerText = "Excelente! Carrinho cheio. Vamos arrumar a geladeira? ➔";
            document.getElementById('message').style.fontWeight = "bold";
        }
    } else {
        document.getElementById('message').innerText = "Ops! Não tens dinheiro suficiente para este item. 😟";
        document.getElementById('message').style.color = "#e74c3c";
    }
}

/**
 * GAME LOOP
 */
function gameLoop() {
    draw();
    requestAnimationFrame(gameLoop);
}

// INICIALIZAÇÃO
loadAssets();
gameLoop();
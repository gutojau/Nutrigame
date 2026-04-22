/**
 * PEQUENO CHEF - FASE 1: O MERCADO (RESPONSIVO PARA TABLET)
 */

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Definição da resolução nativa da imagem de fundo (proporção 16:9)
const NATIVE_WIDTH = 1152;
const NATIVE_HEIGHT = 648;

// Estado do Jogo
let money = 50;
let points = 0;
let inventory = [];

// Gerenciador de Assets
const images = {};
let assetLoaded = false;

function loadAssets() {
    images.fundo_mercado = new Image();
    // Use o nome do arquivo gerado aqui, salvo em assets/img/
    images.fundo_mercado.src = 'assets/img/image_2.png'; 
    
    images.fundo_mercado.onload = () => {
        assetLoaded = true;
        resizeCanvas(); // Ajusta o Canvas assim que a imagem carregar
    };
}

/**
 * MAPEAMENTO DE ÁREAS DE CLIQUE PERCENTUAIS
 * x_p e y_p: Posição central em % da largura/altura nativa (0-100)
 * r_p: Raio do clique em % da largura nativa.
 */
const shelfItems = [
    { 
        id: 1, name: 'Frango', price: 2, points: 10, isHealthy: true,
        x_p: 28.0, y_p: 41.0, r_p: 6.0 
    },
    { 
        id: 2, name: 'Maça', price: 12, points: 25, isHealthy: true,
        x_p: 62.0, y_p: 43.0, r_p: 7.5 
    },
      { 
        id: 3, name: 'Doces', price: 5, points: -15, isHealthy: false, // Item Errado
        x_p: 46.0, y_p: 43.0, r_p: 6.5
    },
    { 
        id: 4, name: 'Ovos', price: 5, points: 12, isHealthy: true,
        x_p: 78.0, y_p: 43.0, r_p: 6.0 
    }
];

/**
 * Ajusta o tamanho interno do Canvas para corresponder ao tamanho exibido pelo CSS.
 * Isso garante que as coordenadas de clique em pixels coincidam.
 */
function resizeCanvas() {
    // Mantém a proporção nativa
    const aspectRatio = NATIVE_WIDTH / NATIVE_HEIGHT;
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.width / aspectRatio;
}

// Redimensiona o Canvas sempre que a janela mudar (importante para rotação de tablet)
window.addEventListener('resize', resizeCanvas);

/**
 * DESENHO PRINCIPAL (Sincronizado com o tamanho atual)
 */
function draw() {
    if (!assetLoaded) {
        ctx.fillStyle = "#e0f7fa";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        return;
    }

    // 1. Desenha o fundo completo (Cenário responsivo)
    ctx.drawImage(images.fundo_mercado, 0, 0, canvas.width, canvas.height);

    // 2. Feedback Visual: Item Comprado ou Errado
    inventory.forEach(boughtItem => {
        // Converte coordenadas percentuais para pixels atuais
        const currentX = (boughtItem.x_p / 100) * canvas.width;
        const currentY = (boughtItem.y_p / 100) * canvas.height;
        const currentRadius = (boughtItem.r_p / 100) * canvas.width;

        if (boughtItem.isHealthy) {
            ctx.fillStyle = "rgba(255, 255, 255, 0.7)"; // Efeito "OK"
            ctx.beginPath();
            ctx.arc(currentX, currentY, currentRadius, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.fillStyle = "#27ae60";
            ctx.font = `bold ${canvas.width * 0.03}px Fredoka One`; // Fonte responsiva
            ctx.textAlign = "center";
            ctx.fillText("OK", currentX, currentY + (canvas.width * 0.01));
        } else {
            // Se tentou comprar o doce
            ctx.fillStyle = "rgba(255, 0, 0, 0.5)"; // Efeito "Erro"
            ctx.beginPath();
            ctx.arc(currentX, currentY, currentRadius, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.fillStyle = "white";
            ctx.font = `bold ${canvas.width * 0.04}px Arial`;
            ctx.textAlign = "center";
            ctx.fillText("👎", currentX, currentY + (canvas.width * 0.015));
        }
    });
}

/**
 * LÓGICA DE INTERAÇÃO (Adicionado suporte a toque para tablet)
 */
canvas.addEventListener('mousedown', handleInteraction);
canvas.addEventListener('touchstart', (e) => {
    e.preventDefault(); // Impede o clique do mouse simulado
    handleInteraction(e.touches[0]);
});

function handleInteraction(e) {
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    shelfItems.forEach((item) => {
        // Verifica se o item já foi interagido
        const isBought = inventory.some(i => i.id === item.id);
        if (isBought) return;

        // Converte coordenadas PERCENTUAIS do item para PIXELS atuais do Canvas
        const currentX = (item.x_p / 100) * canvas.width;
        const currentY = (item.y_p / 100) * canvas.height;
        const currentRadius = (item.r_p / 100) * canvas.width;

        // Cálculo de distância para clique circular
        const dist = Math.sqrt((mouseX - currentX) ** 2 + (mouseY - currentY) ** 2);
        
        if (dist < currentRadius) {
            processAction(item);
        }
    });
}

/**
 * PROCESSA A AÇÃO DO JOGADOR
 */
function processAction(item) {
    if (item.isHealthy) {
        if (money >= item.price) {
            money -= item.price;
            points += item.points;
            inventory.push(item);
            
            // Atualiza UI
            document.getElementById('money').innerText = money;
            document.getElementById('points').innerText = points;
            document.getElementById('message').innerText = `Boa escolha! Compraste ${item.name}! 😋`;
            document.getElementById('message').style.color = "#27ae60";

            // Verifica se todos os itens SAUDÁVEIS foram comprados
            const healthyItems = shelfItems.filter(i => i.isHealthy);
            const boughtHealthy = inventory.filter(i => i.isHealthy);
            
            if (boughtHealthy.length === healthyItems.length) {
                document.getElementById('message').innerText = "Excelente! Carrinho cheio. Vamos arrumar a geladeira? ➔";
                document.getElementById('message').style.fontWeight = "bold";
            }
        } else {
            document.getElementById('message').innerText = "Ops! Não tens dinheiro suficiente. 😟";
            document.getElementById('message').style.color = "#e74c3c";
        }
    } else {
        // Clicou nos doces
        points += item.points; // Perde pontos
        inventory.push(item); // Marca como interagido (para o feedback visual)
        document.getElementById('points').innerText = points;
        document.getElementById('message').innerText = `Doces não têm muitos nutrientes! Perdestes pontos. 😟`;
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

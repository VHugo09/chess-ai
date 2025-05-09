let board = null;
let gameState = null;

// Atualiza o estado do tabuleiro com a API
function atualizarEstado() {
    fetch('http://127.0.0.1:5000/estado')
        .then(response => response.json())
        .then(data => {
            gameState = data;
            board.position(data.fen)
             document.getElementById("vez").innerText = `Vez: ${data.turno}`;
        });
}

function atualizarVez() {
  fetch("http://127.0.0.1:5000/estado")
    .then((res) => res.json())
    .then((data) => {
      document.getElementById("vez").innerText = `Vez: ${data.vez}`;
    });
}

// Remove destaques de quadrados
function removerDestaques() {
    $('#board .square-55d63').removeClass('highlight');
}

// Destaca quadrados com base nos movimentos válidos
function destacarQuadrados(destinos) {
  removerDestaques();  // Remove quaisquer destaques anteriores
  destinos.forEach(dest => {
      // Destaca cada quadrado válido
      $('#board .square-' + dest).addClass('highlight');
  });
}


// Obtém os movimentos válidos para a peça clicada
function obterMovimentosValidos(origem) {
    const movimentos = [];
    if (!gameState || !gameState.movimentos_validos) return movimentos;

    for (const mov of gameState.movimentos_validos) {
        if (mov.startsWith(origem)) {
            movimentos.push(mov.substring(2, 4));
        }
    }
    return movimentos;
}

// Lida com o movimento feito no frontend
function aoMover(source, target) {
    removerDestaques();  // limpa destaques
    const movimento = source + target;

    fetch('http://127.0.0.1:5000/mover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ movimento })
    })
    .then(response => response.json())
    .then(data => {
        if (data.sucesso) {
            atualizarEstado();
        } else {
            alert("Movimento inválido!");
            board.position(gameState.fen);
        }
    });
}

// Inicializa o tabuleiro
document.addEventListener('DOMContentLoaded', () => {
  board = Chessboard('board', {
      draggable: true,
      pieceTheme: './img/chesspieces/wikipedia/{piece}.png',
      position: 'start',

      onClick: (square) => {
          // Obtém os movimentos válidos para a peça que está sendo clicada
          const movimentos = obterMovimentosValidos(square);
          if (movimentos.length > 0) {
              // Destaca os quadrados válidos para a peça clicada
              destacarQuadrados(movimentos);
          } else {
              // Caso o clique não tenha movimentos válidos, remover os destaques
              removerDestaques();
          }
      },

      onDragStart: (source) => {
          const movimentos = obterMovimentosValidos(source);
          destacarQuadrados(movimentos);  // Destaca os movimentos válidos ao arrastar
      },

      onDrop: (source, target) => {
          aoMover(source, target);  // Envia o movimento para o backend
      }
  });

  // Atualiza o estado inicial do jogo
  atualizarEstado();
});

// Função para obter os movimentos válidos para a peça clicada
function obterMovimentosValidos(origem) {
  const movimentos = [];
  if (!gameState || !gameState.legal_moves) return movimentos;

  // Filtra os movimentos válidos que começam a partir da posição 'origem'
  gameState.legal_moves.forEach(mov => {
      if (mov.startsWith(origem)) {
          movimentos.push(mov.substring(2, 4));  // Retorna apenas o destino do movimento
      }
  });

  return movimentos;
}

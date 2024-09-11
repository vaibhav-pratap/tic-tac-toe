let currentPlayer = 'X';
let gameActive = true;
let gameMode = 'pvp'; // Default game mode
let board = Array(9).fill(null);
let player1Score = 0;
let player2Score = 0;

const player1ScoreElement = document.getElementById('player1-score');
const player2ScoreElement = document.getElementById('player2-score');
const gameStatusElement = document.getElementById('game-status');
const cells = document.querySelectorAll('.cell');
const resetButton = document.getElementById('reset');
const restartButton = document.getElementById('restart');

const winConditions = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
];

// Game mode selection
document.getElementById('pvp').addEventListener('click', () => startGame('pvp'));
document.getElementById('pve-easy').addEventListener('click', () => startGame('pve-easy'));
document.getElementById('pve-hard').addEventListener('click', () => startGame('pve-hard'));
document.getElementById('ai-vs-ai').addEventListener('click', () => startGame('ai-vs-ai'));

cells.forEach(cell => {
    cell.addEventListener('click', handleCellClick);
});

resetButton.addEventListener('click', resetGame);
restartButton.addEventListener('click', resetScore);

function handleCellClick(event) {
    const index = event.target.getAttribute('data-index');
    if (board[index] !== null || !gameActive) return;

    // Player's move
    board[index] = currentPlayer;
    event.target.textContent = currentPlayer;
    checkForWinner();

    if (gameMode === 'pvp') {
        // Player vs Player mode - switch turn
        currentPlayer = currentPlayer === 'X' ? 'O' : 'X'; 
    } else if (gameMode === 'pve-easy' || gameMode === 'pve-hard') {
        // After player's move, AI plays next
        currentPlayer = 'O'; 
        if (gameActive) aiMove(gameMode === 'pve-easy' ? 'easy' : 'hard');
    }
}

function checkForWinner() {
    let roundWon = false;
    for (let condition of winConditions) {
        const [a, b, c] = condition;
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            roundWon = true;
            break;
        }
    }
    if (roundWon) {
        // Announce winner and update scores
        gameStatusElement.textContent = `${currentPlayer} has won!`;
        updateScores(currentPlayer);
        gameActive = false;
        return;
    }
    if (!board.includes(null)) {
        // If the board is full and no winner, it's a draw
        gameStatusElement.textContent = "It's a draw!";
        gameActive = false;
        return;
    }
}

function updateScores(winner) {
    if (winner === 'X') {
        player1Score++;
        player1ScoreElement.textContent = player1Score;
    } else {
        player2Score++;
        player2ScoreElement.textContent = player2Score;
    }
}

function resetGame() {
    // Reset the board and game state
    board.fill(null);
    cells.forEach(cell => (cell.textContent = ''));
    gameActive = true;
    gameStatusElement.textContent = "Game Reset. Let's Play!";
    currentPlayer = 'X'; 
}

function resetScore() {
    // Reset scores and board
    resetGame();
    player1Score = 0;
    player2Score = 0;
    player1ScoreElement.textContent = player1Score;
    player2ScoreElement.textContent = player2Score;
}

function startGame(mode) {
    // Initialize game based on selected mode
    resetGame();
    gameMode = mode;
    gameStatusElement.textContent = `Starting game mode: ${mode.toUpperCase()}`;

    if (mode === 'ai-vs-ai') {
        currentPlayer = 'X';
        gameActive = true;
        aiMove('easy'); // Start AI vs AI mode
    }
}

function aiMove(difficulty) {
    // AI makes a move based on the selected difficulty
    setTimeout(() => {
        let availableMoves = board.map((cell, index) => (cell === null ? index : null)).filter(index => index !== null);

        let chosenMove;
        if (difficulty === 'easy') {
            // Easy mode: AI has a 70% chance of blocking the player and 30% chance to make random move
            if (Math.random() > 0.3) {
                chosenMove = findBestBlockingMove('X', 'O');
            } else {
                chosenMove = availableMoves[Math.floor(Math.random() * availableMoves.length)];
            }
        } else if (difficulty === 'hard') {
            // Hard mode: 90% chance to use minimax, 10% chance to make random move
            if (Math.random() > 0.1) {
                chosenMove = minimax(board, 'O').index;
            } else {
                chosenMove = availableMoves[Math.floor(Math.random() * availableMoves.length)];
            }
        }

        if (chosenMove !== undefined) {
            // AI makes the move
            board[chosenMove] = currentPlayer;
            document.querySelector(`.cell[data-index='${chosenMove}']`).textContent = currentPlayer;
            checkForWinner();

            if (gameMode === 'ai-vs-ai' && gameActive) {
                // Continue AI vs AI turns
                currentPlayer = currentPlayer === 'X' ? 'O' : 'X'; 
                aiMove('easy');
            } else {
                currentPlayer = 'X'; // Back to player's turn
            }
        }
    }, 500); // Delay for AI move to make it seem natural
}

function findBestBlockingMove(player, ai) {
    // AI attempts to block player's winning move
    for (let condition of winConditions) {
        const [a, b, c] = condition;
        if (board[a] === player && board[b] === player && board[c] === null) return c;
        if (board[a] === player && board[c] === player && board[b] === null) return b;
        if (board[b] === player && board[c] === player && board[a] === null) return a;
    }
    // If no immediate threat, return the first available move
    return board.map((cell, index) => (cell === null ? index : null)).filter(index => index !== null)[0];
}

// Minimax algorithm for Hard mode
function minimax(newBoard, player) {
    const availableSpots = newBoard.map((cell, index) => (cell === null ? index : null)).filter(index => index !== null);

    const winner = checkWinner(newBoard);
    if (winner === 'X') return { score: -10 };
    if (winner === 'O') return { score: 10 };
    if (availableSpots.length === 0) return { score: 0 };

    const moves = [];
    for (let i = 0; i < availableSpots.length; i++) {
        const move = {};
        move.index = availableSpots[i];
        newBoard[availableSpots[i]] = player;

        if (player === 'O') {
            const result = minimax(newBoard, 'X');
            move.score = result.score;
        } else {
            const result = minimax(newBoard, 'O');
            move.score = result.score;
        }

        newBoard[availableSpots[i]] = null; // Reset spot
        moves.push(move);
    }

    let bestMove;
    if (player === 'O') {
        let bestScore = -Infinity;
        for (let i = 0; i < moves.length; i++) {
            if (moves[i].score > bestScore) {
                bestScore = moves[i].score;
                bestMove = moves[i];
            }
        }
    } else {
        let bestScore = Infinity;
        for (let i = 0; i < moves.length; i++) {
            if (moves[i].score < bestScore) {
                bestScore = moves[i].score;
                bestMove = moves[i];
            }
        }
    }

    return bestMove;
}

// Helper function to check winner for minimax
function checkWinner(board) {
    for (let condition of winConditions) {
        const [a, b, c] = condition;
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            return board[a];
        }
    }
    return null;
}

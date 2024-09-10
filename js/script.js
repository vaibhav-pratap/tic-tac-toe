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
        currentPlayer = currentPlayer === 'X' ? 'O' : 'X'; // Switch player
    } else if (gameMode === 'pve-easy' || gameMode === 'pve-hard') {
        currentPlayer = 'O'; // AI's turn
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
        gameStatusElement.textContent = `${currentPlayer} has won!`;
        updateScores(currentPlayer);
        gameActive = false;
        return;
    }
    if (!board.includes(null)) {
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
    board.fill(null);
    cells.forEach(cell => (cell.textContent = ''));
    gameActive = true;
    gameStatusElement.textContent = "Game Reset. Let's Play!";
    currentPlayer = 'X';
}

function resetScore() {
    resetGame();
    player1Score = 0;
    player2Score = 0;
    player1ScoreElement.textContent = player1Score;
    player2ScoreElement.textContent = player2Score;
}

function startGame(mode) {
    resetGame();
    gameMode = mode;
    gameStatusElement.textContent = `Starting game mode: ${mode.toUpperCase()}`;

    if (mode === 'ai-vs-ai') {
        currentPlayer = 'X';
        gameActive = true;
        aiMove('easy');
    }
}

function aiMove(difficulty) {
    setTimeout(() => {
        let availableMoves = board.map((cell, index) => (cell === null ? index : null)).filter(index => index !== null);

        let chosenMove;
        if (difficulty === 'easy') {
            chosenMove = availableMoves[Math.floor(Math.random() * availableMoves.length)];
        } else if (difficulty === 'hard') {
            // Minimax implementation for hard difficulty
            chosenMove = minimax(board, 'O').index; // Use minimax to find the best move
        }

        if (chosenMove !== undefined) {
            board[chosenMove] = currentPlayer;
            document.querySelector(`.cell[data-index='${chosenMove}']`).textContent = currentPlayer;
            checkForWinner();

            if (gameMode === 'ai-vs-ai' && gameActive) {
                currentPlayer = currentPlayer === 'X' ? 'O' : 'X'; // Switch turns for AI vs AI
                aiMove('easy'); // Continue AI vs AI in easy mode
            } else {
                currentPlayer = 'X'; // Back to player's turn if it's Player vs AI
            }
        }
    }, 500);
}

// Simple minimax function to enhance AI difficulty in hard mode
function minimax(newBoard, player) {
    const availableSpots = newBoard.map((cell, index) => (cell === null ? index : null)).filter(index => index !== null);

    // Check for terminal states (win, lose, draw)
    const winner = checkWinner(newBoard);
    if (winner === 'X') return { score: -10 };
    if (winner === 'O') return { score: 10 };
    if (availableSpots.length === 0) return { score: 0 };

    // Collect moves
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

    // Best move selection
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

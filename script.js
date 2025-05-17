document.addEventListener('DOMContentLoaded', () => {
    const gridContainer = document.getElementById('grid-container');
    const messageArea = document.getElementById('message-area');
    const resetButton = document.getElementById('reset-button');
    // Nie ma już exit-buttona jako oddzielnego, bo jest to move-button z data-move="0"
    // ale można go też osobno podpiąć, jeśli jest poza .move-button
    const exitButton = document.getElementById('exit-button'); // Dodane dla jasności


    let a = []; // Tablica A$(4,6) -> a[wiersz][kolumna] (0-indexed)
    const ROWS = 4;
    const COLS = 6;

    const initialData = [
        'n', 'a', 's', 'z', 'y', 'm',
        'p', 'i', 's', 'm', 'e', 'm',
        'z', 'a', 'w', 's', 'z', 'e',
        'B', 'A', 'J', 'T', 'E', 'K'
    ];

    function initializeGrid() {
        a = [];
        let k = 0;
        for (let i = 0; i < ROWS; i++) {
            a[i] = [];
            for (let j = 0; j < COLS; j++) {
                a[i][j] = initialData[k++];
            }
        }
    }

    function renderGrid() {
        gridContainer.innerHTML = '';
        for (let i = 0; i < ROWS; i++) {
            for (let j = 0; j < COLS; j++) {
                const cell = document.createElement('div');
                cell.classList.add('grid-cell');
                cell.textContent = a[i][j];
                gridContainer.appendChild(cell);
            }
        }
    }

    function scrollHorizontal(qbasicRuch) {
        if (qbasicRuch !== 1 && qbasicRuch !== 2) return;
        const r1 = qbasicRuch - 1;
        const r2 = (5 - qbasicRuch) - 1;
        let b_val = a[r1][COLS - 1];
        for (let j = COLS - 1; j > 0; j--) a[r1][j] = a[r1][j - 1];
        a[r1][0] = a[r2][0];
        for (let j = 0; j < COLS - 1; j++) a[r2][j] = a[r2][j + 1];
        a[r2][COLS - 1] = b_val;
    }

    function scrollVertical(qbasicRuchPoczatkowy) {
        if (qbasicRuchPoczatkowy < 3 || qbasicRuchPoczatkowy > 5) return;
        let ruch = qbasicRuchPoczatkowy - 2;
        const c1 = ruch - 1;
        const c2 = (7 - ruch) - 1;
        let b_val = a[0][c1];
        for (let i = 0; i < ROWS - 1; i++) a[i][c1] = a[i + 1][c1];
        a[ROWS - 1][c1] = a[ROWS - 1][c2];
        for (let i = ROWS - 1; i > 0; i--) a[i][c2] = a[i - 1][c2];
        a[0][c2] = b_val;
    }

    function scrambleGrid() {
        const numMixes = 15 + Math.floor(Math.random() * 15); // Trochę więcej mieszania
        for (let k = 0; k < numMixes; k++) {
            let randomMoveType = 1 + Math.floor(Math.random() * 5); // Losuje 1..5 (ruch gracza)
            
            if (randomMoveType === 1 || randomMoveType === 2) {
                scrollHorizontal(randomMoveType);
            } else if (randomMoveType >= 3 && randomMoveType <= 5) {
                scrollVertical(randomMoveType);
            }
        }
        // Zapewnienie, że nie jest już rozwiązane po mieszaniu (mało prawdopodobne, ale...)
        if (isGameWon()) {
            scrollHorizontal(1); // Dodatkowy ruch, jeśli przypadkiem się ułożyło
        }
    }

    function processMove(ruchGracza) {
        if (ruchGracza < 0 || ruchGracza > 5) {
            messageArea.textContent = "Nieprawidłowy numer ruchu.";
            messageArea.style.backgroundColor = '#f8d7da';
            messageArea.style.color = '#721c24';
            return;
        }
        
        messageArea.style.backgroundColor = '#e9f7ef'; // Domyślny kolor tła dla wiadomości
        messageArea.style.color = '#155724';

        if (ruchGracza === 0) {
            messageArea.textContent = "Do widzenia! (Gra zresetowana)";
            startGame();
            return;
        } else if (ruchGracza === 1 || ruchGracza === 2) {
            scrollHorizontal(ruchGracza);
            messageArea.textContent = `Wykonano ruch poziomy: ${ruchGracza}`;
        } else if (ruchGracza >= 3 && ruchGracza <= 5) {
            scrollVertical(ruchGracza);
            messageArea.textContent = `Wykonano ruch pionowy: ${ruchGracza}`;
        }

        renderGrid();
        checkWin();
    }
    
    function isGameWon() {
        let k = 0;
        for (let i = 0; i < ROWS; i++) {
            for (let j = 0; j < COLS; j++) {
                if (a[i][j] !== initialData[k++]) {
                    return false;
                }
            }
        }
        return true;
    }

    function checkWin() {
        if (isGameWon()) {
            messageArea.textContent = "Gratulacje! Ułożyłeś napis BAJTEK!";
            messageArea.style.backgroundColor = '#d4edda';
            messageArea.style.color = '#155724';
            // Można dodać blokadę przycisków po wygranej
            document.querySelectorAll('.move-button').forEach(btn => {
                if(parseInt(btn.dataset.move) !== 0) btn.disabled = true;
            });
        } else {
             // Włącz przyciski jeśli były wyłączone
            document.querySelectorAll('.move-button').forEach(btn => btn.disabled = false);
        }
    }
    
    function startGame() {
        initializeGrid();
        scrambleGrid();
        renderGrid();
        messageArea.textContent = "Kliknij na numery (1-5) wokół planszy, aby wykonać ruch.";
        messageArea.style.backgroundColor = '#e9f7ef';
        messageArea.style.color = '#155724';
        checkWin(); // Odblokowuje przyciski, jeśli były zablokowane
    }

    // Dodanie event listenerów do przycisków ruchów
    const moveButtons = document.querySelectorAll('.move-button');
    moveButtons.forEach(button => {
        button.addEventListener('click', () => {
            const moveValue = parseInt(button.dataset.move);
            processMove(moveValue);
        });
    });

    resetButton.addEventListener('click', startGame);
    // Exit button jest już obsłużony przez .move-button, ale jeśli byłby oddzielnym elementem bez tej klasy:
    // if (exitButton) {
    //     exitButton.addEventListener('click', () => processMove(0));
    // }


    // Start gry
    startGame();
});
class LifeGame {
    constructor(canvas, size) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.size = size;
        this.cellSize = 10;
        this.grid = [];
        this.isRunning = false;
        this.intervalId = null;
        this.speed = 500;
        this.cycleCount = 0;
        this.isAutoMode = false;

        this.initializeGrid();
        this.setupCanvas();
        this.setupEventListeners();
    }

    initializeGrid() {
        this.grid = Array(this.size).fill().map(() => Array(this.size).fill(0));
    }

    setupCanvas() {
        this.canvas.width = this.size * this.cellSize;
        this.canvas.height = this.size * this.cellSize;
    }

    setupEventListeners() {
        this.canvas.addEventListener('click', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const x = Math.floor((e.clientX - rect.left) / this.cellSize);
            const y = Math.floor((e.clientY - rect.top) / this.cellSize);
            this.toggleCell(x, y);
            this.draw();
        });
    }

    toggleCell(x, y) {
        if (x >= 0 && x < this.size && y >= 0 && y < this.size) {
            this.grid[y][x] = this.grid[y][x] ? 0 : 1;
        }
    }

    countNeighbors(x, y) {
        let count = 0;
        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                if (i === 0 && j === 0) continue;
                const newX = x + i;
                const newY = y + j;
                if (newX >= 0 && newX < this.size && newY >= 0 && newY < this.size) {
                    count += this.grid[newY][newX];
                }
            }
        }
        return count;
    }

    update() {
        const newGrid = Array(this.size).fill().map(() => Array(this.size).fill(0));
        
        for (let y = 0; y < this.size; y++) {
            for (let x = 0; x < this.size; x++) {
                const neighbors = this.countNeighbors(x, y);
                if (this.grid[y][x]) {
                    newGrid[y][x] = (neighbors === 2 || neighbors === 3) ? 1 : 0;
                } else {
                    newGrid[y][x] = neighbors === 3 ? 1 : 0;
                }
            }
        }
        
        this.grid = newGrid;
        this.cycleCount++;

        if (this.isAutoMode && this.cycleCount % 100 === 0) {
            this.addRandomCells(50);
        }
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        for (let y = 0; y < this.size; y++) {
            for (let x = 0; x < this.size; x++) {
                if (this.grid[y][x]) {
                    this.ctx.fillStyle = '#000';
                    this.ctx.fillRect(x * this.cellSize, y * this.cellSize, this.cellSize - 1, this.cellSize - 1);
                }
            }
        }
    }

    start() {
        if (!this.isRunning) {
            this.isRunning = true;
            this.intervalId = setInterval(() => {
                this.update();
                this.draw();
            }, this.speed);
        }
    }

    stop() {
        if (this.isRunning) {
            this.isRunning = false;
            clearInterval(this.intervalId);
        }
    }

    reset() {
        this.stop();
        this.initializeGrid();
        this.draw();
    }

    setSpeed(speed) {
        this.speed = speed;
        if (this.isRunning) {
            this.stop();
            this.start();
        }
    }

    addRandomCells(count = 100) {
        for (let attempt = 0; attempt < 10; attempt++) {
            for (let i = 0; i < count; i++) {
                const x = Math.floor(Math.random() * this.size);
                const y = Math.floor(Math.random() * this.size);
                this.grid[y][x] = 1;
            }
            this.update();
        }
        this.draw();
    }

    toggleAutoMode() {
        this.isAutoMode = !this.isAutoMode;
        return this.isAutoMode;
    }
}

// DOMの読み込み完了後に初期化
document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('gameField');
    const fieldSizeInput = document.getElementById('fieldSize');
    const goButton = document.getElementById('goButton');
    const resetButton = document.getElementById('resetButton');
    const randomButton = document.getElementById('randomButton');
    const autoButton = document.getElementById('autoButton');
    const speedSlider = document.getElementById('speedSlider');
    const speedValue = document.getElementById('speedValue');

    let game = new LifeGame(canvas, parseInt(fieldSizeInput.value));

    fieldSizeInput.addEventListener('change', () => {
        const newSize = parseInt(fieldSizeInput.value);
        if (newSize >= 10 && newSize <= 200) {
            game = new LifeGame(canvas, newSize);
        }
    });

    goButton.addEventListener('click', () => {
        if (game.isRunning) {
            game.stop();
            goButton.textContent = 'Go';
        } else {
            game.start();
            goButton.textContent = 'Stop';
        }
    });

    resetButton.addEventListener('click', () => {
        game.reset();
        goButton.textContent = 'Go';
    });

    randomButton.addEventListener('click', () => {
        game.addRandomCells(100);
    });

    autoButton.addEventListener('click', () => {
        const isAuto = game.toggleAutoMode();
        autoButton.textContent = isAuto ? 'Auto: ON' : 'Auto';
        autoButton.style.backgroundColor = isAuto ? '#4CAF50' : '';
    });

    speedSlider.addEventListener('input', () => {
        const speed = parseInt(speedSlider.value);
        speedValue.textContent = `${speed}ms`;
        game.setSpeed(speed);
    });
}); 
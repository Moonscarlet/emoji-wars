class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.setupCanvas();
        this.initializeGame();
        this.setupEventListeners();
        this.ballEmoji = this.getRandomBallEmoji();
    }

    setupCanvas() {
        const updateCanvasSize = () => {
            const maxWidth = 800;
            const maxHeight = 600;
            const scale = Math.min(
                window.innerWidth / maxWidth,
                window.innerHeight / maxHeight
            ) * 0.9;
            
            this.canvas.width = maxWidth * scale;
            this.canvas.height = maxHeight * scale;
            
            // Update paddle and ball sizes based on canvas size
            this.paddleWidth = this.canvas.width / 8;
            this.paddleHeight = this.canvas.height / 40;
            this.ballRadius = this.canvas.width / 60;
        };
        
        window.addEventListener('resize', updateCanvasSize);
        updateCanvasSize();
    }

    initializeGame() {
        // Game state
        this.score = 0;
        this.lives = 3;
        this.gameStarted = false;
        this.gameOver = false;
        
        // Ball properties
        this.ball = {
            x: this.canvas.width / 2,
            y: this.canvas.height - 30,
            dx: this.canvas.width / 200,
            dy: -this.canvas.width / 200,
            radius: this.ballRadius
        };

        // Paddle properties
        this.paddle = {
            width: this.paddleWidth,
            height: this.paddleHeight,
            x: (this.canvas.width - this.paddleWidth) / 2
        };

        // Controls
        this.rightPressed = false;
        this.leftPressed = false;

        // Initialize bricks
        this.initializeBricks();
        
        // Update displays
        this.updateScoreDisplay();
        this.updateLivesDisplay();
    }

    initializeBricks() {
        this.brickRowCount = 5;
        this.brickColumnCount = 7;
        this.brickWidth = this.canvas.width / 10;
        this.brickHeight = this.canvas.height / 20;
        this.brickPadding = 10;
        this.brickOffsetTop = this.canvas.height / 10;
        this.brickOffsetLeft = (this.canvas.width - (this.brickWidth + this.brickPadding) * this.brickColumnCount + this.brickPadding) / 2;

        this.bricks = [];
        for(let c = 0; c < this.brickColumnCount; c++) {
            this.bricks[c] = [];
            for(let r = 0; r < this.brickRowCount; r++) {
                this.bricks[c][r] = { 
                    x: 0, 
                    y: 0, 
                    status: 1, 
                    emoji: this.getRandomEmoji() 
                };
            }
        }
    }

    getRandomEmoji() {
        const emojis = ['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '🥲', '☺️', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🥸', '🤩', '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣', '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬', '🤯', '😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓', '🤗', '🤔', '🤭', '🤫', '🤥', '😶', '😐', '😑', '😬', '🙄', '😯', '😦', '😧', '😮', '😲', '🥱', '😴', '🤤', '😪', '😵', '🤐', '🥴', '🤢', '🤮', '🤧', '😷', '🤒', '🤕', '🤑', '🤠', '😈', '👿', '👹', '👺', '🤡', '💩', '👻', '💀', '☠️', '👽', '👾', '🤖', '🎃',
        '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🙈', '🙉', '🙊',
        '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝',
        '🌈', '☀️', '🌤️', '⛅', '🌥️', '☁️', '🌦️', '🌧️', '⛈️', '🌩️', '🌨️', '❄️', '☃️', '⚡', '🌟', '✨', '🌙', '🌚', '🌝',
        '🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🫐', '🍈', '🍒', '🍑', '🥭', '🍍', '🥥', '🥝', '🍅', '🥑',
        '🎮', '🎲', '🎯', '🎳', '🎪', '🎨', '🎭', '🎪', '🎟️', '🎫', '🎪', '🎭', '🎨', '🎬', '🎤', '🎧', '🎼', '🎹',
        '🌍', '🌎', '🌏', '🌐', '🗺️', '🗾', '🧭', '⛰️', '🏔️', '🌋', '🗻', '🏕️', '🏖️', '🏜️', '🏝️', '🏞️', '🏟️', '🏛️',
        '🎪', '🎭', '🎨', '🎬', '🎤', '🎧', '🎼', '🎹', '🥁', '🎷', '🎺', '🎸', '🪕', '🎻', '🎲', '♟️', '🎯', '🎳',
        '🚀', '🛸', '🌠', '🌌', '⭐', '🌟', '✨', '💫', '☄️', '🌍', '🌎', '🌏', '🌑', '🌒', '🌓', '🌔', '🌕', '🌖'];
        return emojis[Math.floor(Math.random() * emojis.length)];
    }

    setupEventListeners() {
        document.addEventListener('keydown', (e) => this.keyDownHandler(e), false);
        document.addEventListener('keyup', (e) => this.keyUpHandler(e), false);
        document.addEventListener('mousemove', (e) => this.mouseMoveHandler(e), false);
        
        document.getElementById('startButton').addEventListener('click', () => this.startGame());
        document.getElementById('restartButton').addEventListener('click', () => this.restartGame());
    }

    keyDownHandler(e) {
        if(e.key === 'Right' || e.key === 'ArrowRight') {
            this.rightPressed = true;
        }
        else if(e.key === 'Left' || e.key === 'ArrowLeft') {
            this.leftPressed = true;
        }
    }

    keyUpHandler(e) {
        if(e.key === 'Right' || e.key === 'ArrowRight') {
            this.rightPressed = false;
        }
        else if(e.key === 'Left' || e.key === 'ArrowLeft') {
            this.leftPressed = false;
        }
    }

    mouseMoveHandler(e) {
        const relativeX = e.clientX - this.canvas.offsetLeft;
        if(relativeX > 0 && relativeX < this.canvas.width) {
            this.paddle.x = relativeX - this.paddle.width / 2;
        }
    }

    collisionDetection() {
        for(let c = 0; c < this.brickColumnCount; c++) {
            for(let r = 0; r < this.brickRowCount; r++) {
                const b = this.bricks[c][r];
                if(b.status === 1) {
                    if(this.ball.x > b.x && 
                       this.ball.x < b.x + this.brickWidth && 
                       this.ball.y > b.y && 
                       this.ball.y < b.y + this.brickHeight) {
                        this.ball.dy = -this.ball.dy;
                        b.status = 0;
                        this.score++;
                        this.updateScoreDisplay();
                        
                        if(this.score === this.brickRowCount * this.brickColumnCount) {
                            this.win();
                        }
                    }
                }
            }
        }
    }

    updateScoreDisplay() {
        document.getElementById('scoreDisplay').textContent = `Score: ${this.score}`;
    }

    updateLivesDisplay() {
        document.getElementById('livesDisplay').textContent = `Lives: ${this.lives}`;
    }

    drawBall() {
        this.ctx.font = `${this.ball.radius * 2}px Arial`;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(this.ballEmoji, this.ball.x, this.ball.y);
    }

    drawPaddle() {
        this.ctx.beginPath();
        this.ctx.rect(this.paddle.x, this.canvas.height - this.paddle.height, 
                     this.paddle.width, this.paddle.height);
        this.ctx.fillStyle = '#0095DD';
        this.ctx.fill();
        this.ctx.closePath();
    }

    drawBricks() {
        for(let c = 0; c < this.brickColumnCount; c++) {
            for(let r = 0; r < this.brickRowCount; r++) {
                if(this.bricks[c][r].status === 1) {
                    const brickX = c * (this.brickWidth + this.brickPadding) + this.brickOffsetLeft;
                    const brickY = r * (this.brickHeight + this.brickPadding) + this.brickOffsetTop;
                    
                    this.bricks[c][r].x = brickX;
                    this.bricks[c][r].y = brickY;
                    
                    // Draw only the emoji (no background)
                    this.ctx.font = `${this.brickHeight}px Arial`;
                    this.ctx.textAlign = 'center';
                    this.ctx.textBaseline = 'middle';
                    this.ctx.fillStyle = '#FFFFFF';
                    this.ctx.fillText(
                        this.bricks[c][r].emoji, 
                        brickX + this.brickWidth / 2, 
                        brickY + this.brickHeight / 2
                    );
                }
            }
        }
    }

    draw() {
        if (!this.gameStarted || this.gameOver) return;

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.drawBricks();
        this.drawBall();
        this.drawPaddle();
        
        this.collisionDetection();

        // Ball collision with walls
        if(this.ball.x + this.ball.dx > this.canvas.width - this.ball.radius || 
           this.ball.x + this.ball.dx < this.ball.radius) {
            this.ball.dx = -this.ball.dx;
        }
        
        if(this.ball.y + this.ball.dy < this.ball.radius) {
            this.ball.dy = -this.ball.dy;
        } else if(this.ball.y + this.ball.dy > this.canvas.height - this.ball.radius) {
            if(this.ball.x > this.paddle.x && 
               this.ball.x < this.paddle.x + this.paddle.width) {
                this.ball.dy = -this.ball.dy;
            } else {
                this.lives--;
                this.updateLivesDisplay();
                
                if(!this.lives) {
                    this.gameOver = true;
                    this.showGameOver();
                } else {
                    this.ball.x = this.canvas.width / 2;
                    this.ball.y = this.canvas.height - 30;
                    this.ball.dx = this.canvas.width / 200;
                    this.ball.dy = -this.canvas.width / 200;
                    this.paddle.x = (this.canvas.width - this.paddle.width) / 2;
                    this.ballEmoji = this.getRandomBallEmoji();
                }
            }
        }

        // Move paddle
        if(this.rightPressed && this.paddle.x < this.canvas.width - this.paddle.width) {
            this.paddle.x += 7;
        }
        else if(this.leftPressed && this.paddle.x > 0) {
            this.paddle.x -= 7;
        }

        this.ball.x += this.ball.dx;
        this.ball.y += this.ball.dy;
        
        requestAnimationFrame(() => this.draw());
    }

    startGame() {
        document.getElementById('startScreen').classList.add('hidden');
        this.gameStarted = true;
        this.draw();
    }

    showGameOver() {
        document.getElementById('gameOverScreen').classList.remove('hidden');
        document.getElementById('finalScore').textContent = `Final Score: ${this.score}`;
    }

    restartGame() {
        document.getElementById('gameOverScreen').classList.add('hidden');
        this.initializeGame();
        this.gameStarted = true;
        this.draw();
    }

    win() {
        this.gameOver = true;
        alert('Congratulations! You win!');
        this.restartGame();
    }

    getRandomBallEmoji() {
        const ballEmojis = ['⚽', '🏀', '⚾', '🎾', '🔮', '💫', '⭐', '🌟', '🌞', '🎈'];
        return ballEmojis[Math.floor(Math.random() * ballEmojis.length)];
    }
}

// Start the game when the page loads
window.onload = () => {
    new Game();
}; 
class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.setupCanvas();
        this.setupEventListeners();
        this.ballEmoji = this.getRandomBallEmoji();
        
        // Track powerups
        this.powerups = [];
        
        // Permanent modifiers
        this.speedMultiplier = 1;
        this.paddleSizeMultiplier = 1;
        this.extraLives = 0;

        // Temporary effect
        this.currentTemporaryEffect = null; // 'fire' or 'magnet'
        this.magnetActive = false;
        this.fireballActive = false;

        // Ball stuck info (for magnet)
        this.ballStuckToPaddle = false;
        this.ballStuckOffsetX = 0;

        this.initializeGame(1); // Default initial speed factor
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
            
            this.basePaddleWidth = this.canvas.width / 8;
            this.paddleHeight = this.canvas.height / 40;
            this.ballRadius = this.canvas.width / 60;
        };
        
        window.addEventListener('resize', updateCanvasSize);
        updateCanvasSize();
    }

    initializeGame(speedFactor) {
        this.score = 0;
        this.lives = 3 + this.extraLives;
        this.gameStarted = false;
        this.gameOver = false;
        this.currentSpeedFactor = speedFactor * this.speedMultiplier;

        this.ball = {
            x: this.canvas.width / 2,
            y: this.canvas.height - 30,
            dx: (this.canvas.width / 200) * this.currentSpeedFactor,
            dy: -(this.canvas.width / 200) * this.currentSpeedFactor,
            radius: this.ballRadius
        };

        this.paddle = {
            width: this.basePaddleWidth * this.paddleSizeMultiplier,
            height: this.paddleHeight,
            x: (this.canvas.width - this.basePaddleWidth * this.paddleSizeMultiplier) / 2
        };

        // Controls
        this.rightPressed = false;
        this.leftPressed = false;

        // Initialize bricks
        this.initializeBricks();

        // Clear powerups
        this.powerups = [];

        // Clear temporary effects
        this.clearTemporaryEffect();

        this.ballEmoji = this.getRandomBallEmoji();
        this.updateScoreDisplay();
        this.updateLivesDisplay();
        this.updateActiveEffectsDisplay();
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
        
        // Release ball if magnet and space pressed
        document.addEventListener('keydown', (e) => {
            if (e.key === ' ' && this.ballStuckToPaddle) {
                this.releaseBallFromPaddle();
            }
        });

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
                    const ballLeft = this.ball.x - this.ball.radius;
                    const ballRight = this.ball.x + this.ball.radius;
                    const ballTop = this.ball.y - this.ball.radius;
                    const ballBottom = this.ball.y + this.ball.radius;

                    const brickLeft = b.x;
                    const brickRight = b.x + this.brickWidth;
                    const brickTop = b.y;
                    const brickBottom = b.y + this.brickHeight;

                    if(ballRight > brickLeft && 
                       ballLeft < brickRight && 
                       ballBottom > brickTop && 
                       ballTop < brickBottom) {
                        
                        const overlapX = Math.min(ballRight - brickLeft, brickRight - ballLeft);
                        const overlapY = Math.min(ballBottom - brickTop, brickBottom - ballTop);

                        if (overlapX < overlapY) {
                            this.ball.dx = (this.ball.x < b.x + this.brickWidth/2) ? 
                                -Math.abs(this.ball.dx) : Math.abs(this.ball.dx);
                        } else {
                            this.ball.dy = (this.ball.y < b.y + this.brickHeight/2) ? 
                                -Math.abs(this.ball.dy) : Math.abs(this.ball.dy);
                        }

                        b.status = 0;
                        this.score++;
                        this.updateScoreDisplay();

                        if (this.fireballActive) {
                            this.destroySurroundingBricks(c, r);
                        }

                        this.maybeSpawnPowerup(b);

                        if(this.score === this.brickRowCount * this.brickColumnCount) {
                            this.win();
                        }
                    }
                }
            }
        }
    }

    destroySurroundingBricks(col, row) {
        const neighbors = [
            [col-1, row], [col+1, row], [col, row-1], [col, row+1],
            [col-1, row-1], [col+1, row-1], [col-1, row+1], [col+1, row+1]
        ];
        for (let [nc, nr] of neighbors) {
            if (this.bricks[nc] && this.bricks[nc][nr] && this.bricks[nc][nr].status === 1) {
                this.bricks[nc][nr].status = 0;
                this.score++;
                this.updateScoreDisplay();
                this.maybeSpawnPowerup(this.bricks[nc][nr]);
            }
        }
    }

    maybeSpawnPowerup(brick) {
        // 30% chance of a powerup
        if (Math.random() < 0.3) {
            const powerupTypes = [
                {type: 'fire', emoji: '🔥', temporary: true},
                {type: 'magnet', emoji: '🧲', temporary: true},
                {type: 'speedUp', emoji: '⚡', temporary: false},
                {type: 'speedDown', emoji: '🐌', temporary: false},
                {type: 'longPaddle', emoji: '📏', temporary: false},
                {type: 'shortPaddle', emoji: '✂️', temporary: false},
                {type: 'extraLife', emoji: '❤️', temporary: false}
            ];
            const chosen = powerupTypes[Math.floor(Math.random() * powerupTypes.length)];

            this.powerups.push({
                x: brick.x + this.brickWidth / 2,
                y: brick.y + this.brickHeight / 2,
                type: chosen.type,
                emoji: chosen.emoji,
                active: true,
                temporary: chosen.temporary
            });
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

    drawPowerups() {
        for (let p of this.powerups) {
            if (!p.active) continue;
            this.ctx.font = `${this.ballRadius * 1.5}px Arial`;
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(p.emoji, p.x, p.y);
            p.y += 2; // Move down

            // Check if it hits paddle
            if (p.y > this.canvas.height - this.paddle.height && p.y < this.canvas.height &&
                p.x > this.paddle.x && p.x < this.paddle.x + this.paddle.width) {
                // Caught powerup
                p.active = false;
                this.applyPowerup(p);
            } else if (p.y > this.canvas.height) {
                p.active = false; // Missed
            }
        }

        // Filter out inactive powerups
        this.powerups = this.powerups.filter(p => p.active);
    }

    applyPowerup(p) {
        if (p.temporary) {
            // Temporary effect overrides current one
            this.clearTemporaryEffect(); 
            if (p.type === 'fire') {
                this.activateFireball();
            } else if (p.type === 'magnet') {
                this.activateMagnet();
            }
        } else {
            // Permanent effects
            switch(p.type) {
                case 'speedUp':
                    this.speedMultiplier *= 1.2; 
                    this.applyCurrentFactors();
                    break;
                case 'speedDown':
                    this.speedMultiplier *= 0.8;
                    this.applyCurrentFactors();
                    break;
                case 'longPaddle':
                    this.paddleSizeMultiplier *= 1.5;
                    this.applyCurrentFactors();
                    break;
                case 'shortPaddle':
                    this.paddleSizeMultiplier *= 0.7;
                    this.applyCurrentFactors();
                    break;
                case 'extraLife':
                    this.lives++;
                    this.updateLivesDisplay();
                    break;
            }
        }
        this.updateActiveEffectsDisplay();
    }

    applyCurrentFactors() {
        const speedSelect = document.getElementById('ballSpeedSelect');
        const baseSpeed = speedSelect ? parseFloat(speedSelect.value) : 1;
        this.currentSpeedFactor = baseSpeed * this.speedMultiplier;

        const directionX = this.ball.dx >= 0 ? 1 : -1;
        const directionY = this.ball.dy >= 0 ? 1 : -1;

        this.ball.dx = (this.canvas.width / 200) * this.currentSpeedFactor * directionX;
        this.ball.dy = (this.canvas.width / 200) * this.currentSpeedFactor * directionY;

        this.paddle.width = this.basePaddleWidth * this.paddleSizeMultiplier;
        if (this.paddle.x + this.paddle.width > this.canvas.width) {
            this.paddle.x = this.canvas.width - this.paddle.width;
        }
    }

    activateFireball() {
        this.fireballActive = true;
        this.currentTemporaryEffect = 'fire';
        this.ballEmoji = '🔥'; // fire emoji
    }

    activateMagnet() {
        this.magnetActive = true;
        this.currentTemporaryEffect = 'magnet';
        this.ballEmoji = '🧲'; // magnet emoji
    }

    clearTemporaryEffect() {
        this.fireballActive = false;
        this.magnetActive = false;
        this.currentTemporaryEffect = null;
        this.ballEmoji = this.getRandomBallEmoji();
    }

    releaseBallFromPaddle() {
        // When magnet is active and space is pressed
        if (this.ballStuckToPaddle) {
            this.ballStuckToPaddle = false;
            // Determine direction based on offset
            // If offset is negative (ball left of center), go left; if positive, go right; if zero, go straight up
            let direction = 0;
            if (this.ballStuckOffsetX < 0) direction = -1;
            if (this.ballStuckOffsetX > 0) direction = 1;

            const speed = (this.canvas.width / 200) * this.currentSpeedFactor;
            this.ball.dx = speed * direction;
            // If direction = 0, ball goes straight up
            this.ball.dy = -(this.canvas.width / 200) * this.currentSpeedFactor;
        }
    }

    updateActiveEffectsDisplay() {
        const el = document.getElementById('activeEffects');
        // Show only the emoji of the current temporary effect
        if (this.currentTemporaryEffect === 'fire') {
            el.textContent = 'Effects: 🔥';
        } else if (this.currentTemporaryEffect === 'magnet') {
            el.textContent = 'Effects: 🧲';
        } else {
            el.textContent = 'Effects: None';
        }
    }

    draw() {
        if (!this.gameStarted || this.gameOver) return;

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.drawBricks();
        this.drawBall();
        this.drawPaddle();
        this.drawPowerups();
        
        this.collisionDetection();

        // Ball collision with walls
        if(this.ball.x + this.ball.dx > this.canvas.width - this.ball.radius || 
           this.ball.x + this.ball.dx < this.ball.radius) {
            this.ball.dx = -this.ball.dx;
        }

        if (this.ballStuckToPaddle) {
            // Keep the ball stuck to the paddle, move with it
            this.ball.x = this.paddle.x + (this.paddle.width / 2) + this.ballStuckOffsetX;
            this.ball.y = this.canvas.height - this.paddle.height - this.ball.radius;
        } else {
            if(this.ball.y + this.ball.dy < this.ball.radius) {
                this.ball.dy = -this.ball.dy;
            } else if(this.ball.y + this.ball.dy > this.canvas.height - this.ball.radius) {
                if(this.ball.x > this.paddle.x && 
                   this.ball.x < this.paddle.x + this.paddle.width) {
                   
                    if (this.magnetActive) {
                        // Stick ball to paddle
                        this.ballStuckToPaddle = true;
                        let ballCenterOffset = this.ball.x - (this.paddle.x + this.paddle.width/2);
                        this.ballStuckOffsetX = ballCenterOffset;
                        this.ball.dx = 0;
                        this.ball.dy = 0;
                    } else {
                        const paddleCenter = this.paddle.x + this.paddle.width / 2;
                        const hitRatio = (this.ball.x - paddleCenter) / (this.paddle.width / 2);
                        
                        const maxBounceAngle = Math.PI / 3;
                        const bounceAngle = hitRatio * maxBounceAngle;
                        
                        const speed = Math.sqrt(this.ball.dx * this.ball.dx + this.ball.dy * this.ball.dy);
                        
                        this.ball.dx = speed * Math.sin(bounceAngle);
                        this.ball.dy = -speed * Math.cos(bounceAngle);
                    }

                } else {
                    // Missed the paddle
                    this.lives--;
                    this.updateLivesDisplay();
                    
                    // Reset temporary effects on death
                    this.clearTemporaryEffect();

                    if(!this.lives) {
                        this.gameOver = true;
                        this.showGameOver();
                    } else {
                        const speedSelect = document.getElementById('ballSpeedSelect');
                        const baseSpeed = speedSelect ? parseFloat(speedSelect.value) : 1;
                        this.currentSpeedFactor = baseSpeed * this.speedMultiplier;

                        this.ball.x = this.canvas.width / 2;
                        this.ball.y = this.canvas.height - 30;
                        this.ball.dx = (this.canvas.width / 200) * this.currentSpeedFactor;
                        this.ball.dy = -(this.canvas.width / 200) * this.currentSpeedFactor;
                        this.paddle.x = (this.canvas.width - this.paddle.width) / 2;
                        this.ballEmoji = this.getRandomBallEmoji();
                    }
                }
            }

            this.ball.x += this.ball.dx;
            this.ball.y += this.ball.dy;
        }

        // Move paddle
        if(this.rightPressed && this.paddle.x < this.canvas.width - this.paddle.width) {
            this.paddle.x += 7;
        }
        else if(this.leftPressed && this.paddle.x > 0) {
            this.paddle.x -= 7;
        }

        this.updateActiveEffectsDisplay();
        
        requestAnimationFrame(() => this.draw());
    }

    startGame() {
        const speedSelect = document.getElementById('ballSpeedSelect');
        const selectedSpeed = speedSelect ? parseFloat(speedSelect.value) : 1;

        this.initializeGame(selectedSpeed);
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
        const speedSelect = document.getElementById('ballSpeedSelect');
        const selectedSpeed = speedSelect ? parseFloat(speedSelect.value) : 1;
        
        // Reset multipliers and extras for a fresh new game
        this.speedMultiplier = 1;
        this.paddleSizeMultiplier = 1;
        this.extraLives = 0;

        this.initializeGame(selectedSpeed);
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

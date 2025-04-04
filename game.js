// 遊戲全局設置
const gameSettings = {
    music: true,
    sound: true,
    difficulty: 'normal',
    playerOneControls: {
        up: 'W',
        down: 'S',
        left: 'A',
        right: 'D',
        attack: 'J',
        jump: 'K',
        special: 'L'
    },
    playerTwoControls: {
        up: 'UP',
        down: 'DOWN',
        left: 'LEFT',
        right: 'RIGHT',
        attack: 'NUMPAD_1',
        jump: 'NUMPAD_2',
        special: 'NUMPAD_3'
    }
};

// 保存遊戲實例的全局變量
let gameInstance = null;

// 遊戲狀態
const gameState = {
    players: [],
    currentLevel: 1,
    player1Score: 0,
    player2Score: 0,
    totalScore: 0, // 兩個玩家的總分數
    lives: 3,
    continues: 3,
    twoPlayerMode: false,
    gameInitialized: false // 標記遊戲是否已初始化
};

// 模擬資源加載
document.addEventListener('DOMContentLoaded', () => {
    const loadingBar = document.getElementById('loading-bar');
    let progress = 0;
    
    const loadingInterval = setInterval(() => {
        progress += 5;
        loadingBar.style.width = `${progress}%`;
        
        if (progress >= 100) {
            clearInterval(loadingInterval);
            document.getElementById('loading-screen').style.display = 'none';
        }
    }, 100);
    
    // 設置按鈕事件
    setupButtonEvents();
});

function setupButtonEvents() {
    // 移除所有可能存在的舊事件監聽器
    removeAllEventListeners();
    
    // 標題畫面按鈕
    document.getElementById('single-player').addEventListener('click', () => {
        gameState.twoPlayerMode = false;
        // 添加默認角色
        gameState.players = [{
            type: 'fighter', // 默認角色類型
            health: 100,
            maxHealth: 100
        }];
        startGame();
    });
    
    document.getElementById('two-player').addEventListener('click', () => {
        gameState.twoPlayerMode = true;
        document.getElementById('player2-ui').style.display = 'flex';
        // 添加兩個默認角色
        gameState.players = [
            {
                type: 'fighter', // 玩家1默認角色類型
                health: 100,
                maxHealth: 100
            },
            {
                type: 'ninja', // 玩家2默認角色類型
                health: 100,
                maxHealth: 100
            }
        ];
        startGame();
    });
    
    document.getElementById('options').addEventListener('click', () => {
        // 簡化版不實現選項功能
        alert('選項功能在完整版中提供');
    });
    
    // 角色選擇按鈕
    document.getElementById('back-to-title').addEventListener('click', () => {
        document.getElementById('character-select').style.display = 'none';
        document.getElementById('title-screen').style.display = 'flex';
    });
    
    const characters = document.querySelectorAll('.character');
    characters.forEach(character => {
        character.addEventListener('click', () => {
            const characterType = character.getAttribute('data-character');
            gameState.players.push({
                type: characterType,
                health: 100,
                maxHealth: 100
            });
            
            if (gameState.twoPlayerMode && gameState.players.length === 1) {
                // 如果是雙人模式且只選了一個角色，等待第二個玩家選擇
                alert('玩家 2 請選擇角色');
            } else {
                // 開始遊戲
                startGame();
            }
        });
    });
    
    // 遊戲結束畫面按鈕
    document.getElementById('return-to-title').addEventListener('click', () => {
        resetGame();
        document.getElementById('game-over').style.display = 'none';
        document.getElementById('title-screen').style.display = 'flex';
    });
}

// 移除所有按鈕的事件監聽器
function removeAllEventListeners() {
    // 複製並替換所有按鈕元素，以移除所有事件監聽器
    const buttonIds = ['single-player', 'two-player', 'options', 'back-to-title', 'return-to-title'];
    
    buttonIds.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            const newElement = element.cloneNode(true);
            element.parentNode.replaceChild(newElement, element);
        }
    });
    
    // 移除角色選擇按鈕的事件監聽器
    const characters = document.querySelectorAll('.character');
    characters.forEach(character => {
        const newCharacter = character.cloneNode(true);
        character.parentNode.replaceChild(newCharacter, character);
    });
}

function showCharacterSelect() {
    document.getElementById('title-screen').style.display = 'none';
    document.getElementById('character-select').style.display = 'flex';
}

function startGame() {
    // 直接從標題畫面進入遊戲，不需要隱藏角色選擇畫面
    document.getElementById('title-screen').style.display = 'none';
    document.getElementById('game-ui').style.display = 'flex';
    
    // 初始化Phaser遊戲
    initGame();
}

function resetGame() {
    // 銷毀現有的Phaser遊戲實例
    if (gameInstance) {
        gameInstance.destroy(true);
        gameInstance = null;
    }
    
    // 重置遊戲狀態
    gameState.players = [];
    gameState.currentLevel = 1;
    gameState.player1Score = 0;
    gameState.player2Score = 0;
    gameState.totalScore = 0;
    gameState.lives = 3;
    gameState.currentWave = 0; // 重置波數計數器
    gameState.twoPlayerMode = false;
    gameState.gameInitialized = false; // 重置遊戲初始化標記
    
    // 更新UI
    document.getElementById('player2-ui').style.display = 'none';
    updateUI();
    
    // 重新設置所有按鈕的事件監聽器
    setupButtonEvents();
    
    // 清理遊戲資源和事件
    window.removeEventListener('resize', window.onresize);
    window.removeEventListener('orientationchange', window.onorientationchange);
    
    // 重置DOM元素狀態
    document.getElementById('game-over').style.display = 'none';
    document.getElementById('game-ui').style.display = 'none';
    document.getElementById('character-select').style.display = 'none';
    document.getElementById('title-screen').style.display = 'flex';
}

function updateUI() {
    // 根據遊戲模式顯示不同的分數信息
    if (gameState.twoPlayerMode) {
        // 雙人模式顯示兩個玩家的分數和總分
        document.getElementById('score').innerHTML = `玩家1: ${gameState.player1Score} | 玩家2: ${gameState.player2Score}<br>總分: ${gameState.totalScore}`;
    } else {
        // 單人模式只顯示一個分數
        document.getElementById('score').textContent = `分數: ${gameState.player1Score}`;
    }
    document.getElementById('lives').textContent = `續命: ${gameState.lives}`;
    
    // 更新波數顯示，確保至少顯示第1波，總波數為10
    const currentWave = gameState.currentWave || 1;
    const totalWaves = 10; // 每關10波敵人
    document.getElementById('wave').textContent = `波次: ${currentWave}/${totalWaves}`;
    
    // 更新玩家生命值
    if (gameState.players.length > 0) {
        const healthPercent = (gameState.players[0].health / gameState.players[0].maxHealth) * 100;
        document.getElementById('player1-health').style.width = `${healthPercent}%`;
    }
    
    if (gameState.twoPlayerMode && gameState.players.length > 1) {
        const healthPercent = (gameState.players[1].health / gameState.players[1].maxHealth) * 100;
        document.getElementById('player2-health').style.width = `${healthPercent}%`;
    }
}

function showGameOver() {
    document.getElementById('game-ui').style.display = 'none';
    
    // 根據遊戲模式顯示不同的分數信息
    if (gameState.twoPlayerMode) {
        // 雙人模式顯示兩個玩家的分數和總分
        document.getElementById('final-score').innerHTML = `玩家1分數: ${gameState.player1Score}<br>玩家2分數: ${gameState.player2Score}<br>總分數: ${gameState.totalScore}`;
    } else {
        // 單人模式只顯示一個分數
        document.getElementById('final-score').textContent = `最終分數: ${gameState.player1Score}`;
    }
    
    document.getElementById('game-over').style.display = 'flex';
    
    // 移除舊的事件監聽器並重新綁定
    const returnToTitleButton = document.getElementById('return-to-title');
    const newReturnButton = returnToTitleButton.cloneNode(true);
    returnToTitleButton.parentNode.replaceChild(newReturnButton, returnToTitleButton);
    
    // 重新綁定返回主菜單按鈕事件
    newReturnButton.addEventListener('click', () => {
        resetGame();
        document.getElementById('game-over').style.display = 'none';
        document.getElementById('title-screen').style.display = 'flex';
    });
}

// Phaser遊戲初始化
function initGame() {
    // 如果遊戲已經初始化，先重置
    if (gameState.gameInitialized) {
        resetGame();
    }
    
    // 遊戲配置
    const config = {
        type: Phaser.AUTO,
        width: 800,
        height: 450,
        parent: 'game-container',
        pixelArt: true,
        physics: {
            default: 'arcade',
            arcade: {
                gravity: { y: 800 },
                debug: false
            }
        },
        scene: {
            preload: preload,
            create: create,
            update: update
        }
    };
    
    // 創建遊戲實例並保存到全局變量
    gameInstance = new Phaser.Game(config);
    gameState.gameInitialized = true; // 標記遊戲已初始化
}

// 資源預加載

// 資源預加載
function preload() {
    // 加載遊戲資源
    this.load.image('background', 'https://labs.phaser.io/assets/skies/space3.png');
    this.load.image('ground', 'https://labs.phaser.io/assets/sprites/platform.png');
    this.load.image('player', 'https://labs.phaser.io/assets/sprites/phaser-dude.png');
    this.load.image('enemy', 'https://labs.phaser.io/assets/sprites/red.png');
}

// 創建遊戲場景
function create() {
    // 添加背景
    this.add.image(400, 225, 'background');

    // 添加地面平台
    const platforms = this.physics.add.staticGroup();
    platforms.create(400, 430, 'ground').setScale(2).refreshBody();

    // 添加玩家
    this.player = this.physics.add.sprite(100, 350, 'player');
    this.player.setBounce(0.2);
    this.player.setCollideWorldBounds(true);
    
    // 如果是雙人模式，添加第二個玩家
    if (gameState.twoPlayerMode) {
        this.player2 = this.physics.add.sprite(700, 350, 'player');
        this.player2.setBounce(0.2);
        this.player2.setCollideWorldBounds(true);
        // 為了區分兩個玩家，給第二個玩家設置一個不同的顏色
        this.player2.setTint(0x00ffff);
    }

    // 創建敵人群組
    this.enemies = this.physics.add.group();
    
    // 生成敵人函數 - 移到場景內部
    this.spawnEnemies = () => {
        // 每次生成敵人時波數加1
        this.gameState.currentWave++;
        
        // 根據當前波數調整敵人數量，波數越高敵人越多
        const numEnemies = Math.min(3 + Math.floor(this.gameState.currentWave / 2), 8);
        
        for (let i = 0; i < numEnemies; i++) {
            const x = Phaser.Math.Between(100, 700);
            const enemy = this.enemies.create(x, 0, 'enemy');
            enemy.setBounce(0.2);
            enemy.setCollideWorldBounds(true);
            enemy.setVelocityX(Phaser.Math.Between(-50, 50));
        }
        
        // 更新UI顯示當前波數
        gameState.currentWave = this.gameState.currentWave; // 同步到全局gameState
        updateUI();
        
        // 在遊戲中顯示當前波數
        const waveText = this.add.text(400, 100, `第 ${this.gameState.currentWave} 波敵人來襲！`, { fontSize: '24px', fill: '#ff0000' });
        waveText.setOrigin(0.5);
        
        // 2秒後移除文字
        this.time.delayedCall(2000, () => {
            waveText.destroy();
        });
    };
    
    // 處理玩家和敵人的碰撞 - 移到場景內部
    this.handlePlayerEnemyCollision = (player, enemy) => {
        enemy.destroy();
        this.gameState.enemiesDefeated++;
        
        // 判斷是哪個玩家擊敗了敵人
        if (gameState.twoPlayerMode) {
            // 雙人模式下，根據玩家對象判斷是玩家1還是玩家2
            if (player === this.player) {
                // 玩家1擊敗敵人
                this.gameState.player1Score += 10;
                gameState.player1Score = this.gameState.player1Score;
                this.player1ScoreText.setText('玩家1分數: ' + this.gameState.player1Score);
            } else if (player === this.player2) {
                // 玩家2擊敗敵人
                this.gameState.player2Score += 10;
                gameState.player2Score = this.gameState.player2Score;
                this.player2ScoreText.setText('玩家2分數: ' + this.gameState.player2Score);
            }
            
            // 更新總分數
            this.gameState.totalScore = this.gameState.player1Score + this.gameState.player2Score;
            gameState.totalScore = this.gameState.totalScore;
            this.totalScoreText.setText('總分數: ' + this.gameState.totalScore);
        } else {
            // 單人模式下，只更新玩家1的分數
            this.gameState.player1Score += 10;
            gameState.player1Score = this.gameState.player1Score;
            gameState.totalScore = this.gameState.player1Score; // 單人模式下總分等於玩家1分數
            this.scoreText.setText('分數: ' + this.gameState.player1Score);
        }
    };

    // 設置5秒後才開始生成敵人
    this.initialDelay = 5000; // 5秒延遲
    this.gameStartTime = this.time.now; // 記錄遊戲開始時間
    // 不再立即生成初始敵人

    // 設置碰撞
    this.physics.add.collider(this.player, platforms);
    this.physics.add.collider(this.enemies, platforms);
    this.physics.add.collider(this.player, this.enemies, this.handlePlayerEnemyCollision, null, this);
    
    // 如果是雙人模式，為第二個玩家設置碰撞
    if (gameState.twoPlayerMode && this.player2) {
        this.physics.add.collider(this.player2, platforms);
        this.physics.add.collider(this.player2, this.enemies, this.handlePlayerEnemyCollision, null, this);
    }

    // 設置鍵盤控制
    this.cursors = this.input.keyboard.createCursorKeys();
    
    // 根據遊戲模式設置控制
    // 雙人模式時，為玩家1創建WASD控制
    if (gameState.twoPlayerMode) {
        this.wasdKeys = this.input.keyboard.addKeys({
            up: Phaser.Input.Keyboard.KeyCodes.W,
            down: Phaser.Input.Keyboard.KeyCodes.S,
            left: Phaser.Input.Keyboard.KeyCodes.A,
            right: Phaser.Input.Keyboard.KeyCodes.D,
            jump: Phaser.Input.Keyboard.KeyCodes.K
        });
    } else {
        this.wasdKeys = null; // 單人模式時不啟用WASD控制
    }

    // 初始化遊戲狀態
    this.gameState = {
        player1Score: 0,
        player2Score: 0,
        totalScore: 0, // 兩個玩家的總分數
        enemiesDefeated: 0,
        currentWave: 0, // 添加波數計數器，從0開始，第一次生成敵人時會變成1
        totalWaves: 10,  // 設定每關的總波數為10
        gameCompleted: false // 標記遊戲是否完成
    };

    // 添加分數顯示
    if (gameState.twoPlayerMode) {
        // 雙人模式顯示兩個玩家的分數
        this.player1ScoreText = this.add.text(16, 16, '玩家1分數: 0', { fontSize: '24px', fill: '#fff' });
        this.player2ScoreText = this.add.text(16, 50, '玩家2分數: 0', { fontSize: '24px', fill: '#fff' });
        this.totalScoreText = this.add.text(16, 84, '總分數: 0', { fontSize: '24px', fill: '#fff' });
    } else {
        // 單人模式只顯示一個分數
        this.scoreText = this.add.text(16, 16, '分數: 0', { fontSize: '32px', fill: '#fff' });
    }

    // 初始化敵人生成計時器
    this.nextEnemySpawn = this.time.now + this.initialDelay; // 5秒後開始生成
    this.enemySpawnInterval = 3000; // 每3秒生成一個敵人
    
    // 添加倒計時文字
    this.countdownText = this.add.text(400, 100, '敵人將在 5 秒後出現', { fontSize: '24px', fill: '#fff' });
    this.countdownText.setOrigin(0.5);
}

// 更新遊戲邏輯
function update(time, delta) {
    // 確保cursors已初始化
    if (!this.cursors) {
        // 初始化鍵盤控制
        this.cursors = this.input.keyboard.createCursorKeys();
        
        // 根據遊戲模式設置控制
        // 雙人模式時，為玩家1創建WASD控制
        if (gameState.twoPlayerMode) {
            this.wasdKeys = this.input.keyboard.addKeys({
                up: Phaser.Input.Keyboard.KeyCodes.W,
                down: Phaser.Input.Keyboard.KeyCodes.S,
                left: Phaser.Input.Keyboard.KeyCodes.A,
                right: Phaser.Input.Keyboard.KeyCodes.D,
                jump: Phaser.Input.Keyboard.KeyCodes.K
            });
        } else {
            this.wasdKeys = null; // 單人模式時不啟用WASD控制
        }
        return;
    }
    
    // 玩家移動控制
    if (gameState.twoPlayerMode) {
        // 雙人模式 - 玩家1使用WASD控制
        if (this.wasdKeys && this.wasdKeys.left.isDown) {
            this.player.setVelocityX(-160);
        } else if (this.wasdKeys && this.wasdKeys.right.isDown) {
            this.player.setVelocityX(160);
        } else {
            this.player.setVelocityX(0);
        }

        if ((this.wasdKeys && (this.wasdKeys.up.isDown || this.wasdKeys.jump.isDown)) && this.player.body.touching.down) {
            this.player.setVelocityY(-330);
        }
        
        // 玩家2使用方向鍵控制
        if (this.player2) {
            if (this.cursors.left.isDown) {
                this.player2.setVelocityX(-160);
            } else if (this.cursors.right.isDown) {
                this.player2.setVelocityX(160);
            } else {
                this.player2.setVelocityX(0);
            }

            if (this.cursors.up.isDown && this.player2.body.touching.down) {
                this.player2.setVelocityY(-330);
            }
        }
    } else {
        // 單人模式 - 只支持方向鍵
        if (this.cursors.left.isDown) {
            this.player.setVelocityX(-160);
        } else if (this.cursors.right.isDown) {
            this.player.setVelocityX(160);
        } else {
            this.player.setVelocityX(0);
        }

        if (this.cursors.up.isDown && this.player.body.touching.down) {
            this.player.setVelocityY(-330);
        }
    }

    // 更新敵人行為
    this.enemies.children.iterate((enemy) => {
        if (enemy) {
            // 簡單的AI：向最近的玩家移動
            let targetPlayer = this.player;
            
            // 如果是雙人模式，計算哪個玩家更近
            if (gameState.twoPlayerMode && this.player2) {
                const distToPlayer1 = Phaser.Math.Distance.Between(enemy.x, enemy.y, this.player.x, this.player.y);
                const distToPlayer2 = Phaser.Math.Distance.Between(enemy.x, enemy.y, this.player2.x, this.player2.y);
                
                if (distToPlayer2 < distToPlayer1) {
                    targetPlayer = this.player2;
                }
            }
            
            // 向目標玩家移動
            if (enemy.x < targetPlayer.x) {
                enemy.setVelocityX(50);
            } else {
                enemy.setVelocityX(-50);
            }
        }
    });

    // 更新倒計時文字
    if (this.countdownText && this.time.now < this.gameStartTime + this.initialDelay) {
        const remainingTime = Math.ceil((this.gameStartTime + this.initialDelay - this.time.now) / 1000);
        this.countdownText.setText(`敵人將在 ${remainingTime} 秒後出現`);
    } else if (this.countdownText && this.time.now >= this.gameStartTime + this.initialDelay) {
        this.countdownText.destroy();
        this.countdownText = null;
    }
    
    // 檢查是否需要生成新敵人 (只有在初始延遲後才生成，且遊戲未完成)
    if (time > this.nextEnemySpawn && !this.gameState.gameCompleted) {
        // 檢查是否已達到最大波數
        if (this.gameState.currentWave < this.gameState.totalWaves) {
            this.spawnEnemies();
            this.nextEnemySpawn = time + this.enemySpawnInterval;
        }
    }
    
    // 檢查當前波次的敵人是否全部擊敗
    if (this.enemies.countActive() === 0 && this.gameState.currentWave >= this.gameState.totalWaves && !this.gameState.gameCompleted) {
        // 標記遊戲完成
        this.gameState.gameCompleted = true;
        
        // 同步分數到全局gameState (已在碰撞處理中同步)
        
        // 顯示遊戲完成信息
        const completionText = this.add.text(400, 200, `恭喜完成所有波次！`, { fontSize: '32px', fill: '#00ff00' });
        completionText.setOrigin(0.5);
        
        if (gameState.twoPlayerMode) {
            // 雙人模式顯示兩個玩家的分數和總分
            const player1ScoreText = this.add.text(400, 250, `玩家1分數: ${this.gameState.player1Score}`, { fontSize: '24px', fill: '#ffffff' });
            player1ScoreText.setOrigin(0.5);
            
            const player2ScoreText = this.add.text(400, 280, `玩家2分數: ${this.gameState.player2Score}`, { fontSize: '24px', fill: '#ffffff' });
            player2ScoreText.setOrigin(0.5);
            
            const finalScoreText = this.add.text(400, 310, `總分數: ${this.gameState.totalScore}`, { fontSize: '28px', fill: '#ffff00' });
            finalScoreText.setOrigin(0.5);
        } else {
            // 單人模式只顯示一個分數
            const finalScoreText = this.add.text(400, 250, `最終分數: ${this.gameState.player1Score}`, { fontSize: '28px', fill: '#ffffff' });
            finalScoreText.setOrigin(0.5);
        }
        
        // 3秒後顯示遊戲結束畫面
        this.time.delayedCall(3000, () => {
            showGameOver();
        });
    }
}
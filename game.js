let currency = 0;
let gems = 0;
let centralTower;
let enemies = [];
let gameLoop;
let damageMultiplier = 1;
let score = 0;

const canvas = document.getElementById('gameCanvas');
const scorer = document.getElementById('score');
const scores1 = 'Score: ';
const ctx = canvas.getContext('2d');

class CentralTower {
    constructor() {
        this.x = canvas.width / 2;
        this.y = canvas.height / 2;
        this.radius = 30;
        this.health = 100;
        this.maxHealth = 100;
        this.damage = 1;
        this.range = 200;
        this.lastAttack = 0;
        this.attackCooldown = 500; // Attack every 0.5 seconds
    }

    draw() {
        // draw tower
        ctx.fillStyle = 'blue';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();

        // range circle
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.range, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(0, 0, 255, 0.2)';
        ctx.stroke();

        // health bar
        const healthBarWidth = 100;
        const healthBarHeight = 10;
        ctx.fillStyle = 'red';
        ctx.fillRect(this.x - healthBarWidth / 2, this.y - this.radius - 20, healthBarWidth, healthBarHeight);
        ctx.fillStyle = 'green';
        ctx.fillRect(this.x - healthBarWidth / 2, this.y - this.radius - 20, healthBarWidth * (this.health / this.maxHealth), healthBarHeight);
    }

    attack(currentTime) {
        if (currentTime - this.lastAttack < this.attackCooldown) return;

        for (let enemy of enemies) {
            if (this.isInRange(enemy)) {
                enemy.takeDamage(this.damage * damageMultiplier);
                this.lastAttack = currentTime;

                // attack line
                ctx.beginPath();
                ctx.moveTo(this.x, this.y);
                ctx.lineTo(enemy.x, enemy.y);
                ctx.strokeStyle = 'yellow';
                ctx.stroke();

                break;
            }
        }
    }

    isInRange(enemy) {
        const dx = this.x - enemy.x;
        const dy = this.y - enemy.y;
        return Math.sqrt(dx * dx + dy * dy) <= this.range;
    }

    takeDamage(amount) {
        this.health -= amount;
        if (this.health <= 0) {
            alert('Game Over! The central tower has been destroyed.');
            clearInterval(gameLoop);
        }
    }
}

class Enemy {
    constructor() {
        this.angle = Math.random() * Math.PI * 2;
        this.x = canvas.width / 2 + Math.cos(this.angle) * (Math.max(canvas.width, canvas.height) / 2);
        this.y = canvas.height / 2 + Math.sin(this.angle) * (Math.max(canvas.width, canvas.height) / 2);
        this.health = 10;
        this.maxHealth = 10;
        this.speed = 0.5;
        this.damage = 1;
        this.attackCooldown = 1000;
        this.lastAttack = 0;
    }

    draw() {
        ctx.fillStyle = 'red';
        ctx.beginPath();
        ctx.arc(this.x, this.y, 10, 0, Math.PI * 2);
        ctx.fill();

        // health bar
        ctx.fillStyle = 'green';
        ctx.fillRect(this.x - 15, this.y - 20, 30 * (this.health / this.maxHealth), 5);
    }

    move() {
        const dx = centralTower.x - this.x;
        const dy = centralTower.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > centralTower.radius) {
            this.x += (dx / distance) * this.speed;
            this.y += (dy / distance) * this.speed;
        } else {
            this.attack();
        }
    }

    attack() {
        const currentTime = Date.now();
        if (currentTime - this.lastAttack >= this.attackCooldown) {
            centralTower.takeDamage(this.damage);
            this.lastAttack = currentTime;
        }
    }

    takeDamage(amount) {
        this.health -= amount;
        if (this.health <= 0) {
            this.die();
        }
    }

    die() {
        const index = enemies.indexOf(this);
        if (index > -1) {
            enemies.splice(index, 1);
            currency += 5; // reward for killing an enemy
            score++;
        }
    }
}

function spawnEnemy() {
    if (Math.random() < (0.01 + 0.01 * Math.floor(score / 20))) {
        enemies.push(new Enemy());
    }
}

function updateGame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const currentTime = Date.now();

    // update central tower
    centralTower.draw();
    centralTower.attack(currentTime);

    // update enemies
    enemies.forEach((enemy, index) => {
        enemy.draw();
        enemy.move();
    });

    spawnEnemy();

    // update currency (idle income)
    currency += 0.1;
    document.getElementById('currency').textContent = Math.floor(currency);
    document.getElementById('gems').textContent = gems;
    scorer.textContent = scores1 + score;
}

document.getElementById('upgradeTower').addEventListener('click', () => {
    if (currency >= 25) {
        currency -= 25;
        centralTower.damage += 0.5;
        centralTower.range += 10;
    }
});

document.getElementById('upgradeDamage').addEventListener('click', () => {
    if (currency >= 50) {
        currency -= 50;
        centralTower.damage += 1;  // Increase damage by 1
    }
});

document.getElementById('upgradeSpeed').addEventListener('click', () => {
    if (currency >= 75) {
        currency -= 75;
        centralTower.attackCooldown = centralTower.attackCooldown * 0.9; // Decrease cooldown by 10%
    }
});

document.getElementById('buyGems').addEventListener('click', () => {
    gems += 100;
});

document.getElementById('buyBooster').addEventListener('click', () => {
    if (gems >= 10) {
        gems -= 10;
        damageMultiplier = 2;
        setTimeout(() => { damageMultiplier = 1; }, 60000);
        alert('2x Damage Booster activated for 60 seconds!');
    }
});

document.getElementById('buySkin').addEventListener('click', () => {
    if (gems >= 50) {
        gems -= 50;
        alert('New tower skin unlocked!');
    }
});

centralTower = new CentralTower();
gameLoop = setInterval(updateGame, 1000 / 60);  // 60 FPS
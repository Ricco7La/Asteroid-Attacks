var width = window.innerWidth;
var height = window.innerHeight;


var game = new Phaser.Game(width, height, Phaser.AUTO, 'Asteroids Attacks', { preload: preload, create: create, update: update });

function preload() {

    game.load.image('stars', 'assets/starfield.jpg');
    //game.load.image('ship', 'assets/sprites/thrust_ship2.png');
    game.load.image('ship', 'assets/ship.png');
    game.load.image('bullet', 'assets/bullets.png');
    game.load.image('asteroid1', 'assets/asteroid1.png');
    game.load.image('asteroid2', 'assets/asteroid2.png');
    game.load.image('asteroid3', 'assets/asteroid3.png');

}

var ship;
var starfield;
var cursors;

var bullet;
var bullets;
var asteroid;
var asteroids;
var bulletTime = 0;

var shipPlayerCollisionGroup;
var bulletCollisionGroup;
var asteroidCollisionGroup;
var planetCollisionGroup;

function create() {

    game.physics.startSystem(Phaser.Physics.P2JS);
    game.physics.p2.setImpactEvents(true);
    game.physics.p2.defaultRestitution = 0.8;

    shipCollisionGroup = game.physics.p2.createCollisionGroup();
    bulletCollisionGroup = game.physics.p2.createCollisionGroup();
    asteroidCollisionGroup = game.physics.p2.createCollisionGroup();
    planetCollisionGroup = game.physics.p2.createCollisionGroup();

    game.world.setBounds(0, 0, 2.5 * width, 2.5 * height);

    game.physics.p2.updateBoundsCollisionGroup();

    starfield = game.add.tileSprite(0, 0, width, height , 'stars');
    starfield.fixedToCamera = true;

    //  Our ships bullets
    bullets = game.add.group();
    bullets.enableBody = true;
    //bullets.checkWorldBounds = true;
    bullets.physicsBodyType = Phaser.Physics.P2JS;

    //  All 400 of them
    //bullets.createMultiple(400, 'bullet');
    bullets.setAll('anchor.x', 0.5);
    bullets.setAll('anchor.y', 0.5);
    bullets.setAll('checkWorldBounds', true);
    bullets.setAll('outOfBoundsKill', true);
    /*bullets.setAll('body.setCollisionGroup', bulletCollisionGroup);
    bullets.setAll('body.collides', [asteroidCollisionGroup, planetCollisionGroup]);
    bullets.setAll('body.setRectangleFromSprite', 'bullet');*/

    // Our asteroid
    asteroids = game.add.group();
    asteroids.enableBody = true;
    asteroids.physicsBodyType = Phaser.Physics.P2JS;

    /*//  All 10 of them
    asteroids.createMultiple(10, 'asteroid1');
    asteroids.setAll('anchor.x', 0.5);
    asteroids.setAll('anchor.y', 0.5);*/

    asteroidGenerator(250, 250, 0, (3 * Math.PI / 2) );

    //  Our player ship
    ship = game.add.sprite(300, 300, 'ship');
    ship.anchor.set(0.5);
    
    game.physics.p2.enable(ship);
    ship.body.setRectangle(32,32);
    ship.body.setCollisionGroup(shipCollisionGroup);
    ship.body.collides([asteroidCollisionGroup, planetCollisionGroup]);


    game.camera.follow(ship);

    cursors = game.input.keyboard.createCursorKeys();
    game.input.keyboard.addKeyCapture([ Phaser.Keyboard.SPACEBAR ]);

}

function update() {

    if (cursors.left.isDown)
    {
        ship.body.rotateLeft(100);
    }
    else if (cursors.right.isDown)
    {
        ship.body.rotateRight(100);
    }
    else
    {
        ship.body.setZeroRotation();
    }

    if (cursors.up.isDown)
    {
        ship.body.thrust(200);
    }
    else if (cursors.down.isDown)
    {
        ship.body.reverse(200);
    }

    if (!game.camera.atLimit.x)
    {
        starfield.tilePosition.x -= (ship.body.velocity.x * game.time.physicsElapsed);
    }

    if (!game.camera.atLimit.y)
    {
        starfield.tilePosition.y -= (ship.body.velocity.y * game.time.physicsElapsed);
    }

    if (game.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR))
    {
        fireBullet();
    }


    
}


function fireBullet () {

    if (game.time.now > bulletTime)
        {
            
            var p1 = new Phaser.Point(ship.x, ship.y);
            var p2 = new Phaser.Point(ship.x, ship.y - 20);
            p2.rotate(p1.x, p1.y, ship.rotation, false);
            bullet = bullets.create(p2.x, p2.y, 'bullet');

            bullet.body.setRectangle(10,10);
            bullet.body.setCollisionGroup(bulletCollisionGroup);
            bullet.body.collides([asteroidCollisionGroup, planetCollisionGroup]);

            bullet.body.fixedRotation=true; 
            bullet.reset(p2.x, p2.y);
            bullet.lifespan = 10000;
            bullet.rotation = ship.rotation;

            console.log(bullet);

            // Frequence de tir
            bulletTime = game.time.now + 500;


            var speed = 500;

            bullet.body.velocity.x = Math.sin(ship.rotation) * speed;
            bullet.body.velocity.y = -Math.cos(ship.rotation) * speed;

            
        }

}

function asteroidGenerator (x, y, velocity, angle) {

            asteroid = asteroids.create(x, y, 'asteroid1');
            asteroid.body.fixedRotation=true; 
            asteroid.lifespan = 60000;

            asteroid.body.velocity.x = Math.sin(angle) * velocity;
            asteroid.body.velocity.y = -Math.cos(angle) * velocity;
            asteroid.body.setRectangleFromSprite('asteroid1');
            asteroid.body.setCollisionGroup(asteroidCollisionGroup);
            asteroid.body.collides([asteroidCollisionGroup, bulletCollisionGroup, planetCollisionGroup, shipCollisionGroup]);

}
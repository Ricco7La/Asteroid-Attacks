var width = window.innerWidth;
var height = window.innerHeight;


var game = new Phaser.Game(width, height, Phaser.AUTO, 'Asteroids Attacks', { preload: preload, create: create, update: update });

function preload() {

    game.load.image('stars', 'assets/starfield.jpg');
    //game.load.image('ship', 'assets/sprites/thrust_ship2.png');
    game.load.image('ship', 'assets/ship.png');
    game.load.image('bullet', 'assets/bullets.png');

}

var ship;
var starfield;
var cursors;

var bullet;
var bullets;
var bulletTime = 0;

function create() {

    game.world.setBounds(0, 0, 2.5 * width, 2.5 * height);

    game.physics.startSystem(Phaser.Physics.P2JS);
    game.physics.p2.defaultRestitution = 0.8;

    starfield = game.add.tileSprite(0, 0, width, height , 'stars');
    starfield.fixedToCamera = true;

    //  Our ships bullets
    bullets = game.add.group();
    bullets.enableBody = true;
    bullets.physicsBodyType = Phaser.Physics.P2JS;

    //  All 400 of them
    bullets.createMultiple(400, 'bullet');
    bullets.setAll('anchor.x', 0.5);
    bullets.setAll('anchor.y', 0.5);

        //  Our player ship
    ship = game.add.sprite(300, 300, 'ship');
    ship.anchor.set(0.5);

    game.physics.p2.enable(ship);

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
            bullet = bullets.getFirstExists(false);
            var p1 = new Phaser.Point(ship.x, ship.y);
            var p2 = new Phaser.Point(ship.x, ship.y - 20);
            p2.rotate(p1.x, p1.y, ship.rotation, false);

            if (bullet)
            {
                bullet.body.fixedRotation=true; 
                bullet.reset(p2.x, p2.y);
                bullet.lifespan = 10000;
                bullet.rotation = ship.rotation;

                console.log(bullets);

                // Frequence de tir
                bulletTime = game.time.now + 500;

                var speed = 1000;

                bullet.body.velocity.x = Math.sin(ship.rotation) * speed;
                bullet.body.velocity.y = -Math.cos(ship.rotation) * speed;

                bullet.onEnterBounds = function(e) {
                    console.log('test');
                }
            }
        }

}
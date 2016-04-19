var width = window.innerWidth;
var height = window.innerHeight;
var mapWidth = 2.5 * width;
var mapHeight = 2.5 * height;

var DebugMode = true;

var game = new Phaser.Game(width, height, Phaser.AUTO, 'Asteroids Attacks', { preload: preload, create: create, update: update });

function preload() {

    game.load.image('stars', 'assets/starfield.jpg');
    //game.load.image('ship', 'assets/sprites/thrust_ship2.png');
    game.load.image('ship', 'assets/ship.png');
    game.load.image('bullet', 'assets/bullets.png');
    game.load.image('asteroid1', 'assets/asteroid1.png');
    game.load.image('asteroid2', 'assets/asteroid2.png');
    game.load.image('asteroid3', 'assets/asteroid3.png');
    game.load.image('mainPlanet','assets/planet_7.png');

    //  Load our physics data exported from PhysicsEditor
    game.load.physics('physicsDataShip', 'assets/ship.json');

}

var destroyedAsteroid= 0;
var countAsteroid;

var ship;
var starfield;
var cursors;

var bullet;
var bullets;
var asteroid;
var asteroids;
var planet;
var planets;
var bulletTime = 0;

var shipPlayerCollisionGroup;
var bulletCollisionGroup;
var asteroidCollisionGroup;
var planetCollisionGroup;

function create() {
    game.world.setBounds(0, 0, mapWidth, mapHeight);
    game.physics.startSystem(Phaser.Physics.P2JS);
    game.physics.p2.setImpactEvents(true);
    game.physics.p2.defaultRestitution = 1;
    game.physics.p2.friction = 0;
    game.physics.p2.applyGravity = false;

    shipCollisionGroup = game.physics.p2.createCollisionGroup();
    bulletCollisionGroup = game.physics.p2.createCollisionGroup();
    asteroidCollisionGroup = game.physics.p2.createCollisionGroup();
    planetCollisionGroup = game.physics.p2.createCollisionGroup();

    

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
    /*
    bullets.setAll('body.setCollisionGroup', bulletCollisionGroup);
    bullets.setAll('body.collides', [asteroidCollisionGroup, planetCollisionGroup]);
    */

    // Our asteroid
    asteroids = game.add.group();
    asteroids.enableBody = true;
    asteroids.physicsBodyType = Phaser.Physics.P2JS;


    // Our Planets
    planets = game.add.group();
    planets.enableBody = true;
    planets.physicsBodyType = Phaser.Physics.P2JS;

    // creation Asteroids
    countAsteroid = 8;
    asteroidGenerator(250, 250, 400, (3 * Math.PI / 4) );
    asteroidGenerator(mapWidth - 250, 250, 400, (5 * Math.PI / 4) );
    //asteroidGenerator(250, mapHeight/2, 700, (Math.PI / 2) );
    asteroidGenerator(250, mapHeight -250, 300, (1 * Math.PI / 4) );
    asteroidGenerator(mapWidth/4 - 250, 2*mapHeight/4 -25, 100, (1 * Math.PI / 4) );
    //asteroidGenerator(2*mapWidth/4 - 250, 2*mapHeight/4 -250, 111, (2 * Math.PI / 4) );
    asteroidGenerator(3*mapWidth/4 - 250, 2*mapHeight/4 -250, 111, (3 * Math.PI / 4) );
    asteroidGenerator(mapWidth/4 - 250, 3*mapHeight/4 -250, 400, (4 * Math.PI / 4) );
    asteroidGenerator(2*mapWidth/4 - 250, 3*mapHeight/4 -250, 400, (5 * Math.PI / 4) );
    asteroidGenerator(3*mapWidth/4 - 250, 3*mapHeight/4 -250, 400, (6 * Math.PI / 4) );



    //creation planets
    planetGenerator(mapWidth/2,mapHeight/2, 100000000, 'mainPlanet');

    //  Our player ship
    ship = game.add.sprite(400, 800, 'ship');
    ship.anchor.set(0.5);
    
    game.physics.p2.enable(ship);
    //ship.body.setRectangle(32,32);

    //  Clear the shapes and load the 'ship' polygon from the physicsDataShip JSON file
    ship.body.clearShapes();
    ship.body.loadPolygon('physicsDataShip', 'ship');

    ship.body.setCollisionGroup(shipCollisionGroup);
    ship.body.collides([asteroidCollisionGroup, planetCollisionGroup]);

    ship.body.debug = DebugMode;

    game.camera.follow(ship);

    accelerateToObject(ship,planet);

    cursors = game.input.keyboard.createCursorKeys();
    game.input.keyboard.addKeyCapture([ Phaser.Keyboard.SPACEBAR ]);

}

function update() {

    if (cursors.left.isDown)
    {
        ship.body.rotateLeft(75);
    }
    else if (cursors.right.isDown)
    {
        ship.body.rotateRight(75);
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

    if (destroyedAsteroid == countAsteroid) {
        Win();
        destroyedAsteroid = 0;
    }
    
}


function fireBullet () {

    if (game.time.now > bulletTime)
        {
            
            var p1 = new Phaser.Point(ship.x, ship.y);
            var p2 = new Phaser.Point(ship.x, ship.y - 20);
            p2.rotate(p1.x, p1.y, ship.rotation, false);
            bullet = bullets.create(p2.x, p2.y, 'bullet');

            bullet.body.debug = DebugMode;

            bullet.body.setCircle(4);
            bullet.body.setCollisionGroup(bulletCollisionGroup);
            bullet.body.collides([asteroidCollisionGroup, planetCollisionGroup]);

            bullet.body.fixedRotation=true; 
            bullet.reset(p2.x, p2.y);
            bullet.lifespan = 10000;
            bullet.rotation = ship.rotation;
            bullet.body.collideWorldBounds = false;

            //console.log(bullet);

            // Frequence de tir
            bulletTime = game.time.now + 500;


            var speed = 750;

            bullet.body.velocity.x = Math.sin(ship.rotation) * speed;
            bullet.body.velocity.y = -Math.cos(ship.rotation) * speed;

            
        }

}

function asteroidGenerator (x, y, velocity, angle) {

            asteroid = asteroids.create(x, y, 'asteroid'+ rndIntRange(1,3));
            asteroid.body.fixedRotation=true; 
            asteroid.lifespan = 60000;


            asteroid.body.velocity.x = Math.sin(angle) * velocity;
            asteroid.body.velocity.y = -Math.cos(angle) * velocity;
            asteroid.body.setCircle(16);

            asteroid.body.debug = DebugMode;

            asteroid.body.setCollisionGroup(asteroidCollisionGroup);
            asteroid.body.collides(asteroidCollisionGroup);

            //  The asteroid will collide with the bullet, and when it strikes one the hitBullet callback will fire
            asteroid.body.collides(bulletCollisionGroup, hitBulletFromAsteroid, this);
            asteroid.body.collides(planetCollisionGroup, hitPlanetFromAsteroid, this);
            asteroid.body.collides(shipCollisionGroup, hitShipFromAsteroid, this);

}

function planetGenerator (x, y,mass, sprite) {

            planet = planets.create(x, y,sprite);
            planet.body.fixedRotation=true; 

            planet.body.setCircle(planet.width / 2);
            console.log(planet.width);

            planet.body.debug = DebugMode;

            planet.body.setCollisionGroup(planetCollisionGroup);

            planet.body.mass = mass;

            //  The planet will collide with the bullet, and when it strikes one the hitBullet callback will fire
            planet.body.collides(bulletCollisionGroup, hitBulletFromPlanet, this);
            planet.body.collides(asteroidCollisionGroup);
            planet.body.collides(shipCollisionGroup, hitShipFromPlanet, this);

}


/*************************
    Utils
**************************/

function rndRange (min, max){
    return min + (Math.random() * (max - min));
}
function rndIntRange (min, max){
    return Math.round(rndRange(min, max));
}

function Lose () {
     setTimeout(function function_name (argument) {
         alert("You Lose");  
    }, 250);
}

function Win () {
     setTimeout(function function_name (argument) {
         alert("You Win");  
    }, 250); 
}

/*************************
        CallBacks
**************************/
 
// body 1 : caller, body2 : object hitted
function hitBulletFromAsteroid (body1, body2) {
    destroyedAsteroid++;
    body1.sprite.kill();
    body2.sprite.kill();
}
function hitShipFromAsteroid (body1, body2) {
    body1.sprite.kill();
    body2.sprite.kill();
    Lose();
    
}
function hitPlanetFromAsteroid (body1, body2) {
    body1.sprite.kill();
    body2.sprite.kill();
    Lose();
}

function hitBulletFromPlanet (body1, body2) {
    body2.sprite.kill();
}
function hitShipFromPlanet (body1, body2) {
    body2.sprite.kill();
    Lose();
}

function accelerateToObject(obj1, obj2, speed) {
    if (typeof speed === 'undefined') { speed = 20; }
    var angle = Math.atan2(obj2.y - obj1.y, obj2.x - obj1.x);
    obj1.body.rotation = angle + game.math.degToRad(180);  // correct angle of angry bullets (depends on the sprite used)
    obj1.body.velocity.x = Math.cos(angle) * speed;    // accelerateToObject 
    obj1.body.velocity.y = Math.sin(angle) * speed;
}


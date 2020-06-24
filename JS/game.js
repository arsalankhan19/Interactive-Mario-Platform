let config = {
    type : Phaser.AUTO,
    
    scale : {
        mode : Phaser.Scale.FIT,
        width : 800,
        height : 600,   
    },
    
    backgroundColor : 0xffff11,
    
    physics : {
        default : 'arcade',
        arcade : {
            gravity : {
                y : 1000
            },
            //debug : true,
        },
    },
    
    scene : {
        preload : preload,
        create : create,
        update : update
    }
};

let game = new Phaser.Game(config);

let player_config = {
    speed : 200,
    jump : -600,
};

function preload(){
    
    this.load.image("ground","Assets/topground.png");
    this.load.image("sky","Assets/background.png");
    this.load.spritesheet("dude","Assets/dude.png",{frameWidth:32,frameHeight:48});
    this.load.image("apple","Assets/apple.png");
    this.load.image("ray","Assets/ray.png");
}

function create(){
    W = game.config.width;
    H = game.config.height;
    
    //adding tileSprite
    let ground = this.add.tileSprite(0,H-128,W,128,'ground');        //(x,y) image ka center is x and y par rakhna
    ground.setOrigin(0,0);      //iska ek tareeka ye bhi hai.
    
                                                          //ground.setPosition(64,H-64) one way to sort it out
                                                          //iska matlab ye hai ki image ka center in coordinates pe aa jaye
    
    //adding background
    background = this.add.sprite(0,0,'sky');
    background.setOrigin(0,0);
    background.displayWidth = W;
    background.depth = -1;
    
    //create rays on top of the background
    rays = [];
    for(let i=-10;i<=10;i++){
        let ray = this.add.sprite(W/2,H-120,'ray');
        ray.displayHeight = 1.5*H;
        ray.setOrigin(0.5,1);
        ray.alpha = 0.2;
        ray.angle = i*10;
        ray.depth = -1;
        rays.push(ray);
    }
    
    //console.log(rays);
    //adding tweens i.e. adding animations
    this.tweens.add({
        targets : rays,
        props : {
            angle : {
                value : '+=20',
            },
        },
        duration : 8000,
        repeat : -1
    });
    
    //create player
    this.player = this.physics.add.sprite(100,100,'dude',4);     //.physics add gravity
    
    this.physics.add.existing(ground,true);                          //adding physics to ground
    //ground.body.allowGravity = false;           //(,true) param had effect on collision between player and ground
    //ground.body.immovable = true;
    
    //adding a bouncing effect to player
    this.player.setBounce(0.3);
    //player should not move out of Game world
    this.player.setCollideWorldBounds(true);
    
    //player animations and movements
    this.anims.create({
        key : 'left',
        frames : this.anims.generateFrameNumbers('dude',{start:0,end:3}),
        frameRate : 10,             //no of frames
        repeat : -1                 //repeat infinitely
    });
    
    this.anims.create({
        key : 'center',
        frames : this.anims.generateFrameNumbers('dude',{start:4,end:4}),
        //frameRate : 15,      //no of frames , it displays a change in the movement of the player(feel free to modify)
        //repeat : -1                 //repeat infinitely
    });
    
    this.anims.create({
        key : 'right',
        frames : this.anims.generateFrameNumbers('dude',{start:5,end:8}),
        frameRate : 10,             //no of frames
        //repeat : -1                 //repeat infinitely
    });
    
    //keyboard input movements
    this.cursors = this.input.keyboard.createCursorKeys(); //standard func if u want to listen from keyboard u have to
                                                           //create object like this.
    //add a group of apples = physical objects
    let fruits = this.physics.add.group({
        key : "apple",
        repeat : 8,
        setScale : {x : 0.2,y : 0.2},
        setXY : {x : 10, y : 0, stepX : 100},
    });
    
    //create platforms
    let platforms = this.physics.add.staticGroup();
    platforms.create(550,150,"ground").setScale(2.0,0.5).refreshBody();
    platforms.create(200,250,"ground").setScale(2.0,0.5).refreshBody();
    platforms.create(500,375,"ground").setScale(2.0,0.5).refreshBody(); //it will inc the width and dec the height but the                                                                     //body shape will actually not change so to do that
                                                                        //we use bodyRefres                          //debug displays all necessary
    platforms.add(ground); //the other way of doing this is adding ground to platform as ground same functionality as                              //platform.                                             
    
    //adding bouncing effects to fruits
    fruits.children.iterate(function(f){
       f.setBounce(Phaser.Math.FloatBetween(0.4,0.7)); 
    });  
    
    //add a collision detection between player and ground,player and fruits
    this.physics.add.collider(platforms,this.player);
    //this.physics.add.collider(ground,fruits);          //after adding ground to platfrom we dont need this       
    this.physics.add.collider(platforms,fruits);
    this.physics.add.overlap(this.player,fruits,eatFruit,null,this);
    
    //create cameras
    this.cameras.main.setBounds(0,0,W,H);        //screen size
    this.physics.world.setBounds(0,0,W,H);       //Game World
    
    this.cameras.main.startFollow(this.player,true,true);
    //this.cameras.main.setZoom(1.5);       //Zoom in to the player
}                                                         

//setting image on the screen
//initially origin of the image is set at the center of the image.
//but by writing ground.setOrigin(0,0) we have shifted the origin to (0,0),all dist are measured from origin.

function update(){
    
    if(this.cursors.left.isDown){
        this.player.setVelocityX(-player_config.speed);        //it sets vel in only x dir otherwise setVelocity give it                                                          //both components
        this.player.anims.play('left',true);
    }
    
    else if(this.cursors.right.isDown){
        this.player.setVelocityX(player_config.speed);
        this.player.anims.play('right',true);
    }
    
    else{
        this.player.setVelocityX(0);
        this.player.anims.play('center',true);
    }
    
    //adding jumping ability to player , player should not jump in air so we may check its conatct with the ground
    
    if(this.cursors.up.isDown && this.player.body.touching.down){
        this.player.setVelocityY(player_config.jump);
    }
}

function eatFruit(player,fruit){
    fruit.disableBody(true,true);
}




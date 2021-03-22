/*=================================
=            Variables            =
=================================*/

/* Main Character Variabes */
var mario, bricks,clouds,mountains,enemyMushrooms,pipes,platforms,coins;

/* Control Variabes */
var control={
  up: "UP_ARROW", // 32=spaceBar
  left: 'LEFT_ARROW',
  right: 'RIGHT_ARROW',
  revive: 32
}

//Inner Game Status, Which Might Affect Game Balance Or Playability.
var gameConfig={
  
  //Start, Playing, Over
  status: "start", 
  
  //Initial Lives Of Mario
  initialLifes: 4,

  //Character Moves Speed
  moveSpeed: 5,
  enemyMoveSpeed: 1,

  //Gravity And Jump Speed For All The Characters
  gravity: 1,
  gravityEnemy: 10,
  jump:-15,

  //Character Starting Point
  startingPointX: 500,
  startingPointY: 0,

  //Default Canvas Size
  screenX:1240,
  screenY:336,

  //Scores
  timeScores: 0,
  scores: 0
}

/*=====  End Of Variables  ======*/

/*====================================
=            Game Status             =
====================================*/

function game(){

  instializeInDraw();
  moveEnvironment(mario);
  drawSprites();
  
  if(gameConfig.status==='start'){

    fill(0,0,0,150);
    rect(0,0,gameConfig.screenX,gameConfig.screenY);

    fill(255, 255, 255);
    textSize(40);
    textAlign(CENTER);
    text("Press Any Arrow Keys To Start And Play ", gameConfig.screenX/2, gameConfig.screenY/2);
    textSize(40);

    stroke(255);
    strokeWeight(7);
    noFill();

    changeGameStatud();
  }
  
  if(gameConfig.status==='play'){
    positionOfCharacter(mario);
    enemys(enemyMushrooms);
    checkStatus(mario);
    scores(mario);
    manualControl(mario);
  
    // Optional Control Version Of Game
     autoControl(mario);
  
  }

    //If Game Is Over 
  if(gameConfig.status==='gameover'){
    fill(0,0,0,150);
    rect(0,0,gameConfig.screenX,gameConfig.screenY);

    fill(255, 255, 255);
    textSize(40);
    textAlign(CENTER);
    text("GAME OVER", gameConfig.screenX/2, gameConfig.screenY/2+105);
    textSize(15);
    text("Press SPACE To Restart", gameConfig.screenX/2, gameConfig.screenY/2+135);
    textSize(40);
    text(round(gameConfig.scores),gameConfig.screenX/2,gameConfig.screenY/2-35);
    text("Points",gameConfig.screenX/2,gameConfig.screenY/2);

    stroke(255);
    strokeWeight(7);
    noFill();
    ellipse(gameConfig.screenX/2,gameConfig.screenY/2-30,160,160)
    changeGameStatud(mario)
  }
}  

// Change Game Status If Any Key Is Pressed
function changeGameStatud(character){
  if((keyDown(control.up) ||keyDown(control.left)||keyDown(control.right) )&& gameConfig.status==="start") {
    world_start.play();
    initializeCharacterStatus(mario);
    gameConfig.status= "play";
  }
  if(gameConfig.status==="gameover" && keyDown(control.revive)) {
    gameConfig.status= "start";        
  }
}

/*=====  End Of Game Status   ======*/

/*=============================================
=                 Instialize                  =
=============================================*/

//Initialize
function instializeInSetup(character){
	frameRate(120);
	
	character.scale=0.35;
	initializeCharacterStatus(character)

  bricks.displace(bricks);
	platforms.displace(platforms);
	coins.displace(coins);
	coins.displace(platforms);
	coins.collide(pipes);
	coins.displace(bricks);		

  //Change The Scale Of Clouds
	clouds.forEach(function(element){
		element.scale=random(1,2);
	})
}

function initializeCharacterStatus(character){
  //Set Up The Initial Config Of Character  
  character.scale=0.35;
  character["killing"]=0; //While Is Killing Enemy
  character["kills"]=0;
  character["live"]=true;
  character["liveNumber"]=gameConfig.initialLifes;
  character["status"]='live';
  character["coins"]=0;
  character["dying"]=0;
  character.position.x=gameConfig.startingPointX;
  character.position.y=gameConfig.startingPointY;
}

function instializeInDraw(){
  background(109,143,252);
  
  //While Killing
  if(mario.killing>0){
    mario.killing-=1;
  }else{
    mario.killing=0;
  }
  
  //Make Objects Not Overlap Each Other.
  pipes.displace(pipes);
  enemyMushrooms.displace(enemyMushrooms);
  enemyMushrooms.collide(pipes);
  clouds.displace(clouds);

  //Make Character Not Overlap Other Objects
  if(mario.live){
    bricks.displace(mario);
    pipes.displace(mario);
    enemyMushrooms.displace(mario);
    platforms.displace(mario);
  }
  
  //Character Config Initialize
  mario["standOnObj"]=false;
  mario.velocity.x=0;
  mario.maxSpeed=20;

}

/*=====       End Of Instialize        ======*/

/*============================================
=            Interactive Elements            =
============================================*/

// Character Get Coins
function getCoins(coin,character){
  if( character.overlap(coin) && character.live && coin.get==false){
    character.coins+=1;
    coin.get=true;
  };
}
    
// Reappear Coin After Coin Is Got.
function coinVanish(coin){
  if(coin.get){
    coin.position.x=random(50,gameConfig.screenX)+gameConfig.screenX;
    coin.get=false;
  };
}

/*=====  End Of Interactive Elements  ======*/

/*=============================================
=    Main Character Setting And Control       =
=============================================*/

/* Make Main Character Standing On Objs */
function positionOfCharacter(character){
  
  // Not On The Platform
  if(character.live){
    
    // See If Standing On Bricks
    platforms.forEach(function(element){ standOnObjs(character,element); });
    bricks.forEach(function(element){ standOnObjs(character,element); });
    pipes.forEach(function(element){ standOnObjs(character,element); });
    
    // Character Affected By Gravity
    falling(character);

    // If Character Can Only Jump If Standing On The Object
    if(character.standOnObj) jumping(character);
      
  }

  // Coins Interaction Event
  coins.forEach(function(element){
    getCoins(element,mario);
    coinVanish(element);
  });

  // EnemyMushrooms Interaction Event
  enemyMushrooms.forEach(function(element){
    StepOnEnemy(character,element);
    if((element.touching.left||element.touching.right)&&character.live&&character.killing===0) die(mario);
    
  })

  // Make It Stay In The Screen
  dontGetOutOfScreen(mario);

}

/* Auto Moving Character  */
function autoControl(character){
    character.velocity.x+=gameConfig.moveSpeed;
    character.changeAnimation('move');
    character.mirrorX(1);
}

/* Manual Control Character */
function manualControl(character){
  
  if(character.live){
    if(keyDown(control.left)){
      character.velocity.x-=gameConfig.moveSpeed;
      character.changeAnimation('move');
      character.mirrorX(-1);
    }

    if(keyDown(control.right)){
      character.velocity.x+=gameConfig.moveSpeed;
      character.changeAnimation('move');
      character.mirrorX(1);
    }

    if(!keyDown(control.left)&&!keyDown(control.right)&&!keyDown(control.up)){ 
      character.changeAnimation('stand');
    }
  }
 
}

/* Movements Of Character */
function jumping(character){
	if( (keyWentDown(control.up)&&character.live) || (touchIsDown&&character.live) ){
		character.velocity.y+=gameConfig.jump;
	}
}

/* Movements Of Character */
function falling(character){
	character.velocity.y += gameConfig.gravity;
  character.changeAnimation('jump');
}

/* See If Obj1 Stand On Obj2, Mainly For See If Standing On The Objcs*/
function standOnObjs(obj1,obj2){
  
	var obj1_Left=leftSide(obj1);
	var obj1_Right=rightSide(obj1);
	var obj1_Up=upSide(obj1);
	var obj1_Down=downSide(obj1);

	var obj2_Left=leftSide(obj2);
	var obj2_Right=rightSide(obj2);
	var obj2_Up=upSide(obj2);
	var obj2_Down=downSide(obj2);

	if(obj1_Right>=obj2_Left&&obj1_Left<=obj2_Right && obj1_Down<=obj2_Up+7 && obj1_Down>=obj2_Up-7){
		// println("YES");
		obj1.velocity.y = 0;
		obj1.position.y=obj2_Up-(obj1.height/2)-1;
		obj1.standOnObj= true;
	}
}

/* See If  Obj1 Step On Obj2 To Kill It*/
function StepOnEnemy(obj1,obj2){
  
	var obj1_Left=leftSide(obj1);
	var obj1_Right=rightSide(obj1);
	var obj1_Up=upSide(obj1);
	var obj1_Down=downSide(obj1);

	var obj2_Left=leftSide(obj2);
	var obj2_Right=rightSide(obj2);
	var obj2_Up=upSide(obj2);
	var obj2_Down=downSide(obj2);

	if(obj1_Right>=obj2_Left&&obj1_Left<=obj2_Right && obj1_Down<=obj2_Up+7 && obj1_Down>=obj2_Up-7 && obj2.live==true && obj2.touching.top){
		obj2.live=false;
    obj1.killing=30;
    obj1.kills++;
    if(obj1.velocity.y>=gameConfig.jump*0.8){
      obj1.velocity.y=gameConfig.jump*0.8;
    }else{
      obj1.velocity.y+=gameConfig.jump*0.8;
    }
	}
}

//Make Character Die If He Touched By Enemy
function die(character){
    character.live=false;
    character.dying+=120;
    character.liveNumber--;
    character.status="dead";
    character.changeAnimation('dead');
    character.velocity.y-=2;
}

//Check Character Status And Response To Sprite And Game Status
function checkStatus(character){    
  if(character.live==false){
    character.changeAnimation('dead');
    character.dying-=1;
    reviveAfterMusic(character);
  }
  if(character.live==false && character.liveNumber==0){
    gameConfig.status="gameover"
  }

}

//Revive After Dying Music Finished
function reviveAfterMusic(character){
  if( character.live === false && mario.liveNumber !==0 && character.dying===0 ){
    character.live=true;
    character.status="live";
    character.position.x=500;
    character.position.y=40;
    character.velocity.y=0;
  }
}

/* Make Character Stay In Screen */
function dontGetOutOfScreen(character){
  
  //If Mario Drop In The Holes 
  if(character.position.y>gameConfig.screenY&&character.live && character==mario){
  	die(mario);
  }

  if(character.position.x>gameConfig.screenX-(character.width*0.5)){
  	character.position.x=gameConfig.screenX-(character.width*0.5);
  }else if(character.position.x<character.width*0.5){
    if(character==mario){
      character.position.x=character.width*0.5;
    }else{ 
      character.live=false; 
    }
  }

}

/*=====  End Of Main Character Setting And Control ======*/

/*=============================================
=          Enemy Setting And Control          =
=============================================*/

function enemys(enemys){
    enemys.forEach(function(enemy){
      stateOfEnemy(enemy);
	    positionOfEnemy(enemy);
	    enemy.position.x-=gameConfig.enemyMoveSpeed;
  });
} 

// Check Enemy Status
function stateOfEnemy(enemy){
  if (enemy.live==false||enemy.position.y>gameConfig.screenY+50){
    enemy.position.x=random(gameConfig.screenX*1.5,2*gameConfig.screenX+50);
    enemy.position.y=random(gameConfig.screenY*0.35,gameConfig.screenY*0.75);
    enemy.live=true;
  }
}

/* Make Enemy Standing On Objs */
function positionOfEnemy(enemy){

	platforms.forEach(function(element){ enemyStandOnObjs(enemy, element); });
	bricks.forEach(function(element){ enemyStandOnObjs(enemy, element);});
  pipes.forEach(function(element){ enemyStandOnObjs(enemy, element); })
	
	enemy.position.y+=gameConfig.gravityEnemy;

	dontGetOutOfScreen(enemy);
}

/* See If Obj1 Stand On Obj2, Mainly For See If Standing On The Objcs*/
function enemyStandOnObjs(obj1,obj2){
  
  var obj1_Left=leftSide(obj1);
  var obj1_Right=rightSide(obj1);
  var obj1_Up=upSide(obj1);
  var obj1_Down=downSide(obj1);

  var obj2_Left=leftSide(obj2);
  var obj2_Right=rightSide(obj2);
  var obj2_Up=upSide(obj2);
  var obj2_Down=downSide(obj2);

  if(obj1_Right>=obj2_Left&&obj1_Left<=obj2_Right && obj1_Down<=obj2_Up+7 && obj1_Down>=obj2_Up-7){
    // println("YES");
    obj1.velocity.y = 0;
    obj1.position.y=obj2_Up-(obj1.height);
  }
}

/*=====  End Of Enemy Setting And Control ======*/

/*===================================
=            Environment            =
===================================*/

//Call All Environment Scroll Functions 
function moveEnvironment(character){
  var environmentScrollingSpeed=gameConfig.moveSpeed*0.3; 
  
  if(gameConfig.status==='play'){
    environmentScrolling(platforms,environmentScrollingSpeed);
    environmentScrolling(bricks,environmentScrollingSpeed);
    environmentScrolling(clouds,environmentScrollingSpeed*0.5);
    environmentScrolling(mountains,environmentScrollingSpeed*0.3); 
    environmentScrolling(pipes,environmentScrollingSpeed); 
    environmentScrolling(coins,environmentScrollingSpeed); 
    environmentScrolling(enemyMushrooms,environmentScrollingSpeed); 
    character.position.x-=environmentScrollingSpeed;
  }
}

//Scroll Different Element In The Screen
function environmentScrolling(group,environmentScrollingSpeed){
  group.forEach(function(element){
    if(element.position.x>-50){
      element.position.x-=environmentScrollingSpeed;
    }else{
      element.position.x=gameConfig.screenX+50;
      
      //If Group Is Bricks, Randomize Its y Position
      if(group===bricks){
        element.position.y=random(gameConfig.screenY*0.35,gameConfig.screenY*0.75);
      }

      //If Group Is Bricks Or Mountains, Randomize Its x Position
      if(group===pipes||group===mountains){
        element.position.x=random(50,gameConfig.screenX)+gameConfig.screenX;
      }

      //If Group Is Clouds, Randomize Its x & y Position
      if(group===clouds){
        element.position.x=random(50,gameConfig.screenX)+gameConfig.screenX;
        element.position.y=random(0,gameConfig.screenY*0.5);
        element.scale=random(0.3,1.5);
      }

      if(group===coins){
        element.position.x=random(0,gameConfig.screenX)+gameConfig.screenX;
        element.position.y=random(gameConfig.screenY*0.2,gameConfig.screenY*0.8);
      }

    }

  })
}

/*=====  End Of Environment  ======*/


/*=====================================
=            For Debugging            =
=====================================*/

/* For Position State Of Character */
function debugging(character){
	strokeWeight(1);
	fill(255);
	textSize(12);
  text(character.dying, 20,20);
	text(gameConfig.status, 20,80);
	// text("V: "+character.velocity.y,150,20);
	noFill();
	// outline(tube01);
	stroke(251);
	strokeWeight(2);
	outline(character);

	pipes.forEach(function(element){ outline(element); });
  enemyMushrooms.forEach(function(element){ outline(element); });

}

//Calculate Scores Of Every Game
function scores(character){

  strokeWeight(0);
  fill(255, 255, 255, 71);
  textSize(40);

  gameConfig.scores=character.coins+character.kills+gameConfig.timeScores;

  if(character.live&&gameConfig.status==='play') gameConfig.timeScores+=0.05;
  
  text("Scores: "+round(gameConfig.scores),20,40);
  text("Lives: "+character.liveNumber,20,80);

  if(mario.live==false && mario.liveNumber!=0){
    fill(0,0,0,150);
    rect(0,0,gameConfig.screenX,gameConfig.screenY);
    
    strokeWeight(7);
    noFill();
    
    stroke(255);
    ellipse(gameConfig.screenX/2,gameConfig.screenY/2-30,150,150)

    stroke("red");
    var ratio=(character.liveNumber/gameConfig.initialLifes);
    arc(gameConfig.screenX/2,gameConfig.screenY/2-30,150,150, PI+HALF_PI,(PI+HALF_PI)+(TWO_PI*ratio));
    fill(255, 255, 255);
    noStroke();
    textAlign(CENTER);
    textSize(40);
    text(round(character.liveNumber),gameConfig.screenX/2,gameConfig.screenY/2-35);
    text("Lives",gameConfig.screenX/2,gameConfig.screenY/2);

  }

}

/* Make Outline Of Obj*/
function outline(obj){ rect(leftSide(obj),upSide(obj),rightSide(obj)-leftSide(obj),downSide(obj)-upSide(obj));}

/* Get Each Side Position Of Obj*/
function leftSide(obj){ return obj.position.x-(obj.width/2);}
function rightSide(obj){ return obj.position.x+(obj.width/2);}
function upSide(obj){ return obj.position.y-(obj.height/2);}
function downSide(obj){ return obj.position.y+(obj.height/2);}

/*=====  End Of For Debugging  ======*/
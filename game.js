const canvas = document.querySelector("canvas");
const scoreText = document.querySelector("#score");
const startBtn = document.querySelector("#startBtn");
const scoreBox = document.querySelector("#score-box");
const finalScore = document.querySelector("#final-score");

var audio = new Audio('./assets/pop.mp3');


let score=0



canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const c = canvas.getContext("2d");





class Player {
  constructor(x, y, radius, color) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    
  }
  

  draw() {
    c.beginPath();
    c.arc(this.x, this.y, this.radius, Math.PI * 2, false);
    c.fillStyle = this.color;
    c.fill();
    
  }
}



class Projectile {
  constructor(x, y, radius, color, velocity) {
    (this.x = x),
      (this.y = y),
      (this.radius = radius),
      (this.color = color),
      (this.velocity = velocity);
  }

  draw() {
    c.beginPath();
    c.arc(this.x, this.y, this.radius, Math.PI *2 , false);
    c.fillStyle = this.color;
    c.fill(); 
  }

  update() {
    this.draw();
    this.x = this.x + this.velocity.x;
    this.y = this.y + this.velocity.y;
  }
}

class Enemy {
  constructor(x, y, radius, color, velocity) {
    (this.x = x),
      (this.y = y),
      (this.radius = radius),
      (this.color = color),
      (this.velocity = velocity);
  }

  draw() {
    c.beginPath();
    c.arc(this.x, this.y, this.radius, Math.PI * 2, false);
    c.fillStyle = this.color;
    c.fill();
    
  }

  //this is to make them move
  update() {
    this.draw();
    this.x = this.x + this.velocity.x;
    this.y = this.y + this.velocity.y;
  }


}



const friction = 0.99;
class Particles {
  constructor(x, y, radius, color, velocity) {
    (this.x = x),
      (this.y = y),
      (this.radius = radius),
      (this.color = color),
      (this.velocity = velocity);
      this.alpha=1
  }

  draw() {
    c.save()  //This saved the state of that particle in canvas

    //Now we are going to make it fade out
    c.globalAlpha = this.alpha;  //this sets the alpha/opacity value of the particle   ref line 105
    c.beginPath();
    c.arc(this.x, this.y, this.radius, Math.PI * 2, false);
    c.fillStyle = this.color;
    c.fill();
    c.restore() //This restores the state of that particle in canvas
  }

  //this is to make them move
  update() {
    this.draw();
    this.velocity.x *= friction;
    this.velocity.y *= friction;
    this.x = this.x + this.velocity.x;
    this.y = this.y + this.velocity.y;
    this.alpha-=0.009  //when the alpha reches 0 it will make the particle reappear therefore we have to delete the particle ref line---------------------------------------------------------------------------------------------------------------
  }
}

let player = new Player(innerWidth / 2, innerHeight / 2, 10, "white");
let projectiles = [];
let enemies = [];
let particles = [];

function start(){
  player = new Player(innerWidth / 2, innerHeight / 2, 10, "white");
  projectiles = [];
  enemies = [];
  particles = [];
  score=0
  scoreText.innerHTML = score;
  
}

//This is for creating enemies and giving them direction
function spawnEnemies() {
  setInterval(
    () => {
      const radius = Math.random() * 35 + 18;

      let x;
      let y;

      if (Math.random() < 0.5) {
        //if enemy has above top or below bottom then
        x = Math.random() < 0.5 ? 0 - radius : innerWidth + radius;
        y = Math.random() * innerHeight;
      } else {
        x = Math.random() * innerWidth;
        y = Math.random() < 0.5 ? 0 - radius : innerHeight + radius;
      }

      //Getting the angle where the x and y cordinate are respect to origin(player)
      const angle = Math.atan2(innerHeight / 2 - y, innerWidth / 2 - x);

      //Getting the direction of x and y with the angle
      const velocity = {
        x: Math.cos(angle),
        y: Math.sin(angle),
      };

      //Creating a new enemy
      // const color = `rgb(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255})`;
      const color = `hsl(${Math.random() * 360}, 70%, 50%)`;
      enemies.push(new Enemy(x, y, radius, color, velocity));
    },

    1700
  );
}

let animationId;
function animate() {
  //This will start a animation loop and the id will have the id of the current frame  ref line 143
  animationId = requestAnimationFrame(animate);

  // clearing the screen after every animation call so that it doesnt give a long line
  c.fillStyle = "rgba(0, 0, 0, 0.1)"; //--This gives a long trial line behind animation
  c.fillRect(0, 0, innerWidth, innerHeight),
    //drawing the player again
    player.draw();

  //making projectiles push towards the pointed mark for each element of the array
  projectiles.forEach((projectile) => {
    projectile.update();

    //checking if the projectile is out of the screen and removing them
    if (
      projectile.x - projectile.radius > innerWidth ||
      projectile.x - projectile.radius < 0 ||
      projectile.y - projectile.radius > innerHeight ||
      projectile.y - projectile.radius < 0
    ) {
      projectiles.splice(projectiles.indexOf(projectile), 1);
    }
  });




//Making the particle animation  ref line 236 current=180
  particles.forEach(particle => {
    particle.update();
    if(particle.alpha<0){
      particles.splice(particles.indexOf(particle),1)
    }

    if (
      particle.x - particle.radius > innerWidth ||
      particle.x - particle.radius < 0 ||
      particle.y - particle.radius > innerHeight ||
      particle.y - particle.radius < 0
    ) {
      particles.splice(particles.indexOf(particle), 1);
    }
  })



  //Spawning enemies by calling each of them from the enemies array
  enemies.forEach((enemy, index) => {
    enemy.update();
    //Collision detection for the player and the enemy

    //If the distance between the player and the enemy is less than the radius of the player and enemy
    const playerDistance = Math.hypot(player.x - enemy.x, player.y - enemy.y);
    if (playerDistance - player.radius - enemy.radius < 0) {
      cancelAnimationFrame(animationId); //Stop the animation loop at this id
      finalScore.innerHTML = score;
      scoreBox.style.display='flex';
      
      
    }



    //If the distance between the projectile and the enemy is less than the radius of the projectile and enemy
    //Collision detection for the projectile and the enemy
    projectiles.forEach((projectile, projIndex) => {
      const distance = Math.hypot(
        projectile.x - enemy.x,
        projectile.y - enemy.y
      );

      //Check if the border of projectile and enemy is touching
      if (distance - projectile.radius - enemy.radius < 1) {

        //For shrinking the large enemies
        if (enemy.radius > 20) {
          
          score+=20
          scoreText.innerHTML = score;
          //For adding animation of ease in shrinking
          gsap.to(enemy, {
            radius: enemy.radius - 10,
          })

          for(let i=0;i<enemy.radius*2;i++){

            //-0.5 because x and y can be +ve and -ve
            const particle=new Particles(projectile.x, projectile.y, Math.random()*2+1, enemy.color, {x:(Math.random()-0.9)*Math.random()*5+1,y:(Math.random()-0.9)*Math.random()*5+1})
            // particle.draw()
            particles.push(particle);
          }
          projectiles.splice(projIndex, 1); //removing the projectile
        }else{
        setTimeout(() => {
          
          score+=10
          scoreText.innerHTML = score;


          //range is enemy radius because big enemy more particles
          for(let i=0;i<enemy.radius*2;i++){

            //-0.5 because x and y can be +ve and -ve
            const particle=new Particles(projectile.x, projectile.y, Math.random()*2+1, enemy.color, {x:(Math.random()-0.9)*Math.random()*5+1,y:(Math.random()-0.9)*Math.random()*5+1})
            // particle.draw()
            particles.push(particle);
          }
          
          




          audio.play()
          enemies.splice(index, 1); //removing the enemy
          projectiles.splice(projIndex, 1); //removing the projectile
        }, 0);
      }

      }
      //this can also be used to check touch
      // if (distance < enemy.radius + projectile.radius) {
      //   console.log("hit");
      // }
    });
  });
}

addEventListener("click", (event) => {
  //Getting the angle where the x and y cordinate are respect to origin(player)
  const angle = Math.atan2(
    event.clientY - innerHeight / 2,
    event.clientX - innerWidth / 2
  );

  //Getting the direction of x and y with the angle
  const velocity = {
    x: Math.cos(angle) * 6,
    y: Math.sin(angle) * 6,
  };

  projectiles.push(
    new Projectile(innerWidth / 2, innerHeight / 2, 3, "white", velocity)
  );
});
start()
  animate();
spawnEnemies();
scoreBox.style.display="none";
startBtn.addEventListener("click", () => {
  start()
  animate();
spawnEnemies();
scoreBox.style.display="none";



})



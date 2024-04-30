
// setup canvas
const canvas = document.getElementById('boidCanvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

class Boid {

	static seperateRadius = 20;
	static avoidFactor = 0.02;
	static visualRange = 120
	static alignmentFactor = 0.02;
	static cohesionFactor = 0.0005;
	static edgeAvoidance = .4
	static margin = 100;
	static minSpeed = 4;
	static maxSpeed = 6;

    constructor(x, y, direction) {
        this.x = x;
        this.y = y;
        this.velocity = {
            x : Math.cos(direction) * 5,
            y : Math.sin(direction) * 5
        };
		
		this.isHighlighted=false;
        // bird info
        this.rgb = [
            Math.floor(Math.random() * (80 - 40) + 40),
            Math.floor(Math.random() * (250 - 120) + 120),
            Math.floor(Math.random() * (190 - 150) + 150),
        ] // some range around (60,227,171)

        this.birdSize = 5;
        this.beakLength = this.birdSize * 2.5;
        this.beakThickness = this.birdSize / 2;
    }

    update() { 
        this.x += this.velocity.x;
        this.y += this.velocity.y;

        // // wrapping behavior
        // if (this.x > canvas.width) {
        //     this.x = 0;
        // } else if (this.x < 0) {
        //     this.x = canvas.width;
        // }
        
        // if (this.y > canvas.height) {
        //     this.y = 0;
        // } else if (this.y < 0) {
        //     this.y = canvas.height;
        // }
        
    }

    draw() {
        // body
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.fillStyle = `rgb(
                            ${this.rgb[0]},
                            ${this.rgb[1]},
                            ${this.rgb[2]}
                        )`;
        ctx.arc(this.x,this.y,this.birdSize,0,2*Math.PI);
        ctx.fill();

        // beak
        ctx.lineWidth=this.beakThickness
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        // ctx.lineTo(this.x+100, this.y+100);
        ctx.lineTo(this.x + this.beakLength*Math.cos(Math.atan2(this.velocity.y,this.velocity.x)),
                    this.y + this.beakLength*Math.sin(Math.atan2(this.velocity.y,this.velocity.x))
        );
        ctx.strokeStyle = `rgb(
                            ${this.rgb[0]},
                            ${this.rgb[1]},
                            ${this.rgb[2]}
                        )`
        ctx.stroke();

		// highlighting
		if (this.isHighlighted) {
			// seperate radius
			ctx.beginPath();
			ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
			ctx.arc(this.x, this.y, Boid.seperateRadius, 0, 2 * Math.PI);
			ctx.fill();
		}

    }
}

// add boid on click
function onClick(e) {
    boids.push(new Boid(e.clientX, e.clientY, Math.random() * 2 * Math.PI));
}

// Seperation: boids avoid running into other boids
// alignment: boids match velocity of other boids
// cohesion: steer toward center of mass of nearby flocks
function update(boids) {
    ctx.clearRect(0,0,canvas.width,canvas.height);

    for (boid of boids) {

        avoidVector = { x:0, y:0 };
		alignmentVector = { x:0, y:0 };
		neighborsAvgX = 0;
		neighborsAvgY = 0;

        neighbors = 0;
        // loop through other boids
        for (neighborBoid of boids) {
            
            if (neighborBoid === boid) continue;

            // distance to neighbor boid
            dx=boid.x-neighborBoid.x;
            dy=boid.y-neighborBoid.y;
            d = Math.sqrt(dx*dx + dy*dy);

            // if boid is in seperation radius
            if (d <= Boid.seperateRadius) {
                avoidVector.x += dx;
                avoidVector.y += dy;
            }
            // if boid is in visual range 
            else if (d <= Boid.visualRange) {
				// alignment vars
				alignmentVector.x += neighborBoid.velocity.x;
				alignmentVector.y += neighborBoid.velocity.y;
				
				// cohesion vars
				neighborsAvgX += neighborBoid.x;
				neighborsAvgY += neighborBoid.y;
				neighbors++;
			}
        }
		
		// seperation //
		boid.velocity.x += avoidVector.x * Boid.avoidFactor;
		boid.velocity.y += avoidVector.y * Boid.avoidFactor;

		if (neighbors > 0) {
			// alignment //
			alignmentVector.x /= neighbors;
			alignmentVector.y /= neighbors;

			boid.velocity.x += (alignmentVector.x - boid.velocity.x) * Boid.alignmentFactor;
			boid.velocity.y += (alignmentVector.y - boid.velocity.y) * Boid.alignmentFactor;

			// cohesion //
			neighborsAvgX /= neighbors;
			neighborsAvgY /= neighbors;

			boid.velocity.x += (neighborsAvgX - boid.x) * Boid.cohesionFactor;
			boid.velocity.y += (neighborsAvgY - boid.y) * Boid.cohesionFactor;
		}

		// edge avoidance
		if (boid.x < Boid.margin) {
			boid.velocity.x += Boid.edgeAvoidance;
		} else if (boid.x > canvas.width - Boid.margin) {
			boid.velocity.x -= Boid.edgeAvoidance;
		}

		if (boid.y < Boid.margin) {
			boid.velocity.y += Boid.edgeAvoidance;
		} else if ( boid.y > canvas.height-Boid.margin) {
			boid.velocity.y -= Boid.edgeAvoidance;
		}
        
        // # Calculate the boid's speed
		speed = Math.sqrt(boid.velocity.x*boid.velocity.x+ boid.velocity.y*boid.velocity.y);

		if (speed < Boid.minSpeed) {
			boid.velocity.x *= Boid.minSpeed / speed;
			boid.velocity.y *= Boid.minSpeed / speed
		} else if (speed > Boid.maxSpeed) {
			boid.velocity.x *= Boid.maxSpeed / speed; 
			boid.velocity.y *= Boid.maxSpeed / speed;
		}

        boid.update();
        boid.draw();
    }
}

function main() {
    
    addEventListener("click", onClick);

    let birdNumber = 200;
    boids = [];

    // generate 10 boids with random heading and pos
    for (let i = 0; i < birdNumber; i++) {
        x = Math.floor(Math.random() * canvas.width);
        y = Math.floor(Math.random() * canvas.height);
        direction = Math.random() * 2 * Math.PI;

        boids.push(new Boid(x, y, direction));
    }
	if (boids.length > 0) boids[0].isHighlighted = true;

    setInterval(update, 1000/60, boids);
}

main();
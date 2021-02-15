const height: number = 600;
const width: number = 800;
const trackLength: number = 1000;
const trackSamples: number = 5;
class Vector {
    private x: number;
    private y: number;

    public constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }
    public vadd(v: Vector): Vector {
        let x = this.x + v.x;
        let y = this.y + v.y;
        return new Vector(x, y);
    }
    public mul(n: number): Vector {
        let x = this.x * n;
        let y = this.y * n;
        return new Vector(x, y);
    }
    public div(n: number): Vector {
        let x = this.x / n;
        let y = this.y / n;
        return new Vector(x, y);
    }
    public distance(v: Vector): number {
        //distance = [(x1 - x2) ^ 2 + (y1 - y2) ^ 2] ^ 0.5
        let distance2 = (this.x - v.x) ** 2 + (this.y - v.y) ** 2;
        let distance = distance2 ** 0.5;
        return distance;
    }
    public clone(): Vector {
        return new Vector(this.x, this.y);
    }
    public oppositeX() {
        this.x = -this.x;
    }
    public oppositeY() {
        this.y = -this.y;
    }
    public setX(x: number) {
        this.x = x;
    }
    public setY(y: number) {
        this.y = y;
    }
    public getX(): number {
        return this.x;
    }
    public getY(): number {
        return this.y;
    }
    public string(): string {
        return "x:" + this.x + ", y:" + this.y;
    }
}

class Ball {
    private site: Vector;
    private color: string;
    private speed: Vector;
    private quality: number;
    private name: string;
    private radius: number;
    private track: boolean;

    private trackNums: number = 0;
    private tracks: Vector[] = new Array<Vector>();

    public constructor(name: string, site: Vector, speed: Vector, radius: number, quality: number, color: string, track: boolean) {
        this.name = name;
        this.site = site;
        this.color = color;
        this.speed = speed;
        this.quality = quality;
        this.radius = radius;
        this.track = track;
        if (this.track) {
            this.tracks.push(this.site.clone());
        }
    }

    public move() {
        if (this.trackNums % trackSamples == 0) {
            if (this.tracks.length > trackLength) {
                this.tracks.shift();
            }
            this.tracks.push(this.site.clone());
        }

        this.trackNums++;
        this.site = this.site.vadd(this.speed);
    }
    public crash(balls: Ball[]) {
        let that = this;
        //检查边框碰撞
        this.crashBorder();
        balls.forEach(function (ball: Ball) {
            if (ball.name == that.name) {
                return;
            }
            let distance: number = that.site.distance(ball.site);
            let body = that.radius + ball.radius;
            if (distance <= body) {
                //碰撞
                console.log("distance:", distance, ",body:", body, ball, that);
                that.doCrash(ball);
            }

        });
    }
    private crashBorder() {
        if (this.site.getX() + this.radius >= width) {
            this.speed.oppositeX();
            if (this.site.getX() + this.radius > width) {
                this.site.setX(width - this.radius);
            }
        } else if (this.site.getX() - this.radius <= 0) {
            this.speed.oppositeX();
            if (this.site.getX() - this.radius < 0) {
                this.site.setX(this.radius);
            }
        }
        if (this.site.getY() + this.radius >= height) {
            this.speed.oppositeY();
            if (this.site.getY() + this.radius > height) {
                this.site.setY(height - this.radius);
            }
        } else if (this.site.getY() - this.radius <= 0) {
            this.speed.oppositeY();
            if (this.site.getY() - this.radius < 0) {
                this.site.setY(this.radius);
            }
        }
    }

    private doCrash(ball: Ball) {
        //v1' = [v1 * (m1 - m2) + 2 * m2 * v2] / (m1 + m2)
        //v2' = [v2 * (m2 - m1) + 2 * m1 * v1] / (m1 + m2)
        let temp = this.speed.mul(this.quality - ball.quality).vadd(ball.speed.mul(2 * ball.quality));
        let newSpeed = temp.div(this.quality + ball.quality);
        this.speed = newSpeed;

    }

    public render(g: CanvasRenderingContext2D) {
        g.fillStyle = this.color;
        g.strokeStyle = this.color;
        g.beginPath();
        g.arc(this.site.getX(), this.site.getY(), this.radius, 0, Math.PI * 2, false);

        g.stroke();
        g.fill();

        if (this.track) {
            g.beginPath();
            let flag = true;
            this.tracks.forEach((t) => {
                if (flag) {
                    g.moveTo(t.getX(), t.getY());
                    flag = false;
                }
                g.lineTo(t.getX(), t.getY());
            })

            g.stroke();
        }

    }

    public clone(): Ball {
        return new Ball(this.name, this.site, this.speed, this.radius, this.quality, this.color, this.track);
    }
}

class Table {
    private balls: Ball[];
    private g: CanvasRenderingContext2D;
    public constructor(balls: Ball[], g: CanvasRenderingContext2D) {
        this.balls = balls;
        this.g = g;
    }
    public crashBalls() {
        let clonedBalls: Ball[] = new Array<Ball>();
        //创建克隆ball
        this.balls.forEach(ball => {
            clonedBalls.push(ball.clone());
        });
        //碰撞检查
        this.balls.forEach(ball => {
            ball.crash(clonedBalls);
        });
    }

    public updateStates() {
        this.crashBalls();
        this.balls.forEach(ball => {
            ball.move();
        });
    }

    public render() {
        let that = this;

        this.g.clearRect(0, 0, width, height);

        this.updateStates();
        this.balls.forEach(ball => {
            ball.render(that.g);
        });

        requestAnimationFrame(this.render.bind(this));
    }

    public start() {
        requestAnimationFrame(this.render.bind(this));
    }
}


let canvas = document.getElementById("canvas") as HTMLCanvasElement;
let context = canvas.getContext("2d");

let balls: Ball[] = [
    new Ball("球-1", new Vector(30, 30), new Vector(4, 4), 20, 2, "#00ff00", true),
    new Ball("球-2", new Vector(500, 200), new Vector(3, 0), 20, 2, "#00ffff", false),
    new Ball("球-3", new Vector(120, 80), new Vector(0, 4), 20, 2, "#0000ff", false),
    new Ball("球-4", new Vector(700, 40), new Vector(0, 8), 20, 2, "#f0f000", false),
    new Ball("球-5", new Vector(600, 140), new Vector(10, 0), 20, 2, "#fff000", false),
    new Ball("球-6", new Vector(500, 280), new Vector(0, 12), 20, 2, "#ff0f00", false),
    new Ball("球-7", new Vector(100, 140), new Vector(5, 0), 20, 2, "#ff00ff", false),
    new Ball("球-8", new Vector(240, 340), new Vector(0, 5), 20, 2, "#ff0fff", false),
    new Ball("球-9", new Vector(500, 120), new Vector(0, 4), 20, 2, "#ff0ff0", false),
]
let table: Table = new Table(balls, context);
table.start();

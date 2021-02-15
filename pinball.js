var height = 600;
var width = 800;
var Vector = /** @class */ (function () {
    function Vector(x, y) {
        this.x = x;
        this.y = y;
    }
    Vector.prototype.vadd = function (v) {
        var x = this.x + v.x;
        var y = this.y + v.y;
        return new Vector(x, y);
    };
    Vector.prototype.mul = function (n) {
        var x = this.x * n;
        var y = this.y * n;
        return new Vector(x, y);
    };
    Vector.prototype.div = function (n) {
        var x = this.x / n;
        var y = this.y / n;
        return new Vector(x, y);
    };
    Vector.prototype.distance = function (v) {
        //distance = [(x1 - x2) ^ 2 + (y1 - y2) ^ 2] ^ 0.5
        var distance2 = Math.pow((this.x - v.x), 2) + Math.pow((this.y - v.y), 2);
        var distance = Math.pow(distance2, 0.5);
        return distance;
    };
    Vector.prototype.clone = function () {
        return new Vector(this.x, this.y);
    };
    Vector.prototype.oppositeX = function () {
        this.x = -this.x;
    };
    Vector.prototype.oppositeY = function () {
        this.y = -this.y;
    };
    Vector.prototype.setX = function (x) {
        this.x = x;
    };
    Vector.prototype.setY = function (y) {
        this.y = y;
    };
    Vector.prototype.getX = function () {
        return this.x;
    };
    Vector.prototype.getY = function () {
        return this.y;
    };
    Vector.prototype.string = function () {
        return "x:" + this.x + ", y:" + this.y;
    };
    return Vector;
}());
var Ball = /** @class */ (function () {
    function Ball(name, site, speed, radius, quality, color) {
        this.name = name;
        this.site = site;
        this.color = color;
        this.speed = speed;
        this.quality = quality;
        this.radius = radius;
    }
    Ball.prototype.move = function () {
        this.site = this.site.vadd(this.speed);
    };
    Ball.prototype.crash = function (balls) {
        var that = this;
        //检查边框碰撞
        this.crashBorder();
        balls.forEach(function (ball) {
            if (ball.name == that.name) {
                return;
            }
            var distance = that.site.distance(ball.site);
            var body = that.radius + ball.radius;
            if (distance <= body) {
                //碰撞
                console.log("distance:", distance, ",body:", body, ball, that);
                that.doCrash(ball);
            }
        });
    };
    Ball.prototype.crashBorder = function () {
        if (this.site.getX() + this.radius >= width) {
            this.speed.oppositeX();
            if (this.site.getX() + this.radius > width) {
                this.site.setX(width - this.radius);
            }
        }
        else if (this.site.getX() - this.radius <= 0) {
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
        }
        else if (this.site.getY() - this.radius <= 0) {
            this.speed.oppositeY();
            if (this.site.getY() - this.radius < 0) {
                this.site.setY(this.radius);
            }
        }
    };
    Ball.prototype.doCrash = function (ball) {
        //v1' = [v1 * (m1 - m2) + 2 * m2 * v2] / (m1 + m2)
        //v2' = [v2 * (m2 - m1) + 2 * m1 * v1] / (m1 + m2)
        var temp = this.speed.mul(this.quality - ball.quality).vadd(ball.speed.mul(2 * ball.quality));
        var newSpeed = temp.div(this.quality + ball.quality);
        this.speed = newSpeed;
    };
    Ball.prototype.render = function (g) {
        g.fillStyle = this.color;
        g.strokeStyle = this.color;
        g.beginPath();
        g.arc(this.site.getX(), this.site.getY(), this.radius, 0, Math.PI * 2, false);
        g.stroke();
    };
    Ball.prototype.clone = function () {
        return new Ball(this.name, this.site, this.speed, this.radius, this.quality, this.color);
    };
    return Ball;
}());
var Table = /** @class */ (function () {
    function Table(balls, g) {
        this.balls = balls;
        this.g = g;
    }
    Table.prototype.crashBalls = function () {
        var clonedBalls = new Array();
        //创建克隆ball
        this.balls.forEach(function (ball) {
            clonedBalls.push(ball.clone());
        });
        //碰撞检查
        this.balls.forEach(function (ball) {
            ball.crash(clonedBalls);
        });
    };
    Table.prototype.updateStates = function () {
        this.crashBalls();
        this.balls.forEach(function (ball) {
            ball.move();
        });
    };
    Table.prototype.render = function () {
        var that = this;
        this.g.clearRect(0, 0, width, height);
        this.updateStates();
        this.balls.forEach(function (ball) {
            ball.render(that.g);
        });
        requestAnimationFrame(this.render.bind(this));
    };
    Table.prototype.start = function () {
        requestAnimationFrame(this.render.bind(this));
    };
    return Table;
}());
var canvas = document.getElementById("canvas");
var context = canvas.getContext("2d");
var balls = [
    new Ball("球-1", new Vector(30, 30), new Vector(4, 4), 20, 2, "#00ff00"),
    new Ball("球-2", new Vector(500, 200), new Vector(0, 0), 20, 2, "#00ffff"),
    new Ball("球-3", new Vector(120, 80), new Vector(0, 0), 20, 2, "#0000ff"),
    new Ball("球-4", new Vector(700, 40), new Vector(0, 0), 20, 2, "#f0f000"),
    new Ball("球-5", new Vector(600, 140), new Vector(0, 0), 20, 2, "#fff000"),
    new Ball("球-6", new Vector(500, 240), new Vector(0, 0), 20, 2, "#ff0f00"),
    new Ball("球-7", new Vector(100, 140), new Vector(0, 0), 20, 2, "#ff00ff"),
    new Ball("球-8", new Vector(240, 340), new Vector(0, 0), 20, 2, "#ff0fff"),
    new Ball("球-9", new Vector(500, 120), new Vector(0, 0), 20, 2, "#ff0ff0"),
];
var table = new Table(balls, context);
table.start();

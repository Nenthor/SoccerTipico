var bg = document.getElementById('bg');
var w = (bg.width = window.innerWidth),
	h = (bg.height = window.innerHeight),
	ctx = bg.getContext('2d'),
	minDist = 10,
	maxDist = 30,
	initialWidth = 10,
	maxLines = 100,
	initialLines = 4,
	speed = 1.5,
	lines = [],
	frame = 0,
	timeSinceLast = 0,
	dirs = [
		// straight x, y velocity
		[0, 1],
		[1, 0],
		[0, -1],
		[-1, 0],
		// diagonals, 0.7 = sin(PI/4) = cos(PI/4)
		[0.7, 0.7],
		[0.7, -0.7],
		[-0.7, 0.7],
		[-0.7, -0.7]
	],
	starter = {
		// starting parent line, just a pseudo line

		x: w / 2,
		y: h / 2,
		vx: 0,
		vy: 0,
		width: initialWidth
	};

function init() {
	lines.length = 0;

	for (var i = 0; i < initialLines; ++i) lines.push(new Line(starter));

	ctx.fillStyle = '#222';
	ctx.fillRect(0, 0, w, h);

	// if you want a cookie ;)
	// ctx.lineCap = 'round';
}
function getColor(x) {
	return 'hsl( hue, 80%, 50% )'.replace('hue', (x / w) * 360 + frame);
}
function anim() {
	window.requestAnimationFrame(anim);

	++frame;

	ctx.shadowBlur = 0;
	ctx.fillStyle = 'rgba(0,0,0,.02)';
	ctx.fillRect(0, 0, w, h);
	ctx.shadowBlur = 0.5;

	for (var i = 0; i < lines.length; ++i)
		if (lines[i].step()) {
			// if true it's dead

			lines.splice(i, 1);
			--i;
		}

	// spawn new

	++timeSinceLast;

	if (lines.length < maxLines && timeSinceLast > 10 && Math.random() < 0.5) {
		timeSinceLast = 0;

		lines.push(new Line(starter));

		// cover the middle;
		ctx.fillStyle = ctx.shadowColor = getColor(starter.x);
		ctx.beginPath();
		ctx.arc(starter.x, starter.y, initialWidth, 0, Math.PI * 2);
		ctx.fill();
	}
}

function Line(parent) {
	this.x = parent.x | 0;
	this.y = parent.y | 0;
	this.width = parent.width / 1.25;

	do {
		var dir = dirs[(Math.random() * dirs.length) | 0];
		this.vx = dir[0];
		this.vy = dir[1];
	} while ((this.vx === -parent.vx && this.vy === -parent.vy) || (this.vx === parent.vx && this.vy === parent.vy));

	this.vx *= speed;
	this.vy *= speed;

	this.dist = Math.random() * (maxDist - minDist) + minDist;
}
Line.prototype.step = function () {
	var dead = false;

	var prevX = this.x,
		prevY = this.y;

	this.x += this.vx;
	this.y += this.vy;

	--this.dist;

	// kill if out of screen
	if (this.x < 0 || this.x > w || this.y < 0 || this.y > h) dead = true;

	// make children :D
	if (this.dist <= 0 && this.width > 1) {
		// keep yo self, sometimes
		this.dist = Math.random() * (maxDist - minDist) + minDist;

		// add 2 children
		if (lines.length < maxLines) lines.push(new Line(this));
		if (lines.length < maxLines && Math.random() < 0.5) lines.push(new Line(this));

		// kill the poor thing
		if (Math.random() < 0.2) dead = true;
	}

	ctx.strokeStyle = ctx.shadowColor = getColor(this.x);
	ctx.beginPath();
	ctx.lineWidth = this.width;
	ctx.moveTo(this.x, this.y);
	ctx.lineTo(prevX, prevY);
	ctx.stroke();

	if (dead) return true;
};

init();
anim();

window.addEventListener('resize', function () {
	w = bg.width = window.innerWidth;
	h = bg.height = window.innerHeight;
	starter.x = w / 2;
	starter.y = h / 2;

	init();
});

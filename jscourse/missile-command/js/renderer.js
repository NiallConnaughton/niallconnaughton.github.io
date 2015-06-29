function Renderer() {
	this.canvas = document.getElementById('canvas');
	this.context = this.canvas.getContext('2d');

	this.groundImg = this.loadImage('images/ground.png');
	this.cityImg = this.loadImage('images/city.png');
	this.bunkerImg = this.loadImage('images/bunker.png');
}

Renderer.prototype.loadImage = function(url) {
	var img = new Image();
	img.src = url;

	return img;
}

Renderer.prototype.render = function(level) {
	var self = this;

	this.clearCanvas();

	this.renderGround();

	// draw each of the cities, bunkers, missiles and explosions if they are still alive
	var render = function(items, renderFunc) {
		items.forEach(renderFunc.bind(self));
	}

	render(level.cities, this.renderCity);
	render(level.bunkers, this.renderBunker);
	render(level.defenseMissiles.concat(level.enemyMissiles), this.renderMissile);
	render(level.explosions, this.renderExplosion);
}

Renderer.prototype.clearCanvas = function() {
	ctx.save();
	ctx.beginPath();
	ctx.rect(0, 0, this.canvas.width, this.canvas.height);
	ctx.fillStyle = "black";
	ctx.fill();
	ctx.restore();
}

Renderer.prototype.isAlive = function(obj) {
	return obj.isAlive;
}

Renderer.prototype.renderGround = function() {
	ctx.save();
	var groundPattern = ctx.createPattern(this.groundImg, 'repeat-x');
	ctx.fillStyle = groundPattern;
	ctx.translate(0, 495);
	ctx.fillRect(0, 0, 800, 105);
	ctx.restore();
}

Renderer.prototype.renderCity = function(city) {
	this.renderImage(this.cityImg, city);
}

Renderer.prototype.renderBunker = function(bunker) {
	this.renderImage(this.bunkerImg, bunker);
	var missileCounterColour = bunker.remainingMissiles > 3 ? "#DDDDDD" : "red";

	ctx.save();
	ctx.font = "16pt Stencil";
	ctx.fillStyle = missileCounterColour;
	ctx.textAlign = "center";
	ctx.fillText(bunker.remainingMissiles.toString(), bunker.location.x, bunker.location.y + 40);
	ctx.restore();
}

Renderer.prototype.renderImage = function(img, gameObject) {
	var top = gameObject.location.y - img.height / 2;
	var left = gameObject.location.x - img.width / 2;
	ctx.drawImage(img, left, top);
}

Renderer.prototype.renderMissile = function(missile) {
	ctx.save();

	// first draw the missile trail
    this.context.beginPath();
    this.context.moveTo(missile.source.x, missile.source.y);
    this.context.lineTo(missile.location.x, missile.location.y);
    this.context.lineWidth = 1;
    this.context.strokeStyle = 'grey';
    this.context.stroke();

	// then the missile itself over its trail
	this.context.beginPath();
	this.context.arc(missile.location.x, missile.location.y, 3, 0, 2 * Math.PI, false);
    this.context.fillStyle = 'red';
    this.context.fill();
    this.context.lineWidth = 0;
    this.context.strokeStyle = 'black';
    this.context.stroke();

    ctx.restore();
}

Renderer.prototype.renderExplosion = function(explosion) {
	ctx.save();

	var nonRedColour = Math.floor(170 * explosion.size / 30);
	var nonRedColourHex = ('00' + nonRedColour.toString(16)).slice(-2); 
	var colour = '#FF' + nonRedColourHex + nonRedColourHex;

	this.context.beginPath();
	this.context.arc(explosion.location.x, explosion.location.y, explosion.size, 0, 2 * Math.PI, false);
    this.context.fillStyle = colour;
    this.context.fill();
    this.context.lineWidth = 0;
    this.context.strokeStyle = colour;
    this.context.stroke();

    ctx.restore();
}
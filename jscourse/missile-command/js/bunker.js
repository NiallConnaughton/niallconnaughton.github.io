function Bunker(x, y) {
	this.location = new Location(x, y);
	this.isAlive = true;
}

Bunker.prototype.initialize = function(remainingMissiles) {
	this.remainingMissiles = remainingMissiles;
}

Bunker.prototype.fireMissile = function() {
	this.remainingMissiles--;
}
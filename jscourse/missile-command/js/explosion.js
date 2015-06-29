function Explosion(location) {
	this.location = location.clone();
	this.size = 0;
	this.completed = false;

	this.isAlive = true;
}

Explosion.prototype.updatePosition = function(elapsed) {
	if (this.size < 30) {
		this.size += 30 * elapsed / 1000;
	}
	else if (this.isAlive) {
		this.isAlive = false;
	}
}

Explosion.prototype.explodes = function(other) {
	return this.location.getDistanceTo(other.location) <= this.size;
}
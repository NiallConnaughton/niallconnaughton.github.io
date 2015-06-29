function Missile(source, target, isDefenseMissile) {
	this.source = source;
	this.location = source.clone();
	this.target = target;
	this.isDefenseMissile = isDefenseMissile;
	this.speed = isDefenseMissile ? 1000 : 50;

	this.targetDistance = source.getDistanceTo(target);
	this.xSpeed = (target.x - source.x) * this.speed / this.targetDistance;
	this.ySpeed = (target.y - source.y) * this.speed / this.targetDistance;

	this.isAlive = true;
}

Missile.prototype.reachedTarget = function() {
	var distanceFromLaunch = this.source.getDistanceTo(this.location);
	return distanceFromLaunch >= this.targetDistance;
}

Missile.prototype.updatePosition = function(elapsed) {
	this.location.x += this.xSpeed * (elapsed / 1000);
	this.location.y += this.ySpeed * (elapsed / 1000);

	if (this.reachedTarget()) {
		this.location = this.target.clone();
	}
}
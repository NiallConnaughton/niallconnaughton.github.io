function Location(x, y) {
	this.x = x;
	this.y = y;
}

Location.prototype.getDistanceTo = function(b) {
	var dx = b.x - this.x;
	var dy = b.y - this.y;
	return Math.sqrt(dx * dx + dy* dy);
}

Location.prototype.clone = function() {
	return new Location(this.x, this.y);
}
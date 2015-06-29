function Cell(x, y) {
	this.x = x;
	this.y = y;

	this.isBomb = false;
	this.isFlagged = false;
	this.neighbourBombs = 0;
	this.neighbours = [];
	this.isRevealed = false;
}

Cell.prototype.addNeighbourBomb = function() {
	this.neighbourBombs++;

	// console.log('Cell at ' + this.x + ', ' + this.y + ' has ' + this.neighbourBombs + ' neighbouring bombs');
}
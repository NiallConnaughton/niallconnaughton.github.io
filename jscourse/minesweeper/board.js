function Board(size, bombCount) {
	// var emptyCell = 0, bombCell = 1, flagCell = 2;
	this.cells = [];
	this.size = size;
	this.bombCount = bombCount;
	this.bombsRemaining = bombCount;
	this.cellsRemaining = this.size * this.size;
}

Board.prototype.onCellRevealed = function(cell) {
	// Does nothing - this is for the game to set a callback
	console.log('Should have a handler for onUpdateCell!');
}

Board.prototype.onCellFlagChanged = function(cell) {
	// Does nothing - this is for the game to set a callback
	console.log('Should have a handler for onCellFlagChanged!');	
}

Board.prototype.initializeGrid = function() {
	for (var x = 0; x < this.size; x++) {
		var row = [];
		for (var y = 0; y < this.size; y++) {
			row.push(new Cell(x, y));
		}
		this.cells.push(row);
	}

	this.initializeNeighbours();
	this.placeBombs();

	console.log('Grid initialized');
}

Board.prototype.placeBombs = function() {
	for (var i = 0; i < this.bombCount; i++) {
		var bombPlaced = false;
		while (!bombPlaced) {
			var x = Math.floor(Math.random() * this.size);
			var y = Math.floor(Math.random() * this.size);

			var cell = this.cells[x][y];
			if (!cell.isBomb) {
				cell.isBomb = true;
				bombPlaced = true;

				console.log('Bomb at ' + x + ', ' + y);

				cell.neighbours.forEach(function (c) {
					c.addNeighbourBomb();
				});
			}
		}
	}
}

Board.prototype.initializeNeighbours = function() {
	for (var x = 0; x < this.size; x++) {
		for (var y = 0; y < this.size; y++) {
			var cell = this.cells[x][y];
			var neighbours = this.getNeighbours(cell);
			cell.neighbours = neighbours;
		}
	}
}

Board.prototype.getNeighbours = function(cell) {
	// neighbours are the cells from one column left, one row above to one column right, one row below the cell
	// but we need to handle the case where the cell is on the topmost/leftmost/rightmost/bottommost row/column

	var left = Math.max(cell.x - 1, 0);
	var top = Math.max(cell.y - 1, 0);
	var right = Math.min(cell.x + 1, this.size - 1);
	var bottom = Math.min(cell.y + 1, this.size - 1);

	var neighbours = [];

	for (var x = left; x <= right; x++) {
		for (var y = top; y <= bottom; y++) {
			// make sure the cell is not its own neighbour
			if (x === cell.x && y === cell.y) {
				continue;
			}

			neighbours.push(this.cells[x][y]);
		}
	}

	return neighbours;
}

// Board.prototype.cellHasBomb = function(x, y) {
// 	var cell = this.cells[x][y];

// 	// console.log('Cell at ' + cell.x + ', ' + cell.y + ' is bomb: ' + cell.isBomb + ', neighbouring bombs: ' + cell.neighbourBombs);

// 	return cell.isBomb;
// }

Board.prototype.logNeighbours = function(x, y) {
	this.cells[x][y].neighbours.forEach(function (n) {
		console.log('neighbour at ' + n.x + ', ' + n.y);
	});
}

Board.prototype.revealCellAt = function(x, y) {
	var cell = this.cells[x][y];
	this.revealCell(cell, []);

	if (cell.isBomb) {
		this.revealAllCells();
		this.onGameOver(false);
	}
	else if (this.cellsRemaining === this.bombCount) {
		this.revealAllCells();
		this.onGameOver(true);
	}
}

Board.prototype.revealCell = function(cell) {
	var self = this;

	// if we've already revealed this cell, don't reveal again
	if (cell.isRevealed) {
		return;
	}
	cell.isRevealed = true;
	this.cellsRemaining--;

	this.onCellRevealed(cell);

	if (cell.neighbourBombs === 0) {
		cell.neighbours.forEach(function (c) { self.revealCell(c); });
	}
}

Board.prototype.revealAllCells = function() {
	// Seems like this is the window inside the forEach
	var self = this;

	this.cells.forEach(function (column) {
		column.forEach(function (cell) {
			self.revealCell(cell);
		})
	})
}

Board.prototype.toggleCellFlag = function(x, y) {
	var cell = this.cells[x][y];
	cell.isFlagged = !cell.isFlagged;
	if (cell.isFlagged) {
		this.bombsRemaining--;
	}
	else {
		this.bombsRemaining++;
	}

	this.onCellFlagChanged(cell);
	this.onRemainingBombsChanged(this.bombsRemaining);
}
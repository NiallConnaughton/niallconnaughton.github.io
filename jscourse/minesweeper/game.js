function Game(board) {
	this.board = board;
}

Game.prototype.start = function() {
	board.initializeGrid();
	this.renderBoard();
	this.handleUserInput();

	board.onCellRevealed = this.cellRevealed;
	board.onCellFlagChanged = this.cellFlagChanged;
	board.onGameOver = this.gameOver;
	board.onRemainingBombsChanged = this.updateBombCount;
}

Game.prototype.gameOver = function(playerWon) {
	if (!playerWon) {
		alert('Game over, man!');
	}
	else {
		alert('You win!');
	}
}

Game.prototype.cellRevealed = function(cell) {
	// var $cell = getUiCell(cell);
	var selector = '[data-x=' + cell.x + '][data-y=' + cell.y + ']';
	var $cell = $(selector);


	$cell.removeClass('selectable');
	$cell.addClass('revealed');

	if (cell.isBomb) {
		$cell.addClass('bomb');
		$cell.html('<i class="fa fa-bomb"></i>');
	}
	else if (cell.neighbourBombs > 0) {
		$cell.addClass('bombs' + cell.neighbourBombs);
		$cell.html(cell.neighbourBombs);
	}
}

Game.prototype.cellFlagChanged = function(cell) {
	var selector = '[data-x=' + cell.x + '][data-y=' + cell.y + ']';
	var $cell = $(selector);

	if (cell.isFlagged)
		$cell.html('<i class="fa fa-flag"></i>');
	else
		$cell.html(' ');

 	$cell.toggleClass('flagged');
}

Game.prototype.updateBombCount = function(count) {
	//starting to look like these should be events instead of individual callbacks
 	var $bombsRemaining = $('#bombsRemaining');
 	$bombsRemaining.html(count);
}

Game.prototype.getUiCell = function(cell) {
	// This doesn't work because the context during the call is not the Game object.
	// Need to work out how to fix this.

	var selector = '[data-x=' + cell.x + '][data-y=' + cell.y + ']';
	var $cell = $(selector);

	return $cell;	
}

Game.prototype.renderBoard = function() {
	console.log('rendering');
	var boardDiv = $('#board');

	for (var y = 0; y < this.board.size; y++) {
		var row = [];
		row.push('<div class="row">');
		for (var x = 0; x < this.board.size; x++) {
			row.push('<div class="cell selectable" data-x="' + x + '" data-y="' + y + '"> </div>');
		}

		boardDiv.append(row.join('\n'));
	}

	this.updateBombCount(this.board.bombsRemaining);
}

Game.prototype.handleUserInput = function() {
	// Suppress the context menu for right click
	window.oncontextmenu = function() { return false; };

	var cells = $('#board').find('.cell');
	var self = this;

	// handle click events on any of the cells, and place a piece there
	cells.mousedown(function(e) {
		var x = $(this).attr('data-x');
		var y = $(this).attr('data-y');

		if (e.button === 0) {
			self.board.revealCellAt(x, y);
		}
		else if (e.button === 2) {
			// right click
			self.board.toggleCellFlag(x, y);
		}
	});
}
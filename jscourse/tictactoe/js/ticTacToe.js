var PLAYER_1 = 0, PLAYER_2 = 1, CELL_EMPTY = undefined;
var current_player = PLAYER_1;
var grid = [];
var moves = 0;

function initializeGrid() {
	// initialize the game board model
	for (var i = 0; i < 3; i++) {
		var row = [];
		for (var j = 0; j < 3; j++) {
			row.push(CELL_EMPTY);
		}
		grid.push(row);
	}

	var cells = $('#board').find('.cell');

	// handle click events on any of the cells, and place a piece there
	cells.click(function() {
		var x = $(this).attr('data-x');
		var y = $(this).attr('data-y');

		placePiece(x, y, current_player);
	});

	// every cell starts empty
	cells.addClass('emptyCell');
}

function placePiece(x, y, player) {
	// var cellId = getCellId(x, y);
	var selector = '[data-x=' + x + '][data-y=' + y + ']';
	var cell = $(selector);

	// if the cell has already been played, do nothing
	if (!cell.hasClass('emptyCell'))
		return;

	// otherwise, we need to update our board model, set the class for the cell and dispaly the X/O content
	grid[x][y] = player;

	var cellClass = 'player' + player;
	if (player === PLAYER_1) {
		// cellClass = 'fa fa-slack';
		cell.html('<i class="fa fa-slack"/>');
	}
	else if (player === PLAYER_2) {
		// cellClass = 'fa fa-star';
		cell.html('<i class="fa fa-star"/>');
		// cell.html('O');
	}

	cell.addClass(cellClass);

	cell.removeClass('emptyCell');

	moves++;
	current_player = (current_player + 1) % 2;

	checkGameState();
}

function checkGameState() {
	var consecutiveCellSets = [];
	
	// each column
	consecutiveCellSets.push(grid[0]);
	consecutiveCellSets.push(grid[1]);
	consecutiveCellSets.push(grid[2]);

	// each row
	consecutiveCellSets.push([grid[0][0], grid[1][0], grid[2][0]]);
	consecutiveCellSets.push([grid[0][1], grid[1][1], grid[2][1]]);
	consecutiveCellSets.push([grid[0][2], grid[1][2], grid[2][2]]);

	// the two diagonals
	consecutiveCellSets.push([grid[0][0], grid[1][1], grid[2][2]]);
	consecutiveCellSets.push([grid[2][0], grid[1][1], grid[0][2]]);

	for (var i = 0; i < consecutiveCellSets.length; i++) {
		var consecutiveSet = consecutiveCellSets[i];
		var sum = 0;
		for (var cell = 0; cell < 3; cell++) {
			sum += consecutiveSet[cell];
		}

		if (sum === PLAYER_1 * 3) {
			alert('player 1 win!');
		}
		else if (sum === PLAYER_2 * 3) {
			alert('player 2 win!');
		}
	}

	if (moves === 9)
		alert('tie!');
}

initializeGrid();
var canvas = document.getElementById('canvas');
var $canvas = $(canvas);
var $gameover = $('#gameover');
var $newHighScore = $('#newHighScore');
var $mainMenuDialog = $('#mainMenu');
var $startGameButton = $('#startNewGameButton');
var $replayLastGameButton = $('#replayLastGameButton');
var ctx = canvas.getContext('2d');
var demomodeSpeedup = 3;
var dialogs = [$gameover, $newHighScore, $mainMenuDialog];

function Game() {
	this.renderer = new Renderer();
	this.updateRequests = this.getUpdateRequests();
	this.mouseDowns = Rx.Observable.fromEvent(canvas, "mousedown").share();

	$startGameButton.click(this.startNewGame.bind(this));
	$replayLastGameButton.click(this.replayLastGame.bind(this));
	this.centreElement($canvas);
}

Game.prototype.startNewGame = function() {
	this.isReplay = false;
	this.levels = [];
	this.score = 0;

	this.hideDialogs();

	var launchProvider = new LaunchProvider(this.mouseDowns);
	this.level = new Level(1, this.updateRequests, null, launchProvider);
	this.startLevel();
}

Game.prototype.replayLastGame = function() {
	this.score = 0;
	this.hideDialogs();
	var highScores = this.loadHighScores();
	var game = highScores[0];
	// var game = this.loadGame(sessionStorage.getItem('lastGame'));
	this.levels = game.levels;
	this.isReplay = true;

	var launchProvider = new ReplayLaunchProvider(game);

	var updateRequests = this.updateRequests.map(function(elapsed) { return elapsed * demomodeSpeedup; });

	this.level = new Level(1, updateRequests, null, launchProvider);
	this.level.launches = game.levels[0].launches;
	this.startLevel();
}

Game.prototype.loadGame = function(savedGame) {
	var game = JSON.parse(savedGame);

	this.levels = new Array(game.levels.length);
	console.log('Replaying ' + this.levels.length + ' levels');

	var launchedMissiles = _(game.levels)
						.pluck('launches')
						.flatten()
						.pluck('missile');

	var locations = launchedMissiles
						.map(function (missile) { return [ missile.source, missile.target, missile.location ]})
						.flatten()
						.value();

	// find a better way of doing this	
	locations.forEach(function(l) { $.extend(l, Location.prototype); } );

	return game;	
}

Game.prototype.startLevel = function() {
	this.level.initialize(this.isReplay);

	this.updateRequests.takeUntil(this.level.levelFinished)
					   .subscribe(this.render.bind(this));

	this.level.levelFinished.subscribe(this.levelFinished.bind(this));

	this.levels.push(this.level);
}

Game.prototype.levelFinished = function(levelWon) {
	if (levelWon) {
		var remainingMissiles = _(this.level.bunkers).reduce(
			function(total, bunker) { return total + bunker.remainingMissiles; },
			0);

		this.score += this.level.cities.length * 500
						+ this.level.bunkers.length * 200
						+ remainingMissiles * 50;

		console.log('Level complete, score' + this.score);
		this.levelUp();
	}
	else {
		if (!this.isReplay) {
			var savedGames = this.loadHighScores();
			var lowestHighScore = _(savedGames).last();
			if (lowestHighScore && savedGames.length === 5 && this.score <= lowestHighScore.score)
				this.showGameOver();
			else
				this.showNewHighScore(savedGames);
		}
		else {
			this.showMainMenu();
		}
	}
}

Game.prototype.loadHighScores = function() {
	var highScoresJson = sessionStorage.getItem('highScores');
	if (!highScoresJson)
		return [];

	var highScores = JSON.parse(highScoresJson);
	return highScores;
}

Game.prototype.getSavedGame = function(name) {
	var levelLaunches = this.levels.map(function(l) { return { launches: l.launches }; });
	return { score: this.score, levels: levelLaunches, name: name };
}

Game.prototype.levelUp = function() {
	var nextLevel = this.level.createNextLevel()

	if (this.isReplay) {
		nextLevel.launches = this.levels[this.level.level].launches;
	}
	this.level = nextLevel;
	this.startLevel();
}

Game.prototype.render = function () {
	this.renderer.render(this.level);
}

Game.prototype.getUpdateRequests = function() {
	var updateRequests = Rx.Observable.create(function(observer) {
		var handleAnimationFrame = function(t) {
			observer.onNext(t);
			window.requestAnimationFrame(handleAnimationFrame);
		};

		window.requestAnimationFrame(handleAnimationFrame);	
	})
	.share();

	return updateRequests.zip(updateRequests.skip(1), function(t1, t2) { return t2 - t1; });
}


Game.prototype.showMainMenu = function() {
	this.showDialog($mainMenuDialog);
}

Game.prototype.showGameOver = function() {
	this.showDialog($gameover);
	Rx.Observable.timer(10000).subscribe(this.showMainMenu.bind(this));
	$('#finalScore').html(this.score);
	$('#finalLevel').html(this.level.level);
}

Game.prototype.showNewHighScore = function(savedGames) {
	this.showDialog($newHighScore);
	var $highScoreName = $('#highScoreName');
	$highScoreName.focus();

	var self = this;
	$highScoreName.keypress(function (e) {
		if(e.which == 13) {
			var savedGame = self.getSavedGame($newHighScore.val());
			savedGames.push(savedGame);
			savedGames = _.sortBy(savedGames, 'score').reverse();
			savedGames = _.take(savedGames, 5);

			var savedGamesJson = JSON.stringify(savedGames);
			sessionStorage.setItem('highScores', savedGamesJson);
			self.showGameOver();
		}
	});
}

Game.prototype.showDialog = function(dialog) {
	this.hideDialogs();
	dialog.removeClass('dialogHidden');
	this.centreElement(dialog);
}

Game.prototype.hideDialogs = function() {
	dialogs.forEach(function (d) { d.addClass('dialogHidden'); });
}

Game.prototype.centreElement = function($element) {
	var left = ($(document.body).width() - $element.width()) / 2;
	var top = ($(document.body).height() - $element.height()) / 2;
	$element.css({left: left, top: top});
}

var game = new Game();
game.showMainMenu();

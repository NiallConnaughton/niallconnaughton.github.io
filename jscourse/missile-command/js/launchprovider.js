function LaunchProvider(userClicks) {
	this.userClicks = userClicks;
}

LaunchProvider.prototype.getLaunches = function(level) {
	return this.getDefenseMissileLaunches(level).merge(this.getEnemyMissileLaunches(level));
}

LaunchProvider.prototype.getDefenseMissileLaunches = function(level) {
	return this.userClicks
			   .map(function(click) { return new Location(click.offsetX, click.offsetY); })
			   .map(this.createDefenseMissile.bind(level))
			   .takeWhile(function(m) { return m; })	
}

LaunchProvider.prototype.createDefenseMissile = function(target) {
	var firingBunker = this.findClosestBunker(target);

	if (firingBunker) {
		firingBunker.fireMissile();

		return new Missile(firingBunker.location, target, true);
	}
}

LaunchProvider.prototype.getEnemyMissileLaunches = function(level) {
	// level should last around 15 seconds

	var averageGap = 15000 / level.remainingEnemyMissiles;

	console.log('level ' + level.level + ': ' + level.remainingEnemyMissiles + ' missiles, launched every ' + averageGap + 'ms.');

	var delays = [];
	for (var i = 0; i < level.remainingEnemyMissiles; i++) {
		delays.push(Math.random() * averageGap * 2);
	}

	// take the launch times and map them to observable timers that will fire at the launch time
	return Rx.Observable.for(delays, function(d) { return Rx.Observable.timer(d); })
						.map(this.createEnemyMissile.bind(level))
						.takeWhile(function(m) { return m; });
	
	// for great justice, replace the line above with this. No idea why it does that.
	// return Rx.Observable.for(delays, Rx.Observable.timer);
}

LaunchProvider.prototype.createEnemyMissile = function() {
	var sourceX = Math.random() * canvas.width;
	var sourceLocation = new Location(sourceX, 0);

	var targets = this.cities.concat(this.bunkers);
	var target = targets[Math.floor(Math.random() * targets.length)];

	if (target)
		return new Missile(sourceLocation, target.location, false);
}
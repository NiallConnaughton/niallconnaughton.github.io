function ReplayLaunchProvider(replayGame) {
	this.game = replayGame;
}

ReplayLaunchProvider.prototype.getLaunches = function(level) {
	var allLaunches = this.getReplayedLaunches(level);

	return this.getReplayedDefenseLaunches(level, allLaunches)
				.merge(this.getReplayedEnemyMissileLaunches(level, allLaunches));
}

ReplayLaunchProvider.prototype.getReplayedDefenseLaunches = function(level, launches) {
	return launches.where(function(missile) { return missile.isDefenseMissile; })
					.do(function(missile) {
						var bunker = level.findClosestBunker(missile.source);
						bunker.fireMissile();
					});
}

ReplayLaunchProvider.prototype.getReplayedEnemyMissileLaunches = function(level, launches) {
	return launches.where(function(missile) { return !missile.isDefenseMissile; });
}

ReplayLaunchProvider.prototype.getReplayedLaunches = function(level) {
	var enemyMissiles = Rx.Observable.fromArray(level.launches)
									 .map(function (l) {
									 	var missile = new Missile(l.missile.source, l.missile.target, l.missile.isDefenseMissile);
									 	return Rx.Observable.return(missile).delay(l.timeOffset / demomodeSpeedup);
								 	 })
								 	 .mergeAll()
								 	 .share();

	return enemyMissiles;
}
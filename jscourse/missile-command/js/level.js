function Level(level, updateRequests, previousLevel, launchProvider) {
	this.cities = [];
	this.bunkers = [];
	this.enemyMissiles = [];
	this.defenseMissiles = [];
	this.explosions = [];
	this.launches = [];

	this.level = level;
	this.updateRequests = updateRequests;
	this.previousLevel = previousLevel;
	this.launchProvider = launchProvider;

	this.subscriptions = new Rx.CompositeDisposable();
	this.levelFinished = this.getLevelFinished();
}

Level.prototype.getLevelFinished = function() {
	var self = this;

	var levelLost = this.updateRequests.where(this.isLevelLost.bind(this))
									   .map(function() { return false; });

	var levelWon = this.updateRequests.where(this.isLevelWon.bind(this))
									  .map(function() { return true; });

	var levelFinished = levelLost.merge(levelWon)
								 .do(function() { self.subscriptions.dispose(); })
								 .take(1);

	return levelFinished;
}

Level.prototype.initialize = function(isDemo) {
	this.isDemo = isDemo;

	if (this.previousLevel) {
		this.initializeFromPreviousLevel(this.previousLevel);
	}
	else {
		this.initializeNewLevel();
	}

	var totalDefenseMissiles = 25 + this.level * 3;
	var missilesPerBunker = Math.floor(totalDefenseMissiles / this.bunkers.length);
	this.bunkers.forEach(function(b) { b.initialize(missilesPerBunker); });

	var totalEnemyMissiles = 5 + this.level * 5;
	this.remainingEnemyMissiles = totalEnemyMissiles;

	var levelUpdates = this.updateRequests.do(this.updatePositions.bind(this)).share();

	var detonations = this.getAllObjectUpdates(levelUpdates)
						  .where(this.hasObjectExploded.bind(this));

	// move the timestamp and mapping into launch provider
	var missileLaunches = this.launchProvider.getLaunches(this)
								  			 .timestamp()
								  			 .map(function (launch) { return { missile: launch.value, timeOffset: launch.timestamp - start }; })
								  			 .do(this.recordMissileLaunch.bind(this));

	this.subscriptions.add(detonations.subscribe(this.objectExploded.bind(this)));
	this.subscriptions.add(missileLaunches.subscribe(this.launchMissile.bind(this), function (err) { console.log(err); }));

	var start = Date.now();
}

Level.prototype.recordMissileLaunch = function(launch) {
	if (!this.isDemo) {
		this.launches.push(launch);
	}
}

Level.prototype.getAllObjectUpdates = function(levelUpdates) {
	// Generates an observable of position updates of all live level objects
	var self = this;
	return levelUpdates.flatMap(function() { return Rx.Observable.fromArray(self.getAllObjects.call(self)); });
}

Level.prototype.getAllObjects = function() {
	return this.cities.concat(this.bunkers).concat(this.enemyMissiles).concat(this.defenseMissiles);
}

Level.prototype.hasObjectExploded = function(obj) {
	if (obj.reachedTarget && obj.reachedTarget()) {
		return true;
	}

	if (this.isDemo && obj instanceof Missile)
		return false;

	// Defense missiles don't get destroyed by explosions, as this makes the game very hard to play (this matches the original)
	return !obj.isDefenseMissile && _.any(this.explosions, function(e) { return e.explodes(obj); });
}

Level.prototype.initializeNewLevel = function() {
	this.cities.push(new City(120, 520));
	this.cities.push(new City(400, 500));
	this.cities.push(new City(620, 530));

	this.bunkers.push(new Bunker(30, 510));
	this.bunkers.push(new Bunker(300, 530));
	this.bunkers.push(new Bunker(720, 520));
}

Level.prototype.initializeFromPreviousLevel = function(previousLevel) {
	this.cities = [].concat(previousLevel.cities);
	this.bunkers = [].concat(previousLevel.bunkers);
}

Level.prototype.createNextLevel = function() {
	return new Level(this.level + 1, this.updateRequests, this, this.launchProvider);
}

Level.prototype.isLevelWon = function() {
	// the level is won when there are no more missiles remaining to be fired, none in flight,
	// and no explosions that could possibly still kill a city

	return this.remainingEnemyMissiles === 0 && !_.any(this.enemyMissiles) && !_.any(this.explosions);
}

Level.prototype.isLevelLost = function() {
	return !_.any(this.cities) && !_.any(this.explosions); 
}

Level.prototype.objectExploded = function(obj) {
	obj.isAlive = false;

	// nasty hack to make game replays more reliable
	// due to timing mismatches between original and replay,
	// sometimes an enemy missile will slip past an explosion
	// that killed it in the original game.
	// by changing the target of the missile when it dies,
	// we make that missile explode at the point it was originally
	// hit by the explosion, even if it misses in the replay.
	if (obj.target)
		obj.target = obj.location;

	this.explosions.push(new Explosion(obj.location));
}

Level.prototype.launchMissile = function(launch) {
	var missile = launch.missile;

	if (missile.isDefenseMissile) {
		this.defenseMissiles.push(missile);
	}
	else {
		this.enemyMissiles.push(missile);
		this.remainingEnemyMissiles--;
	}
}

Level.prototype.findClosestBunker = function(target) {
	var remainingBunkers = this.bunkers.filter(function(b) { return b.remainingMissiles > 0; });

	var closestBunker;
	if (_.any(remainingBunkers)) {
		closestBunker = _.min(remainingBunkers, function(b) { return Math.abs(b.location.getDistanceTo(target)); });
	}

	return closestBunker;
}

Level.prototype.updatePositions = function(elapsed) {
	var updateables = this.enemyMissiles
						  .concat(this.defenseMissiles)
						  .concat(this.explosions);

	updateables.forEach(function(u) { u.updatePosition(elapsed); } );

	this.checkForDestroyedObjects();
}

Level.prototype.checkForDestroyedObjects = function() {
	this.removeDeadObjects(this.explosions);
	this.removeDeadObjects(this.cities);
	this.removeDeadObjects(this.bunkers);
	this.removeDeadObjects(this.enemyMissiles);
	this.removeDeadObjects(this.defenseMissiles);
}

Level.prototype.removeDeadObjects = function(items) {
	for (var i = items.length - 1; i >= 0; i--) {
		if (!items[i].isAlive) {
			items.splice(i, 1);
		}
	}
}
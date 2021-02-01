var gameEngine = new GameEngine();

var ASSET_MANAGER = new AssetManager();

ASSET_MANAGER.queueDownload("./sprites/background.png");
ASSET_MANAGER.queueDownload("./sprites/projectiles.png");
ASSET_MANAGER.queueDownload("./sprites/wizard.png");
ASSET_MANAGER.queueDownload("./sprites/dummy.png");
ASSET_MANAGER.queueDownload("./sprites/objects.png");
ASSET_MANAGER.queueDownload("./sprites/beam.png");

ASSET_MANAGER.downloadAll(function () {
	var canvas = document.getElementById('gameWorld');
	var ctx = canvas.getContext('2d');
	ctx.imageSmoothingEnabled = false;

	PARAMS.canvas_width = canvas.width;
	PARAMS.canvas_height = canvas.height;
	PARAMS.default_projectile = {spritesheet: ASSET_MANAGER.getAsset("./sprites/projectiles.png"), sx : 96, sy : 96}
	PARAMS.debug = document.getElementById("debug").checked;

	new SceneManager(gameEngine);

	gameEngine.init(ctx);	

	gameEngine.start();
});

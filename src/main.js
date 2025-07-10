import PreloadScene from './scenes/PreloadScene.js';
import GameScene from './scenes/GameScene.js';
import UIScene from './scenes/UIScene.js';
import SystemScene from './scenes/SystemScene.js';
import SaveLoadScene from './scenes/SaveLoadScene.js';
import ConfigScene from './scenes/ConfigScene.js';
import BacklogScene from './scenes/BacklogScene.js';
import ActionScene from './scenes/ActionScene.js';
// ConfigManagerのimportは不要になる

const config = {
    type: Phaser.AUTO,
    scale: {
        mode: Phaser.Scale.FIT,
        parent: 'phaser-game',
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 1280,
        height: 720
    },
    // ★★★ 起動するシーンは、PreloadSceneだけでOK ★★★
    scene: [PreloadScene, GameScene, UIScene, SystemScene, SaveLoadScene, ConfigScene, BacklogScene, ActionScene]
};

const game = new Phaser.Game(config);
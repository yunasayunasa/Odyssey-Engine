import PreloadScene from './scenes/PreloadScene.js';
import GameScene from './scenes/GameScene.js';
import UIScene from './scenes/UIScene.js';
import SaveLoadScene from './scenes/SaveLoadScene.js';
import ConfigScene from './scenes/ConfigScene.js'; // これを追加
import BacklogScene from './scenes/BacklogScene.js'; // これを追加


const config = {
    type: Phaser.AUTO,
    scale: {
        mode: Phaser.Scale.FIT,
        parent: 'phaser-game',
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 720,
        height: 1280
    },
    scene: [PreloadScene, GameScene, UIScene, SaveLoadScene, ConfigScene, BacklogScene]
};

const game = new Phaser.Game(config);
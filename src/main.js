import PreloadScene from './scenes/PreloadScene.js';
import GameScene from './scenes/GameScene.js';
import UIScene from './scenes/UIScene.js';
import SystemScene from './scenes/SystemScene.js';
import SaveLoadScene from './scenes/SaveLoadScene.js';
import ConfigScene from './scenes/ConfigScene.js';
import BacklogScene from './scenes/BacklogScene.js';
import ActionScene from './scenes/ActionScene.js';
import LoadingScene from './scenes/LoadingScene.js'; 
import ConfigManager from './core/ConfigManager.js';

import NovelOverlayScene from './scenes/NovelOverlayScene.js';


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
    scene: [PreloadScene, GameScene, UIScene, SaveLoadScene, ConfigScene, BacklogScene,  SystemScene, ActionScene, LoadingScene, NovelOverlayScene],
 callbacks: {
        preBoot: (game) => {
            game.config.globals = {
                configManager: new ConfigManager(),
               
            }; 
        }
    }
};








const game = new Phaser.Game(config);

// src/main.js (最終版)

import PreloadScene from './scenes/PreloadScene.js';
import SystemScene from './scenes/SystemScene.js'; 
import UIScene from './scenes/UIScene.js';       
import GameScene from './scenes/GameScene.js';
import SaveLoadScene from './scenes/SaveLoadScene.js';
import ConfigScene from './scenes/ConfigScene.js';
import BacklogScene from './scenes/BacklogScene.js';
import ActionScene from './scenes/ActionScene.js';
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
    // ★★★ PreloadSceneのみをactive:trueにする ★★★
    scene: [
        { key: 'PreloadScene', scene: PreloadScene, active: true }, // PreloadSceneを明示的にactive:true
        { key: 'SystemScene', scene: SystemScene, active: false }, 
        { key: 'UIScene', scene: UIScene, active: false },       
        { key: 'GameScene', scene: GameScene, active: false },   
        { key: 'SaveLoadScene', scene: SaveLoadScene, active: false }, 
        { key: 'ConfigScene', scene: ConfigScene, active: false }, 
        { key: 'BacklogScene', scene: BacklogScene, active: false }, 
        { key: 'ActionScene', scene: ActionScene, active: false }, 
        { key: 'NovelOverlayScene', scene: NovelOverlayScene, active: false }
    ]
};

const game = new Phaser.Game(config);
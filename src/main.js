import PreloadScene from './scenes/PreloadScene.js';
import GameScene from './scenes/GameScene.js';
import UIScene from './scenes/UIScene.js';
import SystemScene from './scenes/SystemScene.js';
import SaveLoadScene from './scenes/SaveLoadScene.js';
import ConfigScene from './scenes/ConfigScene.js';
import BacklogScene from './scenes/BacklogScene.js';
import ActionScene from './scenes/ActionScene.js';
import LoadingScene from './scenes/LoadingScene.js'; 
// ConfigManagerのimportは不要になる
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
    scene: [PreloadScene, GameScene, UIScene, SaveLoadScene, ConfigScene, BacklogScene, ActionScene, LoadingScene, NovelOverlayScene],
 callbacks: {
        preBoot: (game) => {
            game.config.globals = {
                configManager: new ConfigManager(),
                systemScene: null // ★ 司令塔を保持する場所を確保

            };
        }
    }
};








const game = new Phaser.Game(config);
//★★★ ゲームが起動した直後に、手動でSystemSceneを生成・追加 ★★★
game.scene.add('SystemScene', SystemScene, true);
// ★★★ 生成したインスタンスを、グローバル変数に保存 ★★★
game.config.globals.systemScene = game.scene.getScene('SystemScene');
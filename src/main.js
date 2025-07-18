// src/main.js (最終版)

import PreloadScene from './scenes/PreloadScene.js';
import SystemScene from './scenes/SystemScene.js'; // SystemSceneをPreloadSceneの次に配置
import UIScene from './scenes/UIScene.js';       // UISceneをSystemSceneの次に配置
import GameScene from './scenes/GameScene.js';
import SaveLoadScene from './scenes/SaveLoadScene.js';
import ConfigScene from './scenes/ConfigScene.js';
import BacklogScene from './scenes/BacklogScene.js';
import ActionScene from './scenes/ActionScene.js';
import NovelOverlayScene from './scenes/NovelOverlayScene.js';
// ConfigManagerはPhaserゲームのコンフィグとは直接関係ないのでここではimportしない

const config = {
    type: Phaser.AUTO,
    scale: {
        mode: Phaser.Scale.FIT,
        parent: 'phaser-game',
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 1280,
        height: 720
    },
    // ★★★ シーンの起動順序を制御するため、PreloadSceneを先頭に。
    // 各シーンのconstructorからactive:trueを削除します。
    scene: [
        PreloadScene, 
        SystemScene, // PreloadSceneがロード後にlaunchする
        UIScene,     // SystemSceneが初期ゲーム起動時にlaunchする
        GameScene,   // SystemSceneが初期ゲーム起動時にstartする
        SaveLoadScene, 
        ConfigScene, 
        BacklogScene, 
        ActionScene, 
        NovelOverlayScene
    ]
};

const game = new Phaser.Game(config);

// ★★★ ここでPreloadSceneを明示的に起動します ★★★
// GameConfigのscene配列の最初のシーンは自動的に起動されるため、
// ここで start を呼ぶ必要はありませんが、明示的に記述することで意図が明確になります。
// もしconfig.scene配列の最初の要素が自動起動しない場合は必要です。
// 通常、scene配列の最初のシーンは自動的に開始されます。
// もし動かない場合は、以下の行をコメント解除してください。
// game.scene.start('PreloadScene'); 
import PreloadScene from './scenes/PreloadScene.js';
import GameScene from './scenes/GameScene.js';
import UIScene from './scenes/UIScene.js';
import SaveLoadScene from './scenes/SaveLoadScene.js';
import ConfigScene from './scenes/ConfigScene.js'; // これを追加
import BacklogScene from './scenes/BacklogScene.js'; // これを追加
import ActionScene from './scenes/ActionScene.js';

const config = {
    type: Phaser.AUTO,
    scale: {
        mode: Phaser.Scale.FIT,
        parent: 'phaser-game',
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 1280,
        height: 720
    },
    scene: [PreloadScene, GameScene, UIScene, SaveLoadScene, ConfigScene, BacklogScene,  ActionScene]
};

// ゲーム起動時のどこか (例: main.js や PreloadScene)
async function lockScreenOrientation() {
    try {
        // まずフルスクリーンをリクエスト (多くのブラウザで、向きの固定にはユーザー操作とフルスクリーンが必要)
        await document.documentElement.requestFullscreen();
        // 画面の向きを「横向き」に固定するようリクエスト
        await screen.orientation.lock('landscape');
        console.log("画面の向きを横向きに固定しました。");
    } catch (e) {
        console.error("画面の向きの固定に失敗しました:", e);
    }
}

// ユーザーが最初に画面をタップした時などに、この関数を呼び出す
// (ブラウザのセキュリティポリシー上、ユーザーのアクションなしにAPIは呼べない)

const game = new Phaser.Game(config);

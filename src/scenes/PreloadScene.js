// src/scenes/PreloadScene.js

import ConfigManager from '../core/ConfigManager.js'; // ConfigManagerをここでimport

export default class PreloadScene extends Phaser.Scene {
    constructor() {
        super('PreloadScene');
        // UI要素への参照を初期化 (stop()で破棄するため)
        this.progressBar = null;
        this.progressBox = null;
        this.percentText = null;
        this.loadingText = null; // 'Now Loading...' text
    }

    preload() {
        console.log("PreloadScene: 起動。全アセットのロードを開始します。");
        
        // --- 1. ロード画面UIの表示 ---
        this.progressBox = this.add.graphics();
        this.progressBox.fillStyle(0x222222, 0.8).fillRect(340, 320, 600, 50);
        this.progressBar = this.add.graphics(); // This will be drawn on progress

        this.percentText = this.add.text(640, 345, '0%', { fontSize: '24px', fill: '#fff' }).setOrigin(0.5);
        this.loadingText = this.add.text(640, 280, 'Now Loading...', { fontSize: '36px', fill: '#ffffff' }).setOrigin(0.5);
        
        this.load.on('progress', (value) => {
            this.percentText.setText(parseInt(value * 100) + '%');
            this.progressBar.clear().fillStyle(0xffffff, 1).fillRect(350, 330, 580 * value, 30);
        });
        
        // --- 2. アセットのロード ---
        this.load.json('asset_define', 'assets/asset_define.json');
        this.load.script('webfont', 'https://ajax.googleapis.com/ajax/libs/webfont/1.6.26/webfont.js');
    }

    create() {
        console.log("PreloadScene: ロード完了。ゲームの初期設定を行います。");
        const assetDefine = this.cache.json.get('asset_define');
        const configManager = new ConfigManager();
        this.registry.set('configManager', configManager);
        
        // --- アセットをロードキューに追加 ---
        for (const key in assetDefine.images) {
            this.load.image(key, assetDefine.images[key]);
        }
        for (const key in assetDefine.sounds) {
            this.load.audio(key, assetDefine.sounds[key]);
        }
        for (const key in assetDefine.videos) {
            this.load.video(key, assetDefine.videos[key]);
        }
        // ゲームで使う可能性のあるシナリオファイルをすべてロード
        this.load.text('scene1.ks', 'assets/scene1.ks');
        this.load.text('scene2.ks', 'assets/scene2.ks');
        this.load.text('overlay_test.ks', 'assets/overlay_test.ks');
        this.load.text('test.ks', 'assets/test.ks'); // テスト用
        this.load.text('test_main.ks', 'assets/test_main.ks'); // テスト用
        this.load.text('test_sub.ks', 'assets/test_sub.ks'); // テスト用

        // --- ロード完了後の処理を定義 ---
        this.load.once('complete', () => {
            console.log("全アセットロード完了。");
            
            // キャラクター定義の生成
            const charaDefs = {};
            for (const key in assetDefine.images) {
                const parts = key.split('_');
                if (parts.length === 2) {
                    const [charaName, faceName] = parts;
                    if (!charaDefs[charaName]) charaDefs[charaName] = { jname: charaName, face: {} };
                    charaDefs[charaName].face[faceName] = key;
                }
            }
            
            // ★★★ SystemSceneがアクティブなことを確認し、初期ゲーム開始を依頼する ★★★
            // SystemSceneはGameConfigでactive:trueになっているはずなので、getで取得
            const systemScene = this.scene.get('SystemScene');
            if (systemScene) {
                // SystemSceneの新しいメソッドを呼び出して、GameSceneとUISceneの起動を依頼
                systemScene.startInitialGame(charaDefs, 'test.ks'); // SystemSceneがGameSceneとUISceneを起動する
            } else {
                console.error("SystemSceneが見つかりません。ゲームの起動に失敗しました。");
                // エラーハンドリング（例えば、エラー画面表示など）
            }

            // PreloadSceneは役割を終えるので停止する
            this.scene.stop(this.scene.key);
        });
        
        // --- ロードを開始 ---
        this.load.start();
    }

    // ★★★ stop() メソッドを追加し、ロード画面UIを破棄 ★★★
    stop() {
        super.stop();
        console.log("PreloadScene: stop されました。ロード画面UIを破棄します。");
        if (this.progressBar) { this.progressBar.destroy(); this.progressBar = null; }
        if (this.progressBox) { this.progressBox.destroy(); this.progressBox = null; }
        if (this.percentText) { this.percentText.destroy(); this.percentText = null; }
        if (this.loadingText) { this.loadingText.destroy(); this.loadingText = null; }
        // load.on('progress') のリスナーは、load.once('complete') が呼ばれると自動的に解除されるため、
        // ここでの明示的な解除は通常不要です。
    }
}
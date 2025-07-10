export default class PreloadScene extends Phaser.Scene {
    constructor() {
        super('PreloadScene');
    }

    preload() {
        console.log("PreloadScene: 起動。アセット定義ファイルを読み込みます。");
        // ★★★ 共通アセットの定義ファイルだけをロード ★★★
        this.load.json('asset_define', 'assets/asset_define.json');
        
        // ★★★ 最初のクリックのためのWebフォントローダーもここで ★★★
        this.load.script('webfont', 'https://ajax.googleapis.com/ajax/libs/webfont/1.6.26/webfont.js');
    }

    create() {
        console.log("PreloadScene: アセット定義を解析し、LoadingSceneに処理を依頼します。");
        const assetDefine = this.cache.json.get('asset_define');
        
        // --- ロードすべきアセットのリストを作成 ---
        const assetsToLoad = [];
        const autoCharaDefs = {};

        // キャラクター画像を解析してリストに追加
        for (const key in assetDefine.images) {
            const parts = key.split('_');
            if (parts.length === 2) {
                const charaName = parts[0];
                const faceName = parts[1];
                if (!autoCharaDefs[charaName]) {
                    autoCharaDefs[charaName] = { jname: charaName, face: {} };
                }
                autoCharaDefs[charaName].face[faceName] = key;
            }
            assetsToLoad.push({ type: 'image', key: key, path: assetDefine.images[key] });
        }
        // 音声アセットをリストに追加
        for (const key in assetDefine.sounds) {
            assetsToLoad.push({ type: 'audio', key: key, path: assetDefine.sounds[key] });
        }
        
        // 生成したキャラクター定義をグローバルに保存
        this.sys.game.config.globals.charaDefs = autoCharaDefs;

        // --- LoadingSceneを起動 ---
        this.scene.launch('LoadingScene', {
            assets: assetsToLoad,
            onComplete: () => {
                console.log("PreloadScene: 全アセットのロード完了通知を受け取りました。");
                // ★★★ ここで「TAP TO START」を表示する ★★★
                WebFont.load({
                    google: { families: ['Noto Sans JP'] },
                    active: () => this.showStartScreen(),
                    inactive: () => this.showStartScreen()
                });
            }
        });
    }

    showStartScreen() {
        const startText = this.add.text(640, 360, 'TAP TO START', { fontSize: '48px', fill: '#fff' }).setOrigin(0.5).setInteractive();
        
        this.input.once('pointerdown', () => {
            // ★★★ ゲームのメインシーンを開始 ★★★
            this.scene.start('GameScene');
            this.scene.start('UIScene');   // GameSceneと同時にUISceneも起動
            // SystemSceneはactive:trueなので自動で起動している
        });
    }
}
export default class PreloadScene extends Phaser.Scene {
    constructor() {
        super('PreloadScene');
    }

    preload() {
        console.log("PreloadScene: 準備中...");
        this.load.script('webfont', 'https://ajax.googleapis.com/ajax/libs/webfont/1.6.26/webfont.js');
        this.load.json('asset_define', 'assets/asset_define.json');
    }

    create() {
        console.log("PreloadScene: アセット定義を解析・ロードします。");
        const assetDefine = this.cache.json.get('asset_define');
        
        // ★★★ キャラクター定義を自動生成するための空のオブジェクト ★★★
        const autoCharaDefs = {};

        // --- imagesセクションのロードと、キャラクター定義の自動生成 ---
        for (const key in assetDefine.images) {
            // まずは通常通り画像をロードリストに追加
            this.load.image(key, assetDefine.images[key]);

            // ★★★ キーを '_' で分割し、キャラクター定義を試みる ★★★
            const parts = key.split('_');
            // 'yuna_normal' のように、分割して2つのパーツになったものだけを対象とする
            if (parts.length === 2) {
                const charaName = parts[0]; // 'yuna'
                const faceName = parts[1];  // 'normal'

                // まだ定義がなければ、新しいキャラクター定義オブジェクトを作成
                if (!autoCharaDefs[charaName]) {
                    autoCharaDefs[charaName] = {
                        jname: charaName, // とりあえずキャラ名を日本語名としておく
                        face: {}
                    };
                }
                // 表情名と画像キーを紐付ける
                // 例: autoCharaDefs['yuna']['face']['normal'] = 'yuna_normal';
                autoCharaDefs[charaName].face[faceName] = key;
            }
        }

        // --- soundsセクションのロード ---
        for (const key in assetDefine.sounds) {
            this.load.audio(key, assetDefine.sounds[key]);
        }
        
        // --- ロードの進捗と完了処理 ---
        this.load.on('progress', (value) => {
            console.log(`Loading... ${Math.round(value * 100)}%`);
        });

        this.load.on('complete', () => {
            console.log("アセットロード完了。");
            console.log("キャラクター定義を自動生成しました:", autoCharaDefs);
            
            // ★★★ 自動生成したcharaDefsをGameSceneに渡す ★★★
            this.scene.start('GameScene', { charaDefs: autoCharaDefs });
        });

        // ロードを開始
        this.load.start();
    }
}
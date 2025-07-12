import ScenarioManager from '../core/ScenarioManager.js';
import SoundManager from '../core/SoundManager.js';
import StateManager from '../core/StateManager.js';
import MessageWindow from '../ui/MessageWindow.js';
import { handleCharaShow } from '../handlers/chara_show.js';
import { handleCharaHide } from '../handlers/chara_hide.js';
import { handleCharaMod } from '../handlers/chara_mod.js';
import { handlePageBreak } from '../handlers/p.js';
import { handleWait } from '../handlers/wait.js';
import { handleBg } from '../handlers/bg.js';
import { handlePlaySe } from '../handlers/playse.js';
import { handlePlayBgm } from '../handlers/playbgm.js';
import { handleStopBgm } from '../handlers/stopbgm.js';
import ConfigManager from '../core/ConfigManager.js';
import { handleLink } from '../handlers/link.js';
import { handleJump } from '../handlers/jump.js';
import { handleMove } from '../handlers/move.js';
import { handleWalk } from '../handlers/walk.js';
import { handleShake } from '../handlers/shake.js';
import { handleVibrate } from '../handlers/vibrate.js';
import { handleFlip } from '../handlers/flip.js';
import { handleCharaJump } from '../handlers/chara_jump.js';
import { handleEval } from '../handlers/eval.js';
import { handleLog } from '../handlers/log.js';
import { handleIf } from '../handlers/if.js';
import { handleElsif } from '../handlers/elsif.js';
import { handleElse } from '../handlers/else.js';
import { handleEndif } from '../handlers/endif.js';
import { handleStop } from '../handlers/s.js';
import { handleClearMessage } from '../handlers/cm.js';
import { handleErase } from '../handlers/er.js';
import { handleDelay } from '../handlers/delay.js';
import { handleImage } from '../handlers/image.js';
import { handleFreeImage } from '../handlers/freeimage.js';
import { handleButton } from '../handlers/button.js';
import { handleCall } from '../handlers/call.js';
import { handleReturn } from '../handlers/return.js';
import { handleStopAnim } from '../handlers/stop_anim.js';
// import文に追加
import { handleFadeout } from '../handlers/fadeout.js';
import { handleFadein } from '../handlers/fadein.js';
import { handleVideo } from '../handlers/video.js';
import { handleStopVideo } from '../handlers/stopvideo.js';


export default class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
        this.scenarioManager = null;
        this.soundManager = null;
        this.stateManager = null;
        this.messageWindow = null;
        this.layer = { background: null, character: null, cg: null, message: null };
        this.charaDefs = null;
        this.characters = {};
        this.configManager = null;
        this.choiceButtons = []; 
        this.pendingChoices = []; // ★★★ 選択肢の一時保管場所 ★★★
        this.uiButtons = [];
    }

    init(data) {
        this.charaDefs = data.charaDefs;
      
          this.startScenario = data.startScenario || 'scene1.ks';
        this.startLabel = data.startLabel || null;
        this.isResuming = data.resumedFrom ? true : false;
        this.returnParams = data.returnParams || null;
    }

    

    preload() {
        this.load.text('scene1', 'assets/scene1.ks');
    }

    create() {
        this.cameras.main.setBackgroundColor('#000000');
        
       
        // --- レイヤー生成とdepth設定 ---
        this.layer.background = this.add.container(0, 0).setDepth(0);
        this.layer.character = this.add.container(0, 0).setDepth(0);
        this.layer.cg = this.add.container(0, 0).setDepth(0);

        this.layer.message = this.add.container(0, 0);
           // ★ 全画面を覆う、透明で見えない入力ブロッカーを作成
    this.choiceInputBlocker = this.add.rectangle(640, 360, 1280, 720)
        .setInteractive()
        .setVisible(false);
    
    // ブロッカーがクリックされた時のイベント（何もしない、で入力を止める）
    this.choiceInputBlocker.on('pointerdown', (pointer) => {
        // 必要なら「選択してください」などのフィードバックを出す
        console.log("選択肢を選んでください");
    });

        // --- マネージャー/UIクラスの生成 (依存関係に注意) ---
        this.configManager = this.sys.registry.get('configManager');
        
        this.stateManager = new StateManager();
        this.soundManager = new SoundManager(this, this.configManager);
        this.messageWindow = new MessageWindow(this, this.soundManager, this.configManager);
        this.layer.message.add(this.messageWindow);
        this.scenarioManager = new ScenarioManager(this, this.layer, this.charaDefs, this.messageWindow, this.soundManager, this.stateManager, this.configManager);
        
        // --- タグハンドラの登録 ---
        this.scenarioManager.registerTag('chara_show', handleCharaShow);
        this.scenarioManager.registerTag('chara_hide', handleCharaHide);
        this.scenarioManager.registerTag('chara_mod', handleCharaMod);
        this.scenarioManager.registerTag('p', handlePageBreak);
        this.scenarioManager.registerTag('wait', handleWait);
        this.scenarioManager.registerTag('bg', handleBg);
        this.scenarioManager.registerTag('playse', handlePlaySe);
        this.scenarioManager.registerTag('playbgm', handlePlayBgm);
        this.scenarioManager.registerTag('stopbgm', handleStopBgm);
        this.scenarioManager.registerTag('link', handleLink);
        this.scenarioManager.registerTag('jump', handleJump);
        this.scenarioManager.registerTag('move', handleMove);
        this.scenarioManager.registerTag('walk', handleWalk);
        this.scenarioManager.registerTag('shake', handleShake);
        this.scenarioManager.registerTag('vibrate', handleVibrate);
        this.scenarioManager.registerTag('flip', handleFlip);
        this.scenarioManager.registerTag('chara_jump', handleCharaJump);
        this.scenarioManager.registerTag('eval', handleEval);
        this.scenarioManager.registerTag('log', handleLog);
        this.scenarioManager.registerTag('if', handleIf);
        this.scenarioManager.registerTag('elsif', handleElsif);
        this.scenarioManager.registerTag('else', handleElse);
        this.scenarioManager.registerTag('endif', handleEndif);
        this.scenarioManager.registerTag('s', handleStop);
　　　　　this.scenarioManager.registerTag('cm', handleClearMessage);
　　　　　this.scenarioManager.registerTag('er', handleErase);
        this.scenarioManager.registerTag('delay', handleDelay);
        this.scenarioManager.registerTag('image', handleImage);
        this.scenarioManager.registerTag('freeimage', handleFreeImage);
        this.scenarioManager.registerTag('button', handleButton);
        this.scenarioManager.registerTag('call', handleCall);
        this.scenarioManager.registerTag('return', handleReturn);
        this.scenarioManager.registerTag('stop_anim', handleStopAnim);
        this.scenarioManager.registerTag('fadeout', handleFadeout);
this.scenarioManager.registerTag('fadein', handleFadein);
this.scenarioManager.registerTag('video', handleVideo);
this.scenarioManager.registerTag('stopvideo', handleStopVideo);
         this.events.on('execute-return', (params) => {
            console.log("--- GameScene: 'execute-return' 受信！ ---");
            console.log("受信パラメータ:", params);
            this.performReturn(params);
        });
       // ★★★ ゲーム開始ロジックを、起動状態によって分岐させる ★★★
        if (this.isResuming) {
            // --- サブシーンからの復帰の場合 ---
            console.log("GameScene: 復帰処理を実行します。");
            this.performReturn(this.returnParams);
        } else {
            // --- 通常の初回起動の場合 ---
            this.scenarioManager.load(this.startScenario);
            if (this.startLabel) {
                this.scenarioManager.jumpTo(this.startLabel);
            }
            this.time.delayedCall(10, () => { this.scenarioManager.next(); }, [], this);
        }
        
        this.input.once('pointerdown', () => { if (this.sound.context.state === 'suspended') this.sound.context.resume(); }, this);
        this.input.on('pointerdown', () => { this.scenarioManager.onClick(); });
        
        console.log("GameScene: create 完了");
    }
// GameScene.js

// ...

performSave(slot) {
        // ★★★★★ この行を追加 ★★★★★
        console.trace("performSave が呼び出されました！犯人は誰だ！");

        console.log("========== GameScene.performSave が呼ばれました ==========");
        try {
            const gameState = this.stateManager.getState(this.scenarioManager);
            
            const jsonString = JSON.stringify(gameState, null, 2);
            localStorage.setItem(`save_data_${slot}`, jsonString);
            console.log(`スロット[${slot}]にセーブしました。`, gameState);
        } catch (e) {
            console.error(`セーブに失敗しました: スロット[${slot}]`, e);
        }
    }

/**
 * 溜まっている選択肢情報を元に、ボタンを一括で画面に表示する
 */
displayChoiceButtons() {
     // ★ 選択肢表示時に、ブロッカーを最前面に表示
    this.choiceInputBlocker.setVisible(true);
    this.children.bringToTop(this.choiceInputBlocker);
    // Y座標の計算を、全体のボタン数に基づいて行う
    const totalButtons = this.pendingChoices.length;
    const startY = (this.scale.height / 2) - ((totalButtons - 1) * 60); // 全体が中央に来るように開始位置を調整
// ★★★ ボタンの見た目をここで定義 ★★★
    const buttonStyle = {
        fontSize: '40px', // 文字を少し大きく
        fill: '#ccc',
        backgroundColor: '#333333',
        // 内側の余白を調整
        padding: {
            x: 40, // 横の余白を増やす
            y: 10  // 縦の余白を増やす
        },
        align: 'center'
    };
     const buttonHeight = 120; // ボタン間のY座標の間隔
    this.pendingChoices.forEach((choice, index) => {
        const y = startY + (index * 120); // ボタン間のスペース

    const button = this.add.text(this.scale.width / 2, y, choice.text, { fontSize: '40px', fill: '#fff', backgroundColor: '#555', padding: { x: 20, y: 10 }})
        .setOrigin(0.5)
        .setInteractive();
   
        this.children.bringToTop(button);
        button.on('pointerdown', () => {
            this.clearChoiceButtons();
            this.scenarioManager.jumpTo(choice.target);
        });

        this.choiceButtons.push(button);
    });

    this.pendingChoices = []; // 溜めていた情報はクリア
}
 
// ★★★ ボタンを消すためのヘルパーメソッドを追加 ★★★
clearChoiceButtons() {
     // ★ 選択肢を消す時に、ブロッカーも非表示にする
    this.choiceInputBlocker.setVisible(false);
  //  this.inputBlocker.setVisible(false);
    this.choiceButtons.forEach(button => button.destroy());
    this.choiceButtons = []; // 配列を空にする
    // 選択肢待ち状態を解除
    if (this.scenarioManager) {
        this.scenarioManager.isWaitingChoice = false;
    }
}

// GameScene.js
    async performReturn(params, returnInfo) {
        console.log("GameScene: performReturn実行", params, returnInfo);
        
        // 1. 変数更新
        for (const key in params) {
            this.scenarioManager.stateManager.eval(`${key}="${params[key]}"`);
        }
        
        // 2. シナリオコンテキストを復元
        // (loadScenarioは使わない)
        const rawText = this.cache.text.get(returnInfo.file);
        this.scenarioManager.scenario = rawText.split(/\r\n|\n|\r/).filter(line => line.trim() !== '');
        this.scenarioManager.currentFile = returnInfo.file;
        this.scenarioManager.currentLine = returnInfo.line;

        // 3. 画面の再構築
        // rebuildSceneのロジックをここに展開しても良いが、
        // 戻るだけなら、現在の画面を維持した方が自然な場合も多い。
        // ここでは、単純に次の行から再開する。
        this.scenarioManager.next();
    }


   // ★★★ performLoad を修正 ★★★
async performLoad(slot) {
      console.log("========== GameScene.performロードが呼ばれました ==========");
    try {
        const jsonString = localStorage.getItem(`save_data_${slot}`);
        if (!jsonString) {
            console.warn(`スロット[${slot}]にセーブデータがありません。`);
            this.scene.stop('SaveLoadScene');
            this.scene.resume('GameScene');
            return;
        }
        const loadedState = JSON.parse(jsonString);

        // ★ まずSaveLoadSceneを閉じる
        this.scene.stop('SaveLoadScene');

        // ★ StateManagerに変数を復元させる
        this.stateManager.setState(loadedState);
        console.log(`スロット[${slot}]からロードしました。`, loadedState);

        // ★ 画面とシナリオの内部状態を完全に再構築
        await rebuildScene(this.scenarioManager, loadedState);
        
        // ★ ロード後の再開処理 ★
        // isWaitingChoice/isWaitingClickの状態はrebuildSceneで復元済み。
        // それに応じてUIも再表示されているはず。
        // それらでない場合(タグ実行直後など)のみ、next()を呼んで再開する。
        if (!this.scenarioManager.isWaitingChoice && !this.scenarioManager.isWaitingClick) {
            console.log("ロード完了: 次の行からシナリオを再開します。");
            // 少し遅延させて呼び出すのが安全
            this.time.delayedCall(10, () => { this.scenarioManager.next(); }, [], this);
        } else {
            console.log("ロード完了: ユーザーの入力を待機します。");
        }

    } catch (e) {
        console.error(`ロード処理でエラーが発生しました。`, e);
    }
}
}
// ★★★ rebuildScene ヘルパー関数を全面的に修正 ★★★
// (GameScene.jsの末尾に配置)

async function rebuildScene(manager, state) {
    console.log("--- rebuildScene 開始 ---", state);
    const scene = manager.scene;

    // 1. 現在の表示と状態をクリア
    scene.clearChoiceButtons();
    manager.layers.background.removeAll(true);
    manager.layers.character.removeAll(true);
    scene.characters = {};
    manager.soundManager.stopBgm();
    manager.messageWindow.reset(); // MessageWindowの状態もリセット

    // 2. ★ シナリオの「論理的な状態」を復元
    manager.currentFile = state.scenario.fileName;
    manager.currentLine = state.scenario.line;
    manager.ifStack = state.scenario.ifStack || [];
    manager.callStack = state.scenario.callStack || [];
    manager.isWaitingClick = state.scenario.isWaitingClick || false;
    manager.isWaitingChoice = state.scenario.isWaitingChoice || false;

    // ★ シナリオテキストをキャッシュから再設定
    // 動的ロードの可能性があるため、loadScenarioを使うのが最も堅牢
    await manager.loadScenario(manager.currentFile);
    // loadScenarioは行を0に戻すので、ロードした行番号で上書きする
    manager.currentLine = state.scenario.line; 

    // 3. 背景を復元
    if (state.layers.background) {
        const bg = scene.add.image(scene.scale.width / 2, scene.scale.height / 2, state.layers.background);
        bg.setDisplaySize(scene.scale.width, scene.scale.height);
        manager.layers.background.add(bg);
    }
    
    // 4. キャラクターを復元
    if (state.layers.characters) {
        for (const name in state.layers.characters) {
            const charaData = state.layers.characters[name];
            const chara = scene.add.image(charaData.x, charaData.y, charaData.storage);
            chara.setScale(charaData.scaleX, charaData.scaleY)
                 .setAlpha(charaData.alpha)
                 .setFlipX(charaData.flipX)
                 .setTint(charaData.tint); // ★ Tintも復元
            manager.layers.character.add(chara);
            scene.characters[name] = chara;
        }
    }

    // 5. BGMを復元
    if (state.sound && state.sound.bgm) {
        manager.soundManager.playBgm(state.sound.bgm);
    }
    
    // 6. ★ メッセージウィンドウを復元 (クリック待ちだった場合)
    if (state.scenario.isWaitingClick) {
        manager.messageWindow.setSpeaker(state.scenario.speakerName);
        // 第2引数trueでタイプライターなしの即時表示
        manager.messageWindow.setText(state.scenario.currentText, true); 
        manager.messageWindow.showClickIndicator(); // クリック待ち矢印を表示
    }

    // 7. ★ 選択肢を復元
    if (state.scenario.isWaitingChoice) {
        scene.pendingChoices = state.scenario.pendingChoices || [];
        if (scene.pendingChoices.length > 0) {
            scene.displayChoiceButtons();
        }
    }
    
    console.log("--- rebuildScene 正常終了 ---");
}
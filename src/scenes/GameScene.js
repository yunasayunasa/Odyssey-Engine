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
       // --- 4. 必要なイベントリスナーを設定 ---
        this.input.on('pointerdown', () => { this.scenarioManager.onClick(); });
        
        // ★★★ サブシーンからの復帰命令を待つ、唯一のリスナー ★★★
        this.events.on('return-from-sub-scene', (data) => {
            console.log("GameScene: 復帰命令を受信しました。");
            this.performReturn(data.params);
        });

        // --- 5. ゲームの開始処理 ---
        if (this.isResuming) {
            // ★ サブシーンから戻ってきた場合 (startで再起動された場合)
            // performReturnが呼ばれるのを待つので、ここでは何もしない
            console.log("GameScene: 復帰待機状態で起動しました。");
        } else {
            // ★ 通常の初回起動の場合
            this.scenarioManager.load(this.startScenario);
            if (this.startLabel) {
                this.scenarioManager.jumpTo(this.startLabel);
            }
            this.time.delayedCall(10, () => {
                // サウンド有効化もここで行うのが最も安全
                if (this.sound.context.state === 'suspended') {
                    this.sound.context.resume();
                }
                this.scenarioManager.next();
            }, [], this);
        }
        
        console.log("GameScene: create 完了");
    }

    // GameSceneクラスの中に追加
performSave(slot) {
    try {
        const gameState = this.stateManager.getState();
        gameState.saveDate = new Date().toLocaleString();
        const jsonString = JSON.stringify(gameState);
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
    this.inputBlocker.setVisible(false);
    this.choiceButtons.forEach(button => button.destroy());
    this.choiceButtons = []; // 配列を空にする
    // 選択肢待ち状態を解除
    if (this.scenarioManager) {
        this.scenarioManager.isWaitingChoice = false;
    }
}

clearChoiceButtons() {
    this.choiceButtons.forEach(button => button.destroy());
    this.choiceButtons = [];
    this.pendingChoices = []; // 念のためこちらもクリア
    if (this.scenarioManager) {
        this.scenarioManager.isWaitingChoice = false;
       // ★★★ StateManagerの状態もリセット ★★★
        this.scenarioManager.stateManager.state.status.isWaitingChoice = false;
        this.scenarioManager.stateManager.state.status.pendingChoices = [];
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


    
    // ★★★ performLoadメソッドを、この内容で完全に置き換えてください ★★★
    performLoad(slot) {
        try {
            const jsonString = localStorage.getItem(`save_data_${slot}`);
            if (!jsonString) {
                console.warn(`スロット[${slot}]にセーブデータがありません。`);
                return;
            }
            const loadedState = JSON.parse(jsonString);
            console.log(`スロット[${slot}]からロードしました。`, loadedState);

            // 1. rebuildSceneで、見た目と内部状態を復元する
            rebuildScene(this, loadedState);
            
            // 2. 復元した行から、シナリオを再開する
            this.scenarioManager.next();

        } catch (e) {
            console.error(`ロード処理でエラーが発生しました。`, e);
        }
    }
}

// ★★★ rebuildSceneヘルパー関数を、この内容で完全に置き換えてください ★★★
function rebuildScene(scene, state) {
    console.log("--- rebuildScene 開始 ---");
    const manager = scene.scenarioManager;

    // 1. 現在の表示をすべてクリア
    scene.layer.background.removeAll(true);
    scene.layer.character.removeAll(true);
    scene.characters = {};
    manager.soundManager.stopBgm();

    // 2. StateManagerの状態を、ロードしたデータで完全に上書き
    manager.stateManager.setState(state);
    
    // 3. ScenarioManagerの内部状態を、復元したstateから設定
    manager.currentFile = state.scenario.fileName;
    manager.currentLine = state.scenario.line;
    manager.ifStack = state.ifStack || [];       // セーブデータにifStackがなければ空配列
    manager.callStack = state.callStack || []; // セーブデータにcallStackがなければ空配列

    // 4. シナリオ配列を再構築
    const rawText = scene.cache.text.get(manager.currentFile);
    if (!rawText) throw new Error(`シナリオ[${manager.currentFile}]のキャッシュが見つかりません。`);
    manager.scenario = rawText.split(/\r\n|\n|\r/).filter(line => line.trim() !== '');

    // 5. 見た目を再構築 (背景、キャラ、BGM)
    if (state.layers.background) {
        const bg = scene.add.image(640, 360, state.layers.background);
        scene.layer.background.add(bg);
    }
    for (const name in state.layers.characters) {
        const charaData = state.layers.characters[name];
        const chara = scene.add.image(charaData.x, charaData.y, charaData.storage);
        chara.setData('pos', charaData.pos);
        chara.setTint(0xffffff); // 必ず明るい状態に戻す
        chara.setFlipX(charaData.flipX || false); // 反転状態も復元
        chara.setScale(charaData.scale || 1); // スケールも復元
        scene.layer.character.add(chara);
        scene.characters[name] = chara;
    }
    if (state.sound.bgm) {
        manager.soundManager.playBgm(state.sound.bgm);
    }
    
    // 6. UIをリセット
    manager.messageWindow.setText('', false);
    manager.highlightSpeaker(null);
    console.log("--- rebuildScene 正常終了 ---");
}
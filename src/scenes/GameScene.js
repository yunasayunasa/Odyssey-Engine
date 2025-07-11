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
        
        // --- レイヤー生成 ---
        this.layer.background = this.add.container(0, 0);
        this.layer.character = this.add.container(0, 0);
        this.layer.cg = this.add.container(0, 0);
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
        fill: '#fff',
        backgroundColor: '#333333',
        // 内側の余白を調整
        padding: {
            x: 40, // 横の余白を増やす
            y: 20  // 縦の余白を増やす
        },
        align: 'center'
    };
    this.pendingChoices.forEach((choice, index) => {
        const y = startY + (index * 120); // ボタン間のスペース

    const button = this.add.text(this.scale.width / 2, y, choice.text, { fontSize: '100px', fill: '#fff', backgroundColor: '#555', padding: { x: 20, y: 10 }})
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


    // GameSceneクラスの中に追加
async performLoad(slot) { // asyncに戻しておくと後々安全
    try {
        const jsonString = localStorage.getItem(`save_data_${slot}`);
        if (!jsonString) {
            console.warn(`スロット[${slot}]にセーブデータがありません。`);
            return;
        }
        const loadedState = JSON.parse(jsonString);
        this.stateManager.setState(loadedState);
        console.log(`スロット[${slot}]からロードしました。`, loadedState);

        rebuildScene(this.scenarioManager, loadedState);
        
        // ★★★ ここからデバッグログ ★★★
        console.log("--- performLoad: シナリオ再開処理 ---");

        // ScenarioManagerが持つシナリオ配列は正しいか？
        if (!this.scenarioManager.scenario) {
            console.error("エラー: scenarioManager.scenarioが存在しません！");
            return;
        }
        console.log(`シナリオ配列の長さ: ${this.scenarioManager.scenario.length}`);
        
        // currentLineは正しいか？
        console.log(`再開行番号: ${this.scenarioManager.currentLine}`);

        if (this.scenarioManager.currentLine >= this.scenarioManager.scenario.length) {
            console.error("エラー: 再開行番号がシナリオの範囲外です！");
            return;
        }
        
        // 行テキストの取得
        const line = this.scenarioManager.scenario[this.scenarioManager.currentLine];
        console.log(`再開する行テキスト: "${line}"`);

        // 行番号を進める
        this.scenarioManager.currentLine++;

        // パース実行
        console.log("parseを実行します...");
        this.scenarioManager.parse(line);
        console.log("performLoad 正常終了");
        
    } catch (e) {
        // ★★★ エラーオブジェクトも出力する ★★★
        console.error(`ロード処理でエラーが発生しました。`, e);
    }
}
}
/**
 * ロードした状態に基づいて、シーンの表示を再構築するヘルパー関数
 * @param {ScenarioManager} manager - 操作対象のシナリオマネージャー
 * @param {Object} state - ロードした状態オブジェクト
 */
function rebuildScene(manager, state) {
    console.log("--- rebuildScene 開始 ---");
    const scene = manager.scene;

    // 1. 現在の表示をすべてクリア
    console.log("1. レイヤーをクリアします...");
    manager.layers.background.removeAll(true);
    manager.layers.character.removeAll(true);
    scene.characters = {}; // キャラクター管理リストもリセット
    manager.soundManager.stopBgm();
    console.log("...レイヤークリア完了");

    // 2. シナリオを復元
    console.log("2. シナリオ情報を復元します...");
    manager.currentFile = state.scenario.fileName;
    manager.currentLine = state.scenario.line;
    console.log(`...シナリオ情報: file=${manager.currentFile}, line=${manager.currentLine}`);

    if (!scene.cache.text.has(manager.currentFile)) {
        throw new Error(`シナリオファイル[${manager.currentFile}]がキャッシュにありません。`);
    }
    const rawText = scene.cache.text.get(manager.currentFile);
    manager.scenario = rawText.split(/\r\n|\n|\r/).filter(line => line.trim() !== '');
    console.log("...シナリオキャッシュOK、再構築完了");

    // 3. 背景を復元
    console.log("3. 背景を復元します...");
    if (state.layers.background) {
        if (!scene.textures.exists(state.layers.background)) {
            throw new Error(`背景テクスチャ[${state.layers.background}]がキャッシュにありません。`);
        }
        const bg = scene.add.image(scene.scale.width / 2, scene.scale.height / 2, state.layers.background);
        bg.setDisplaySize(scene.scale.width, scene.scale.height);
        manager.layers.background.add(bg);
    }
    console.log("...背景復元完了");
    
    // 4. キャラクターを復元
    console.log("4. キャラクターを復元します...");
    for (const name in state.layers.characters) {
        const charaData = state.layers.characters[name];
        console.log(`...キャラクター[${name}]を復元中...`);
        if (!scene.textures.exists(charaData.storage)) {
            throw new Error(`キャラクターテクスチャ[${charaData.storage}]がキャッシュにありません。`);
        }
        const chara = scene.add.image(charaData.x, charaData.y, charaData.storage);
        // ★★★ 必ずTintをリセットして明るい状態にする ★★★
        chara.setTint(0xffffff);

        manager.layers.character.add(chara);
        scene.characters[name] = chara; // 管理リストに再登録
    }
    console.log("...キャラクター復元完了");

    // 5. BGMを復元
   console.log("5. BGMを復元します...");
    if (state.sound.bgm) {
        manager.soundManager.playBgm(state.sound.bgm);
    }
    console.log("...BGM復元完了");
    
       // 6. メッセージウィンドウをリセット
    manager.messageWindow.setText('');

    // ★★★ 7. 話者とハイライトを復元 ★★★
   /* let speakerName = null;
    const line = manager.scenario[manager.currentLine];
    const speakerMatch = line.trim().match(/^([a-zA-Z0-9_]+):/);
    if (speakerMatch) {
        speakerName = speakerMatch[1];
    }
    manager.highlightSpeaker(speakerName);*/
    
    console.log("--- rebuildScene 正常終了 ---");
}
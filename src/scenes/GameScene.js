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
        // プロパティの初期化
        this.scenarioManager = null;
        this.soundManager = null;
        this.stateManager = null;
        this.messageWindow = null;
        this.layer = { background: null, character: null, cg: null, message: null };
        this.charaDefs = null;
        this.characters = {};
        this.configManager = null;
        this.choiceButtons = [];
        this.pendingChoices = [];
        this.uiButtons = [];
    }

    init(data) {
        this.charaDefs = data.charaDefs;
        this.startScenario = data.startScenario || 'scene1.ks';
        this.startLabel = data.startLabel || null;

        // ★ isResumingとreturnParamsはSystemSceneとの連携で使うので残しておく
        this.isResuming = data.resumedFrom ? true : false;
        this.returnParams = data.returnParams || null;
    }

    preload() {
        // PreloadSceneでロード済みのはずだが、念のため
        this.load.text('scene1', 'assets/scene1.ks');
    }

    create() {
        this.cameras.main.setBackgroundColor('#000000');
        
        // --- レイヤー生成 ---
        this.layer.background = this.add.container(0, 0).setDepth(0);
        this.layer.character = this.add.container(0, 0).setDepth(10); // キャラを少し手前に
        this.layer.cg = this.add.container(0, 0).setDepth(5);
        this.layer.message = this.add.container(0, 0).setDepth(20);

        // --- 入力ブロッカー ---
        this.choiceInputBlocker = this.add.rectangle(this.scale.width / 2, this.scale.height / 2, this.scale.width, this.scale.height)
            .setInteractive().setVisible(false);
        this.choiceInputBlocker.on('pointerdown', () => console.log("選択肢を選んでください"));

        // --- マネージャー/UIクラスの生成 ---
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
      
        // --- イベントリスナー ---
        // ★ SystemSceneからの復帰処理は、より汎用的なイベント名にすると良い
        this.events.on('resume-from-subscene', (data) => {
            console.log("--- GameScene: サブシーンから復帰 ---", data);
            // サブシーンから返された変数をゲーム内変数に反映
            if (data.returnParams) {
                for (const key in data.returnParams) {
                    this.stateManager.eval(`f.${key} = "${data.returnParams[key]}"`);
                }
            }
            // 止まっていたシナリオを再開
            this.scenarioManager.next();
        });

        // --- ゲーム開始ロジック ---
        if (this.isResuming) {
            // isResumingはSystemSceneとの連携用。ここでは何もしないか、特定の復帰処理を行う。
            // 今回のセーブ＆ロードとは直接関係しない。
        } else {
            // 通常の初回起動
            this.scenarioManager.loadScenario(this.startScenario, this.startLabel);
            this.time.delayedCall(10, () => this.scenarioManager.next());
        }
        
        // グローバルクリックイベント
        this.input.on('pointerdown', () => this.scenarioManager.onClick());
        
        console.log("GameScene: create 完了");
    }
 // ★★★ セーブ処理 ★★★
    performSave(slot) {
        // デバッグ用のtraceは不要なら削除
        // console.trace("performSave が呼び出されました！");
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
           
            this.scenarioManager.jumpTo(choice.target);
             this.clearChoiceButtons();
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



   // ★★★ performLoad を修正 ★★★
 // ★★★ ロード処理 ★★★
    async performLoad(slot) {
        try {
            const jsonString = localStorage.getItem(`save_data_${slot}`);
            if (!jsonString) {
                console.warn(`スロット[${slot}]にセーブデータがありません。`);
                return;
            }
            const loadedState = JSON.parse(jsonString);

            // StateManagerに変数を復元させる
            this.stateManager.setState(loadedState);
            console.log(`スロット[${slot}]からロードしました。`, loadedState);

            // 画面とシナリオの内部状態を完全に再構築
            await rebuildScene(this.scenarioManager, loadedState);
            
            // ロード後のシナリオ再開処理
            if (loadedState.scenario.isWaitingClick || loadedState.scenario.isWaitingChoice) {
                console.log("ロード完了: ユーザーの入力を待機します。");
            } else {
                console.log("ロード完了: 次の行からシナリオを再開します。");
                this.time.delayedCall(10, () => this.scenarioManager.next());
            }
        } catch (e) {
            console.error(`ロード処理でエラーが発生しました。`, e);
        }
    }}
// ★★★ rebuildScene ヘルパー関数 (最終版) ★★★
async function rebuildScene(manager, state) {
    console.log("--- rebuildScene 開始 ---", state);
    const scene = manager.scene;

    // 1. 現在の表示と状態をクリア
    scene.clearChoiceButtons();
    manager.layers.background.removeAll(true);
    manager.layers.character.removeAll(true);
    scene.characters = {};
    manager.soundManager.stopBgm(); // フェードなしで即時停止
    manager.messageWindow.reset();
    scene.cameras.main.resetFX(); // カメラエフェクトもリセット

    // 2. シナリオの「論理的な状態」を復元
    manager.currentFile = state.scenario.fileName;
    manager.currentLine = state.scenario.line;
    manager.ifStack = state.scenario.ifStack || [];
    manager.callStack = state.scenario.callStack || [];
    manager.isWaitingClick = state.scenario.isWaitingClick;
    manager.isWaitingChoice = state.scenario.isWaitingChoice;

    await manager.loadScenario(manager.currentFile);
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
                 .setTint(charaData.tint);
            manager.layers.character.add(chara);
            scene.characters[name] = chara;
        }
    }

    // 5. BGMを復元
    if (state.sound && state.sound.bgm) {
        // ★ BGMはフェードインなしで再生するのが一般的
        manager.soundManager.playBgm(state.sound.bgm, 0); 
    }
    
    // 6. メッセージウィンドウを復元 (クリック待ちだった場合)
    if (state.scenario.isWaitingClick) {
        // ★ 話者情報も渡して復元 ★
        manager.messageWindow.setText(state.scenario.currentText, false, () => {
            manager.messageWindow.showNextArrow();
        }, state.scenario.speakerName);
        // ハイライトも復元
        manager.highlightSpeaker(state.scenario.speakerName);
    }

    // 7. 選択肢を復元
    if (state.scenario.isWaitingChoice) {
        scene.pendingChoices = state.scenario.pendingChoices || [];
        if (scene.pendingChoices.length > 0) {
            scene.displayChoiceButtons();
        }
    }
    
    console.log("--- rebuildScene 正常終了 ---");
}
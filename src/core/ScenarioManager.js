export default class ScenarioManager {
    constructor(scene, layers, charaDefs, messageWindow, soundManager, stateManager, configManager) {
        this.scene = scene;
        this.layers = layers;
        this.characterDefs = charaDefs || {};
        this.messageWindow = messageWindow;
        this.soundManager = soundManager;
        this.stateManager = stateManager;
        this.configManager = configManager;

        this.scenario = [];
        this.currentFile = null;
        this.currentLine = 0;
        this.isWaitingClick = false;
        this.isWaitingTag = false;
        this.isEnd = false;

           // ★★★ 進行モードを管理するプロパティを追加 ★★★
        this.mode = 'normal'; // 'normal', 'skip', 'auto'
        this.autoTimer = null; // オートモード用のタイマー
        

        this.tagHandlers = new Map();
        this.ifStack = [];
        this.callStack = [];
    }

    registerTag(tagName, handler) {
        this.tagHandlers.set(tagName, handler);
    }

    load(scenarioKey) {
        const rawText = this.scene.cache.text.get(scenarioKey);
        if (!rawText) {
            console.error(`シナリオファイル [${scenarioKey}] が見つからないか、中身が空です。`);
            this.isEnd = true;
            return;
        }
        this.scenario = rawText.split(/\r\n|\n|\r/).filter(line => line.trim() !== '');
        this.currentFile = scenarioKey;
        this.currentLine = 0;
        console.log(`シナリオを解析しました: ${this.currentFile}`);
    }

  async  next() {
        if (this.isEnd || this.isWaitingClick || this.isWaitingTag) {
            return;
        }
        if (this.currentLine >= this.scenario.length) {
            this.messageWindow.setText('（シナリオ終了）', false);
            this.isEnd = true;

            return;
        }
        
        
        const line = this.scenario[this.currentLine];
        this.currentLine++;
        
        await this.parse(line);
    }
    
  async  onClick() {
        if (this.isEnd || this.isWaitingTag) return;
          // ★★★ 選択肢の表示中は、通常のクリック進行を無効化 ★★★
        if (this.isWaitingChoice) {
            console.log("選択肢の選択を待っています...");
            return; // 何もせずに終了
        }
        this.messageWindow.hideNextArrow();
        if (this.messageWindow.isTyping) {
            this.messageWindow.skipTyping();
            return;
        }
        if (this.isWaitingClick) {
             // ★ オートモード中にクリックされたら、オートを一旦停止・再開する
            if (this.mode === 'auto' && this.autoTimer) {
                this.autoTimer.remove();
                this.autoTimer = null;
            }
            this.isWaitingClick = false;
          await  this.next();
        }
       // ★ スキップモード中は、クリックでスキップを解除する
        if (this.mode === 'skip') {
            this.setMode('normal');
            return;
        }
    }

      async parse(line) {
        const processedLine = this.embedVariables(line);
        const trimedLine = processedLine.trim();

        // スキップ判定
        const ifState = this.ifStack.length > 0 ? this.ifStack[this.ifStack.length - 1] : null;
        if (ifState && ifState.skipping) {
            const { tagName } = this.parseTag(trimedLine);
            if (['if', 'elsif', 'else', 'endif'].includes(tagName)) {
                const handler = this.tagHandlers.get(tagName);
                if (handler) handler(this, this.parseTag(trimedLine).params);
            }
            this.next();
            return;
        }
        
        // 通常実行
        if (trimedLine.startsWith(';') || trimedLine.startsWith('*')|| trimedLine.startsWith('@')) {
            this.next();
        } else if (trimedLine.match(/^([a-zA-Z0-9_]+):/)) {
            // 話者指定行
            const speakerMatch = trimedLine.match(/^([a-zA-Z0-9_]+):/);
            const speakerName = speakerMatch[1];
            const dialogue = trimedLine.substring(speakerName.length + 1).trim();
            this.stateManager.addHistory(speakerName, dialogue);
            this.highlightSpeaker(speakerName);
            const wrappedLine = this.manualWrap(dialogue);
            this.isWaitingClick = true;
            
            this.messageWindow.setText(wrappedLine, true, () => {
                this.messageWindow.showNextArrow();
                if (this.mode === 'auto') {
                    this.startAutoMode();
                }
            });
            return;
        } else if (trimedLine.startsWith('[')) {
           // タグ行
            const { tagName, params } = this.parseTag(trimedLine);
            const handler = this.tagHandlers.get(tagName);
            if (handler) {
                // ★★★ isWaitingTagはもう使わない ★★★
                // this.isWaitingTag = true;

                // ★★★ ハンドラの実行結果を受け取る ★★★
                const promise = handler(this, params);

                // ★★★ もしPromiseが返ってきたら、それが終わるまで待つ ★★★
                if (promise instanceof Promise) {
                    await promise;
                }
            } else {
                console.warn(`未定義のタグです: [${tagName}]`);
            }
            // ★★★ 最後に必ずnext()を呼ぶ ★★★
            this.next();
        
        }  else if (trimedLine.length > 0) {
            // 地の文
            this.stateManager.addHistory(null, trimedLine);
            this.highlightSpeaker(null);
            this.isWaitingClick = true; 
            const wrappedLine = this.manualWrap(trimedLine);
            this.messageWindow.setText(wrappedLine, true, () => {
                this.messageWindow.showNextArrow();
                
            });
            return;
        } else {
            // 空行
            this.next();
        }
    }
    
    finishTagExecution() {
        this.isWaitingTag = false;
        this.next();
    }
    
     // (constructor, next, parseなどの他の部分は、あなたの正常に動作しているコードのままでOKです)
// ★★★ loadScenarioメソッドだけを、以下のコードで完全に置き換えてください ★★★

    
     // (constructor, next, parseなどの他の部分は、あなたの正常に動作しているコードのままでOKです)
// ★★★ loadScenarioメソッドだけを、以下のコードで完全に置き換えてください ★★★

    async loadScenario(scenarioKey, targetLabel = null) {
        console.log(`[loadScenario] 開始: ${scenarioKey}`);
        let rawText;

        // --- 1. シナリオテキストの取得 ---
        if (this.scene.cache.text.has(scenarioKey)) {
            rawText = this.scene.cache.text.get(scenarioKey);
        } else {
            console.log(`動的ロード: ${scenarioKey} のテキストを読み込みます。`);
            await new Promise(resolve => {
                this.scene.load.text(scenarioKey, `assets/${scenarioKey}`);
                this.scene.load.once('complete', resolve);
                this.scene.load.start();
            });
            rawText = this.scene.cache.text.get(scenarioKey);
        }
        if (!rawText) { throw new Error(`シナリオテキスト[${scenarioKey}]のロードに失敗しました。`); }

        // --- 2. @asset宣言の解析 ---
        const assetsToLoad = [];
        const lines = rawText.split(/\r\n|\n|\r/);
        for (const line of lines) {
            const trimedLine = line.trim();
            if (trimedLine.startsWith('@asset')) {
                const parts = trimedLine.split(/\s+/).slice(1); // '@asset'は無視
                const params = {};
                parts.forEach(part => {
                    const [key, value] = part.split('=');
                    params[key] = value;
                });
                
                const { type, key, path } = params;
                if (!type || !key || !path) continue;

                if ((type === 'image' && !this.scene.textures.exists(key)) ||
                (type === 'audio' && !this.scene.cache.audio.has(key))) {
                assetsToLoad.push({ type, key, path });
            }
            }
            if (trimedLine.startsWith('*')) break;
        }

        // --- 3. 動的ロードの実行 ---
        if (assetsToLoad.length > 0) {
            console.log("追加アセットの動的ロードが必要です:", assetsToLoad);
            
            await new Promise(resolve => {
                this.scene.scene.launch('LoadingScene', {
                    assets: assetsToLoad,
                    onComplete: resolve
                });
            });
            console.log("追加アセットのロードが完了しました。");
        }

        // --- 4. シナリオコンテキストの入れ替え ---
        this.load(scenarioKey);
        if (targetLabel) {
            this.jumpTo(targetLabel);
        }
    }

    jumpTo(target) {
        const labelName = target.substring(1);
        const targetLineIndex = this.scenario.findIndex(line => line.trim().startsWith('*') && line.trim().substring(1) === labelName);
        if (targetLineIndex !== -1) {
            this.currentLine = targetLineIndex;
        } else {
            console.error(`ジャンプ先のラベル[${target}]が見つかりませんでした。`);
        }
    }

    embedVariables(line) {
        return line.replace(/&((f|sf)\.[a-zA-Z0-9_.-]+)/g, (match, exp) => {
            const value = this.stateManager.eval(exp);
            if (value === undefined || value === null) {
                return `(undef: ${exp})`;
            }
            return value;
        });
    }

    parseTag(tagString) {
        const content = tagString.substring(1, tagString.length - 1).trim();
        const firstSpaceIndex = content.indexOf(' ');
        const tagName = firstSpaceIndex === -1 ? content : content.substring(0, firstSpaceIndex);
        const attributesString = firstSpaceIndex === -1 ? '' : content.substring(firstSpaceIndex + 1);
        const params = {};
        const regex = /(\w+)\s*=\s*("[^"]*"|'[^']*'|[^'"\s]+)/g;
        let match;
        while ((match = regex.exec(attributesString)) !== null) {
            const key = match[1];
            let value = match[2];
            if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
                value = value.substring(1, value.length - 1);
            }
            params[key] = value;
        }
        return { tagName, params };
    }
    
    manualWrap(text) {
        // ★★★ 1. 最初に[br]を改行コード(\n)にすべて置換する ★★★
        const textWithBr = text.replace(/\[br\]/g, '\n');

        let wrappedText = '';
        let currentLine = '';
        const textBoxWidth = this.messageWindow.textBoxWidth;
        const style = { fontFamily: this.messageWindow.textObject.style.fontFamily, fontSize: this.messageWindow.textObject.style.fontSize };

        // ★★★ 2. 置換後のテキストを、改行コードで一度分割する ★★★
        const lines = textWithBr.split('\n');

        // 3. 分割された各行に対して、自動折り返し処理を行う
        for (const singleLine of lines) {
            let lineBuffer = '';
            for (let i = 0; i < singleLine.length; i++) {
                const char = singleLine[i];
                const testLine = lineBuffer + char;
                const metrics = this.scene.add.text(0, 0, testLine, style).setVisible(false);
                
                if (metrics.width > textBoxWidth && lineBuffer.length > 0) {
                    wrappedText += lineBuffer + '\n';
                    lineBuffer = char;
                } else {
                    lineBuffer = testLine;
                }
                metrics.destroy();
            }
            wrappedText += lineBuffer + '\n'; // 各行の終わりにも改行を追加
        }
        
        // 最後に余分な改行が残ることがあるので、削除する
        return wrappedText.trimEnd();
    }

    highlightSpeaker(speakerName) {
        const bright = 0xffffff;
        const dark = 0x888888;
        for (const name in this.scene.characters) {
            const chara = this.scene.characters[name];
            if (chara && chara.active) {
                if (speakerName === null || speakerName === name) {
                    chara.setTint(bright);
                } else {
                    chara.setTint(dark);
                }
            }
        }
    }

        // ...

    // ★★★ モードを切り替えるためのメソッド ★★★
       setMode(newMode) {
        if (this.mode === newMode && newMode !== 'skip') {
             // スキップモードでない時に同じボタンが押されたら、モードをノーマルに戻す
             this.mode = 'normal';
             if (this.autoTimer) this.autoTimer.remove();
             console.log(`モード変更: ${newMode} -> normal`);
             return;
        }

        console.log(`モード変更: ${this.mode} -> ${newMode}`);
        this.mode = newMode;

        if (this.autoTimer) this.autoTimer.remove();

        if (this.mode === 'skip') {
            // ★★★ スキップループを開始 ★★★
            this.skipLoop();
        } else if (this.mode === 'auto') {
            this.startAutoMode();
        }
    }

    // ★★★ スキップ専用のループメソッドを新設 ★★★
    skipLoop() {
        // スキップモードでない、または待機状態ならループを止める
        if (this.mode !== 'skip' || this.isWaitingChoice || this.isEnd) {
            console.log("スキップを停止します。");
            this.setMode('normal'); // 通常モードに戻す
            return;
        }

        // isWaitingClickを強制的に解除し、次の行へ
        this.isWaitingClick = false;
        this.next();
        
        // ★★★ 非常に短い遅延で、自分自身をもう一度呼び出す ★★★
        // これにより、ブラウザをフリーズさせずに高速なループを実現する
        setTimeout(() => this.skipLoop(), 0);
    }
    // ★★★ オートモードのタイマーを開始するメソッド ★★★
    startAutoMode() {
        if (this.isWaitingClick) {
            // 現在クリック待ち状態なら、オートモードを開始
            const autoDelay = 2000; // 2秒後に次に進む (コンフィグで変更できるようにすると尚良い)
            this.autoTimer = this.scene.time.addEvent({
                delay: autoDelay,
                callback: () => {
                    // isWaitingClickをfalseにして、次の行へ
                    this.isWaitingClick = false;
                    this.next();
                },
                callbackScope: this
            });
        }
    }

    // ★★★ スキップ時にUIを非表示にする（推奨） ★★★
    hideInterfaceForSkip() {
        this.layers.character.setAlpha(0);
        this.messageWindow.setAlpha(0);
    }
    showInterfaceForSkip() {
        this.layers.character.setAlpha(1);
        this.messageWindow.setAlpha(1);
    }
}
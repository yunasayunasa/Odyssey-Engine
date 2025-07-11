export async function handleReturn(manager, params) {
    if (manager.callStack.length === 0) {
        console.warn('[return] 呼び出し元がありません。');
        manager.isEnd = true;
        manager.finishTagExecution(); // 止まる場合でも通知は必要
        return;
    }
    
    // 1. コールスタックから戻り先の情報を取得
    const returnInfo = manager.callStack.pop();
    console.log("コールスタックからポップ:", returnInfo);

    // 2. 元のシナリオファイルが、まだロードされていなければロードする
    // (通常はキャッシュされているはず)
    if (!manager.scene.cache.text.has(returnInfo.file)) {
        await new Promise(resolve => {
            manager.scene.load.text(returnInfo.file, `assets/${returnInfo.file}`);
            manager.scene.load.once('complete', resolve);
            manager.scene.load.start();
        });
    }

    // 3. ★★★ ここからが重要 ★★★
    // ScenarioManagerの内部状態を、一気に書き換える
    
    // a. シナリオ配列を、戻り先のファイルの内容に入れ替える
    const rawText = manager.scene.cache.text.get(returnInfo.file);
    manager.scenario = rawText.split(/\r\n|\n|\r/).filter(line => line.trim() !== '');
    
    // b. ファイル名と、戻るべき行番号を正確に設定する
    manager.currentFile = returnInfo.file;
    manager.currentLine = returnInfo.line;

    // c. 画面上の表示を一旦クリアして、ロード時に似た状態にする
    manager.layers.character.removeAll(true);
    manager.scene.characters = {};
    // 必要なら背景やBGMもここでリセット/復元するが、今回はシナリオの復帰に集中

    // 4. すべての準備が整った後で、完了を通知する
    manager.finishTagExecution();
}

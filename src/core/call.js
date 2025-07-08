/**
 * [call] タグの処理
 * 別のシナリオファイルをサブルーチンとして呼び出す
 * @param {Object} params - {storage, target}
 */
export async function handleCall(manager, params) {
    const storage = params.storage; // 呼び出すシナリオファイル名 (例: scene2.ks)
    const target = params.target;   // 呼び出し先のラベル名 (例: *start)
    if (!storage) { console.warn('[call] storageは必須です。'); 
        
       // manager.next(); 
        manager.finishTagExecution();
        return; 
    manager.finishTagExecution();
    }

    // ★ 1. 戻るべき場所をコールスタックに積む
    // 現在のファイル名と、「次の行」の行番号を保存
    manager.callStack.push({
        file: manager.currentFile,
        line: manager.currentLine 
    });
    console.log("コールスタックにプッシュ:", manager.callStack);

    // ★ 2. 新しいシナリオファイルをロードして、指定ラベルから実行を開始
    await manager.loadScenario(storage, target);
    
    // ★ 3. 新しいシナリオの最初の行から実行を開始
   // manager.next();
   manager.finishTagExecution();
}
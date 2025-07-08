export function handleElse(manager, params) {
    const ifState = manager.ifStack[manager.ifStack.length - 1];
    if (!ifState) { /* ... */ return; }

    // ★★★ すでに前のif/elsifで条件が満たされているか？ ★★★
    if (ifState.conditionMet) {
        // 満たされているなら、このelseは無条件でスキップ
        ifState.skipping = true;
    } else {
        // まだなら、このelseブロックを実行する
        ifState.conditionMet = true; // elseが実行されるので、条件は満たされた扱い
        ifState.skipping = false;    // スキップを解除
    }
    manager.finishTagExecution();
    //manager.next();
}
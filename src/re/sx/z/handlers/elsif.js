export function handleElsif(manager, params) {
    const ifState = manager.ifStack[manager.ifStack.length - 1];
    if (!ifState) { /* ... */ return; }

    // ★★★ すでに前のif/elsifで条件が満たされているか？ ★★★
    if (ifState.conditionMet) {
        // 満たされているなら、このelsifは無条件でスキップ対象
        ifState.skipping = true;
    } else {
        // まだ満たされていないなら、初めて条件を評価する
        const exp = params.exp;
        const result = manager.stateManager.eval(exp);
        if (result) {
            ifState.conditionMet = true; // 条件が満たされたことを記録
            ifState.skipping = false;    // スキップを解除して実行
        } else {
            ifState.skipping = true;     // 条件が合わないのでスキップ継続
        }
    }
    manager.finishTagExecution();
    //manager.next();
}
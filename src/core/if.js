export function handleIf(manager, params) {
    const exp = params.exp;
    const result = manager.stateManager.eval(exp);

    manager.ifStack.push({
        conditionMet: result, // このif/elsifブロックで条件が満たされたか
        skipping: !result     // 現在スキップ中か
    });
    manager.finishTagExecution();
   // manager.next();
}
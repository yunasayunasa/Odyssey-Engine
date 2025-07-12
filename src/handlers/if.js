/**
 * [if] タグの処理
 * 条件分岐ブロックを開始する。
 * 条件式を評価し、結果をifStackにプッシュする。
 * @param {ScenarioManager} manager
 * @param {Object} params - { exp }
 */
export function handleIf(manager, params) {
    const exp = params.exp;
    if (exp === undefined) { // exp属性が空の場合も考慮して`undefined`でチェック
        console.warn("[if] exp属性は必須です。");
        // 条件が不明なので、結果はfalseとして扱う
        manager.ifStack.push({
            conditionMet: false,
            skipping: true
        });
        return;
    }

    const result = manager.stateManager.eval(exp);

    // 新しいifブロックの状態をスタックに積む
    manager.ifStack.push({
        // conditionMet: このif文全体で、いずれかのブロックが実行されたか
        // この時点では、このifブロックが実行されたかどうかを記録する
        conditionMet: !!result, // !!で結果をtrue/falseに正規化
        
        // skipping: 次の行からスキップを開始するか
        skipping: !result
    });

    // ★★★ このタグの処理は一瞬で終わるので、何も呼び出す必要はない ★★★
    // ScenarioManagerのメインループが、この関数の終了後に次の行の処理に進む
}
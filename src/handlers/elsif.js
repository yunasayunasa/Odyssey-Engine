/**
 * [elsif] タグの処理
 * 前のif/elsifの条件が満たされず、かつ自身の条件式がtrueの場合に実行されるブロックを開始する
 * @param {ScenarioManager} manager
 * @param {Object} params - { exp }
 */
export function handleElsif(manager, params) {
    if (manager.ifStack.length === 0) {
        console.error("[elsif] 対応する[if]が存在しません。");
        return;
    }

    const ifState = manager.ifStack[manager.ifStack.length - 1];

    // すでに前のif/elsifブロックで条件が成立していた場合
    if (ifState.conditionMet) {
        // この[elsif]ブロックは無条件でスキップ対象とする
        ifState.skipping = true;
    } else {
        // まだどのブロックも実行されていない場合、この[elsif]の条件を評価する
        const exp = params.exp;
        if (!exp) {
            console.warn("[elsif] exp属性は必須です。");
            ifState.skipping = true; // 式がないのでスキップ
            return;
        }

        if (manager.stateManager.eval(exp)) {
            // 条件が成立した場合
            ifState.skipping = false; // このブロックのスキップを解除
            ifState.conditionMet = true; // このif文全体が「条件を満たした」と記録
        } else {
            // 条件が成立しなかった場合
            ifState.skipping = true; // このブロックもスキップを継続
        }
    }

    // ★★★ このタグの処理は一瞬で終わるので、何も呼び出す必要はない ★★★
    // ScenarioManagerのメインループが、この関数の終了後に次の行の処理に進む
}
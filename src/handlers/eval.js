/**
 * [eval] タグの処理
 * JavaScriptの式を、ゲーム内変数のスコープで実行する。
 * @param {ScenarioManager} manager
 * @param {Object} params - { exp }
 */
export function handleEval(manager, params) {
    const exp = params.exp;
    if (!exp) {
        console.warn('[eval] exp属性は必須です。');
        return; // 何もせず同期的に完了
    }

    // StateManagerに式の実行を依頼する
    try {
        manager.stateManager.eval(exp);
    } catch (e) {
        // StateManagerのeval内でエラーが捕捉されなかった場合に備える
        console.error(`[eval] 式の実行中に予期せぬエラーが発生しました: "${exp}"`, e);
    }

    // ★★★ このタグの処理は一瞬で終わるので、何も呼び出す必要はない ★★★
    // ScenarioManagerのメインループが、この関数の終了後に次の行の処理に進む
}
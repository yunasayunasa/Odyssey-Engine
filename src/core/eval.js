/**
 * [eval] タグの処理
 * JavaScriptの式を実行する
 * @param {Object} params - {exp}
 */
export function handleEval(manager, params) {
    const exp = params.exp;
    if (!exp) {
        console.warn('[eval] exp属性は必須です。');
       // manager.next();
       manager.finishTagExecution();
        return;
    }

    // StateManagerに式の実行を依頼
    manager.stateManager.eval(exp);
manager.finishTagExecution();
    //manager.next();
}
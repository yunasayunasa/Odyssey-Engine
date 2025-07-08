/**
 * [log] タグの処理
 * 指定した変数の値をコンソールに出力する
 * @param {Object} params - {exp}
 */
export function handleLog(manager, params) {
    const exp = params.exp;
    if (!exp) {
        console.warn('[log] exp属性は必須です。');
      //  manager.next();
      manager.finishTagExecution();
        return;
    }

    // StateManagerに式の「評価」だけを依頼する
    // evalとほぼ同じだが、こちらは値を取得するのが目的
    const value = manager.stateManager.eval(exp);

    console.log(`[Log Tag]: ${exp} =`, value);
manager.finishTagExecution();
    //manager.next();
}
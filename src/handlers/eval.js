// core/StateManager.js の eval メソッド

    eval(exp) {
        try {
            const f = this.f;
            const sf = this.sf; // sfもスコープに入れる

            const result = (function(f, sf) {
                'use strict';
                return eval(exp); 
            })(f, sf); // sfも引数として渡す

            // ★★★ 修正箇所: ここでsfが変更された可能性があるので保存する ★★★
            this.saveSystemVariables(); 
            return result;

        } catch (e) {
            console.error(`[eval] 式の評価中にエラーが発生しました: "${exp}"`, e);
            return undefined;
        }
    }
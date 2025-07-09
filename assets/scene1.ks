; === シーン遷移テスト：メインシナリオ ===

yuna:「まずは、別のシナリオファイルをサブルーチンとして呼び出します。」
[p]

[wait time=500]
[call storage="scene2.ks" target="*start"]

yuna:「ちゃんと、scene2.ksから戻ってこれたみたいだね。」
[p]
yuna:「次は、本番。アクションシーンを呼び出します！」
[p]

[wait time=500]
[call storage="ActionScene"]

yuna:「アクションシーンからも、無事に戻ってこれました！」
[p]
kaito:「これで、エンジンはどんなゲームでも作れるようになったね。」
[p]

[s]
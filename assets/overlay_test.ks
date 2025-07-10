; === オーバーレイ表示テスト用シナリオ ===

; 背景が透明なので、[bg]タグは使わない

; yunaを登場させる
[chara_show name="yuna" pos="center" time=500]
[wait time=500]

yuna:「こんにちは！[br]動いているアクションシーンの上に、私が表示されていますか？」


yuna:「少しだけ、アニメーションしてみるね。」
[p]

; ジャンプして、反転する
[chara_jump name="yuna" height=40 time=400]
[wait time=400]
[flip name="yuna" time=300]
[wait time=300]

yuna:「うん、ちゃんと動けるみたい。」
[p]
yuna:「じゃあ、私はこれで失礼しますね。」
[p]

; yunaを退場させる
[chara_hide name="yuna" time=500]
[wait time=500]

; ★★★ このオーバーレイシーンを終了させるための専用タグ ★★★
[overlay_end]
; === 演出タグ最終テストシナリオ ===

[bg storage="bg_school"]
[chara_show name="yuna" pos="center"]
[wait time=500]

yuna:「これから、flipとjumpの最終テストを始めます。」
[p]
[chara_jump name="yuna" x_add=100 height=30 time=400 loop=false nowait=true]
yuna:「まずは、反転しながら表情を『笑顔』に変えてみますね。」
[p]

; ★ 反転と同時に、表情をsmileに差し替える
[flip name="yuna" face="smile" time=400]
[wait time=500]

yuna:「どうかな？笑顔で、左向きになりましたか？」
[p]

yuna:「次は、怒った顔で戻ります！」
[p]

; ★ 再び反転し、今度はangry表情に戻す
[flip name="yuna" face="angry" time=400]
[wait time=500]

yuna:「ふん！これが怒った顔よ！」
[p]

yuna:「最後に、喜びの舞をお見せします！[br]左右にジャンプし続けるわよ！」
[p]

; ★ ループするジャンプを開始（nowaitで即座に次に進む）
[chara_jump name="yuna" x_add=100 height=30 time=400 loop=true nowait=true]
[wait time=2000] ; 2秒間、右にジャンプし続ける

[stop_anim name="yuna"]

[chara_jump name="yuna" height=200 time=400  loop=true nowait=true]
[wait time=2000] ; 2秒間、左にジャンプし続ける

[stop_anim name="yuna"]

yuna:「これで全ての演出テストは完了です！」
[s]
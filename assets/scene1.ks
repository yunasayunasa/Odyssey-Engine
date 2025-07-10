; 登場人物を配置
[chara_show name="yuna" pos="left"]
[chara_show name="kaito" pos="right" visible=false] ; kaitoは見えない状態で配置

; yunaがループでジャンプを開始（nowaitなので、すぐに次の行へ）
[chara_jump name="yuna" loop="true" nowait="true" height=20 speed=150]

yuna:「ジャンプしながら喋っています！[br]楽しい！」
[p]

; yunaのジャンプを止める
[stop_anim name="yuna"]

yuna:「ジャンプ、止まったかな？」
[p]

; kaitoを登場させて、喜びの舞
[chara_show name="kaito" visible=true time=500]
[wait time=500]
[call storage="dance_routine.ks"] ; 喜びの舞をサブルーチンで呼び出す

yuna:「すごい、二人で踊っちゃった！」
[p]

[s]
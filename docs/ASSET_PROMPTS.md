# 素材制作记录

模式：内置 imagegen，参考图编辑（identity-preserve），透明背景。

用户提供：`assets/original-open.png` 与 `assets/original-closed.png`。

生成结果：`assets/lolita.png`、`assets/jk.png`、`assets/maid.png`。每张两列，左列睁眼，右列闭眼；渲染时直接取源图相应半幅，不拆改原图。

三次生成共用的提示词前缀（后接各服装段落）：

> Use case: identity-preserve. Asset type: production transparent character sprite sheet for a desktop pet. Input image 1 is the edit target and exact character identity reference. Preserve her face, brown long hair, mole, earrings, crescent necklace, large chibi head and tiny body, illustration rendering quality. Produce a precisely aligned TWO FRAME sheet, two equal columns in one wide image: left full-body character eyes OPEN, right identical character eyes CLOSED for a blink. Same frontal relaxed standing pose, same feet baseline, identical size and position within each half. Real transparent background. Entire hair and shoes visible with generous margins. No labels, no borders, no text, no backdrop. Change ONLY her outfit to:

洛丽塔段落：

> an elegant modest lavender and ivory Lolita dress with layered lace skirt, puff sleeves, small ribbon bow and lace headband, ivory stockings and Mary Jane shoes. Keep identical identity, hair, facial proportions.

JK 段落：

> a modest navy and cream Japanese sailor school uniform, plaid navy pleated skirt, navy neck ribbon, white socks and black loafers. Keep identical identity, hair, facial proportions.

女仆段落：

> a classic modest black and white maid dress, white frilled apron, puff sleeves, lace headband, white stockings and black Mary Jane shoes. Keep identical identity, hair, facial proportions.

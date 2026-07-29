import type { Formula } from '../types';
export const formulas: Formula[] = [
 {id:'basic',name:'基本形',formula:'x²＋(a＋b)x＋ab＝(x＋a)(x＋b)',rule:'足して真ん中、掛けて最後',lookFor:'真ん中の x の数字と、最後の数字を見る',example:'x²＋5x＋6＝(x＋2)(x＋3)',diagramType:'sum-product-pair'},
 {id:'square-plus',name:'プラスの完全平方',formula:'x²＋2ax＋a²＝(x＋a)²',rule:'最初と最後が2乗、真ん中がプラスの2倍なら、プラスの2乗',lookFor:'最初と最後が2乗、真ん中が＋の2倍',example:'x²＋6x＋9＝(x＋3)²',diagramType:'square-tiles'},
 {id:'square-minus',name:'マイナスの完全平方',formula:'x²－2ax＋a²＝(x－a)²',rule:'最初と最後が2乗、真ん中がマイナスの2倍なら、マイナスの2乗',lookFor:'最初と最後が2乗、真ん中が－の2倍',example:'x²－6x＋9＝(x－3)²',diagramType:'square-tiles'},
 {id:'difference-squares',name:'2乗の差',formula:'x²－a²＝(x＋a)(x－a)',rule:'2乗ひく2乗は、プラスとマイナスに分かれる',lookFor:'2乗の形どうしを、－でつないでいる',example:'x²－36＝(x＋6)(x－6)',diagramType:'difference-squares'}
];

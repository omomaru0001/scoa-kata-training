import type { ProfitLossData, ProfitLossType, Question } from '../types';
type Mode=ProfitLossData['modeIds'][number];
const meta:Record<ProfitLossType,{name:string;rule:string;clues:string[];reason:string;diagram:ProfitLossData['diagramMode']}>={
 'profit-basic':{name:'型A：基本形',rule:'原価100 → 利益を足す → 割引を引く',clues:['原価・仕入れ値','利益を見込む','割引'],reason:'原価から利益を求める型です。',diagram:'cost'},
 'profit-reverse':{name:'型B：逆算形（原価）',rule:'原価100で利益の割合を出し、実額と比べる',clues:['利益が出た','原価はいくら'],reason:'実際の利益額から原価を逆算する型です。',diagram:'reverse'},
 'discount-rate':{name:'型C：割引率を求める形',rule:'定価−売値を、定価と比べる',clues:['割引率','何％引き'],reason:'定価と売値の差から割引率を出す型です。',diagram:'discount'},
 'profit-quantity':{name:'型D：個数を使った形',rule:'単価100円の表にして、割引個数を□と置く',clues:['◯個','一部が売れ残り','全体の利益'],reason:'定価販売と割引販売を分ける型です。',diagram:'quantity'},
 'profit-identify':{name:'型を見分ける',rule:'何を求める問題か先に決める',clues:['問題文の合図'],reason:'計算の前に型を決めます。',diagram:'identify'},
};
const baseSteps=['① 原価を100円と考える','② ％を足す・引く','③ 円や個数へ戻す'];
const make=(id:string,type:ProfitLossType,stage:Question['learningStage'],modes:Mode[],question:string,choices:string[],answerIndex:number,steps=baseSteps,knownFacts:string[]=[]):Question=>{const m=meta[type];return {id,categoryId:'profit-loss-patterns',subcategoryId:'profit-loss-patterns-basics',typeId:type,difficulty:'basic',learningStage:stage,question,choices,answerIndex,formula:'原価を100円（個数問題は単価100円）と置いて、％を整数で考える',shortRule:m.rule,triggerWords:m.clues,steps,explanation:'原価を100にすると、％を小数に直さず計算できます。',deepExplanation:'原価100円を基準にすると、20%の利益は20円ぶんとして足せます。',mistakeReason:'％を小数で掛ける前に、原価100で考えます。',diagramType:'profit-loss',diagramData:{},tags:['損益算',m.name],profitLoss:{problemPattern:m.name,questionIntent:'原価100裏技で答えを出す',readingClues:m.clues,clueReason:m.reason,characterTip:'原価を100円にして、％を整数で見よう。',modeIds:modes,diagramMode:m.diagram,knownFacts,values:{},validationData:{kind:type,expected:choices[answerIndex],answerText:choices[answerIndex]}}};};
const simple=(...args:Parameters<typeof make>)=>make(...args);
const questions:Question[]=[
 simple('profit-m-a','profit-basic','memorize',['memorize'],'原価100円に20%の利益を見込む定価は何円ですか。',['110円','120円','130円','140円'],1),
 simple('profit-m-b','profit-reverse','memorize',['memorize'],'4割の利益を見込んで定価をつけ、2割引で売ったところ、12円の利益が出ました。原価はいくらですか。',['80円','100円','120円','140円'],1,['① 原価を100円とします。','② 4割の利益を足すと定価は140円です。','③ 2割引にすると売値は112円です。','④ 原価との差は12円です。','⑤ 実際の利益も12円なので、原価は100円です。']),
 simple('profit-m-c','discount-rate','memorize',['memorize'],'定価6000円の商品を4500円で売りました。定価の何％引きですか。',['15%','20%','25%','30%'],2,['① 割引額は6000−4500＝1500円です。','② 1500円を定価6000円と比べます。','③ 1500÷6000＝0.25です。','④ 0.25は25%です。']),
 simple('profit-m-d','profit-quantity','memorize',['memorize'],'個数を使う問題で、最初に単価を何円と置きますか。',['10円','50円','100円','1000円'],2),
];
const blanks:[string,ProfitLossType,string,string[],number][]=[
 ['A1','profit-basic','原価100、利益20%の定価は□。',['110','120','130','140'],1],['A2','profit-basic','定価120を1割引すると□。',['100','106','108','110'],2],['B1','profit-reverse','原価100→定価140→2割引の売値は□。',['108','110','112','120'],2],['B2','profit-reverse','売値112のとき、原価100との差は□。',['8','10','12','14'],2],['C1','discount-rate','原価4000、利益500の売値は□。',['4000','4500','5000','5500'],1],['C2','discount-rate','定価6000、売値4500の割引額は□。',['1000','1200','1500','1800'],2],['D1','profit-quantity','定価130円を半額にすると□。',['60円','65円','70円','75円'],1],['D2','profit-quantity','定価販売を「全体−x個」、割引販売を□個と置く。',['x','100−x','100x','x÷100'],0],
];
questions.push(...blanks.map(([id,type,text,choices,answer])=>simple(`profit-b-${id}`,type,'blank',['blank'],text,choices,answer)));
const typeChoices=['型A 基本形','型B 原価逆算形','型C 割引率','型D 個数'];
const identifies:[string,ProfitLossType,string][]=[['A1','profit-basic','仕入れ値500円、利益20%、1割引で売ったときの利益を求める。'],['A2','profit-basic','原価と定価、値下げ率が分かっている商品の利益を求める。'],['B1','profit-reverse','4割利益、2割引、利益30円から原価を求める。'],['B2','profit-reverse','値下げ後の利益額が分かっている商品の仕入れ値を求める。'],['C1','discount-rate','原価4000円、利益500円から割引率を求める。'],['C2','discount-rate','原価、定価、値下げ後の利益額が分かっている商品の値下げ率を求める。'],['D1','profit-quantity','500個仕入れ、一部を半額で売り、全体の利益率から個数を求める。'],['D2','profit-quantity','定価販売分と割引販売分が混ざる商品の売れ残り数を求める。']];
const labels:Record<ProfitLossType,string>={'profit-basic':typeChoices[0],'profit-reverse':typeChoices[1],'discount-rate':typeChoices[2],'profit-quantity':typeChoices[3],'profit-identify':''};
questions.push(...identifies.map(([id,type,text])=>{const answer=labels[type];return simple(`profit-i-${id}`,'profit-identify','identify',['identify'],text,[answer,...typeChoices.filter((x)=>x!==answer)],0,['① 何を求めるかを見ます。','② 問題文の合図を探します。','③ 型を1つ選びます。']);}));
const subs:[string,ProfitLossType,string,string[],number,string[]?][]=[
 ['A','profit-basic','原価800円、利益25%、2割引です。利益はいくらですか。',['0円','40円','80円','160円'],0],['B','profit-reverse','2割の利益を見込んで定価をつけ、1割引で売ったところ、48円の利益が出ました。原価はいくらですか。',['400円','500円','600円','800円'],2,['① 原価を100円とします。','② 定価は120円です。','③ 1割引の売値は108円です。','④ 利益8円が48円なので6倍です。','⑤ 原価は600円です。']],['C','discount-rate','原価2000円、利益20%、利益160円です。割引率は何%ですか。',['5%','10%','15%','20%'],1],['D','profit-quantity','200個、定価150円、半額75円、利益4000円です。半額販売は何個ですか。',['60個','80個','100個','120個'],1],
];
questions.push(...subs.map(([id,type,text,choices,answer,steps])=>simple(`profit-s-${id}`,type,'substitute',['substitute'],text,choices,answer,steps)));
const add=(id:string,type:ProfitLossType,text:string,choices:string[],answer:number,steps=baseSteps)=>questions.push(simple(`profit-p-${id}`,type,'apply',['practice'],text,choices,answer,steps));
add('A1','profit-basic','500円で仕入れた商品Pに20%の利益を見込んで定価をつけた。売れなかったので1割引で売ることにした。このとき、利益はいくらか。',['24円','36円','40円','48円'],2,['① 原価500円を100%と見ます。','② 20%を足すと定価は600円です。','③ 1割引にすると売値は540円です。','④ 540−500＝40円です。']);
add('A2','profit-basic','800円で仕入れ、25%の利益を見込んで定価をつけた。2割引で売ったときの利益はいくらか。',['0円','40円','80円','160円'],0);
add('A3','profit-basic','1200円で仕入れ、50%の利益を見込んで定価をつけた。2割引で売ったときの利益はいくらか。',['120円','180円','240円','300円'],2);
add('A4','profit-basic','2000円で仕入れ、30%の利益を見込んで定価をつけた。15%引きで売ったときの利益はいくらか。',['150円','180円','210円','240円'],2);
add('B1','profit-reverse','ある商品を4割の利益を見込んで定価をつけたが売れなかったので2割引で売ったところ、30円の利益が出た。この商品の原価はいくらか。',['200円','250円','300円','350円'],1,['① 原価を100円とします。','② 定価は140円です。','③ 2割引の売値は112円です。','④ 利益の割合は12です。','⑤ 12が30円なので、100は250円です。']);
add('B2','profit-reverse','5割の利益を見込んで定価をつけ、2割引で売ったところ80円の利益が出た。原価はいくらか。',['200円','300円','400円','500円'],2);
add('B3','profit-reverse','2割の利益を見込んで定価をつけ、1割引で売ったところ48円の利益が出た。原価はいくらか。',['400円','500円','600円','700円'],2,['① 原価を100円とします。','② 定価は120円です。','③ 1割引の売値は108円です。','④ 利益8円が48円なので6倍です。','⑤ 原価は600円です。']);
add('B4','profit-reverse','6割の利益を見込んで定価をつけ、25%引きで売ったところ70円の利益が出た。原価はいくらか。',['250円','300円','350円','400円'],2);
add('C1','discount-rate','ある商品を4000円で仕入れて50%の利益を見込んで定価をつけた。しかし、売れなかったので割引いて販売したところ、500円の利益が出た。このとき、割引率は何%か。',['15%','20%','25%','30%'],2,['① 定価は4000×150÷100＝6000円です。','② 売値は4000+500＝4500円です。','③ 割引額は6000−4500＝1500円です。','④ 1500は6000の25%です。']);
add('C2','discount-rate','2000円で仕入れ、20%の利益を見込んで定価をつけた。利益160円で売ったときの割引率は何%か。',['5%','10%','15%','20%'],1);
add('C3','discount-rate','3000円で仕入れ、40%の利益を見込んで定価をつけた。利益360円で売ったときの割引率は何%か。',['10%','15%','20%','25%'],2);
add('D1','profit-quantity','ある商品を500個仕入れて30%の利益を見込んで定価をつけた。しかし、一部が売れ残ったので、売れ残った分を定価の半額で販売したところ、全て売れ、利益は仕入れ値の4%であった。このとき、割引いて売った商品は何個か。',['200個','220個','250個','280個'],0,['① 単価を100円とします。','② 定価は130円、半額は65円です。','③ 売上は130(500−x)+65xです。','④ 利益は15000−65xです。','⑤ 仕入れ値の4%は2000円です。','⑥ 15000−65x＝2000よりx＝200です。']);
add('D2','profit-quantity','商品を200個仕入れ、50%の利益を見込んで定価をつけた。一部を定価の半額で売ったところ、全体の利益は仕入れ値の20%だった。半額販売は何個か。',['60個','80個','100個','120個'],1);
add('D3','profit-quantity','商品を300個仕入れ、20%の利益を見込んで定価をつけた。一部を定価の25%引きで売ったところ、全体の利益は仕入れ値の5%だった。割引販売は何個か。',['100個','120個','150個','180個'],2);
add('D4','profit-quantity','商品を400個仕入れ、25%の利益を見込んで定価をつけた。一部を定価の20%引きで売ったところ、全体の利益は仕入れ値の10%だった。割引販売は何個か。',['200個','220個','240個','260個'],2);
export const profitLossQuestions=questions;

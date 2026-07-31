import type { Question, SpeedData, SpeedType } from '../types';

type ModeId = SpeedData['modeIds'][number];
type Spec = Omit<SpeedData, 'readingClues'|'characterTip'|'clueReason'|'validationData'|'modeIds'> & {
  readingClues:string[]; clueReason:string; validationData:SpeedData['validationData'];
};

/** 判定語: 向かい合う→和、追いつく→差、周回→相対速度、早い/遅い到着→同じ距離、往復平均→全距離÷全時間。 */
const make = (id:string, typeId:SpeedType, learningStage:Question['learningStage'], modeIds:ModeId[], question:string, choices:string[], answerIndex:number, spec:Spec, steps:string[], mistakeReason:string):Question => ({
  id, categoryId:'speed-patterns', subcategoryId:'speed-patterns-basics', typeId, difficulty:'basic', learningStage,
  question, choices, answerIndex, formula:'速さ・距離・時間を、問題の型ごとに1つずつ整理する',
  shortRule:spec.problemPattern, triggerWords:spec.readingClues, steps,
  explanation:spec.questionIntent,
  deepExplanation:'式を急いで作らず、問題文で分かっている速さ・距離・時間を1つずつ確認します。',
  mistakeReason, diagramType:'speed', diagramData:{}, tags:['速さ',spec.problemPattern],
  speed:{ ...spec, modeIds, characterTip:'今使う数字を、図の同じ色どうしで確かめよう。' },
});

const basic = (id:string, stage:Question['learningStage'], modes:ModeId[], question:string, choices:string[], answerIndex:number, values:Record<string,number|string>, steps:string[], mistakeReason:string) => make(id,'basic-speed',stage,modes,question,choices,answerIndex,{
  problemPattern:'基本公式の型',questionIntent:'速さ・距離・時間のうち、残り1つを求める',diagramMode:'basic',knownFacts:[],values,
  readingClues:['時速・分速','何km・何m・何分'],clueReason:'1人が1つの区間を進むので、速さ・距離・時間の基本公式を使います。',validationData:{kind:'basic-speed',expected:Number(values.expected),answerText:choices[answerIndex],unit:String(values.unit)}
},steps,mistakeReason);
const segments = (id:string, stage:Question['learningStage'], modes:ModeId[], question:string, choices:string[], answerIndex:number, values:Record<string,number|string>, steps:string[], mistakeReason:string) => make(id,'multi-segment',stage,modes,question,choices,answerIndex,{
  problemPattern:'複数区間の型',questionIntent:'区間ごとの時間または距離を求めて合計する',diagramMode:'segments',knownFacts:[],values,
  readingClues:['その後','途中で速さを変えて'],clueReason:'道のりが区間に分かれているため、区間ごとに計算してから合計します。',validationData:{kind:'multi-segment',expected:Number(values.expected),answerText:choices[answerIndex],unit:String(values.unit)}
},steps,mistakeReason);
const meeting = (id:string, stage:Question['learningStage'], modes:ModeId[], question:string, choices:string[], answerIndex:number, values:Record<string,number|string>, steps:string[], mistakeReason:string) => make(id,'meeting',stage,modes,question,choices,answerIndex,{
  problemPattern:'出会い算の型',questionIntent:'2人が出会うまでの時間または距離を求める',diagramMode:'meeting',knownFacts:[],values,
  readingClues:['向かい合って','出会うまで'],clueReason:'向かい合う2人は近づくので、2人の速さを足します。',validationData:{kind:'meeting',expected:Number(values.expected),answerText:choices[answerIndex],unit:String(values.unit)}
},steps,mistakeReason);
const chase = (id:string, stage:Question['learningStage'], modes:ModeId[], question:string, choices:string[], answerIndex:number, values:Record<string,number|string>, steps:string[], mistakeReason:string) => make(id,'chase',stage,modes,question,choices,answerIndex,{
  problemPattern:'追いかけ算の型',questionIntent:'後から出発した人が追いつくまでを求める',diagramMode:'chase',knownFacts:[],values,
  readingClues:['同じ方向','先に出発','追いつく'],clueReason:'同じ方向では、後ろの人が速さの差で先行した距離を縮めます。',validationData:{kind:'chase',expected:Number(values.expected),answerText:choices[answerIndex],unit:String(values.unit)}
},steps,mistakeReason);
const circuit = (id:string, stage:Question['learningStage'], modes:ModeId[], question:string, choices:string[], answerIndex:number, values:Record<string,number|string>, steps:string[], mistakeReason:string) => make(id,'circuit',stage,modes,question,choices,answerIndex,{
  problemPattern:'周回・相対速度の型',questionIntent:'1周分の距離を縮める時間を求める',diagramMode:'circuit',knownFacts:[],values,
  readingClues:['1周','反対方向・同じ方向'],clueReason:'周回コースでは、1周分の距離を近づく速さ、または差の速さで考えます。',validationData:{kind:'circuit',expected:Number(values.expected),answerText:choices[answerIndex],unit:String(values.unit)}
},steps,mistakeReason);
const arrival = (id:string, stage:Question['learningStage'], modes:ModeId[], question:string, choices:string[], answerIndex:number, values:Record<string,number|string>, steps:string[], mistakeReason:string) => make(id,'arrival-time',stage,modes,question,choices,answerIndex,{
  problemPattern:'到着時刻をそろえる型',questionIntent:'同じ道のりで生じた時間差から距離を求める',diagramMode:'arrival',knownFacts:[],values,
  readingClues:['早く着いた','遅く着いた','速さを変えた'],clueReason:'同じ道を通るので距離は変わりません。変わった時間を使って求めます。',validationData:{kind:'arrival-time',expected:Number(values.expected),answerText:choices[answerIndex],unit:String(values.unit)}
},steps,mistakeReason);
const average = (id:string, stage:Question['learningStage'], modes:ModeId[], question:string, choices:string[], answerIndex:number, values:Record<string,number|string>, steps:string[], mistakeReason:string) => make(id,'average-speed',stage,modes,question,choices,answerIndex,{
  problemPattern:'平均の速さの型',questionIntent:'全体の距離を全体の時間で割る',diagramMode:'average',knownFacts:[],values,
  readingClues:['往復','平均の速さ','行き・帰り'],clueReason:'行きと帰りで時間が違うため、速さをそのまま平均せず、全体で計算します。',validationData:{kind:'average-speed',expected:Number(values.expected),answerText:choices[answerIndex],unit:String(values.unit)}
},steps,mistakeReason);
const identify = (id:string, question:string, choices:string[], answerIndex:number, clues:string[], reason:string) => make(id,'speed-identify','identify',['identify'],question,choices,answerIndex,{
  problemPattern:'型を見分ける',questionIntent:'計算せずに使う型を選ぶ',diagramMode:'identify',knownFacts:[],values:{expected:choices[answerIndex]},readingClues:clues,clueReason:reason,validationData:{kind:'speed-identify',expected:choices[answerIndex],answerText:choices[answerIndex],unit:'text'}
},['① 問題文の合図を探す','② 合図が示す型を1つ選ぶ','③ この問題では計算を始めない'], '計算の前に型を決めると、使う式を迷いにくくなります。');

export const speedQuestions:Question[] = [
  basic('speed-a-001','memorize',['memorize'],'時速12kmで90分進むと、距離は何kmですか。',['12km','18km','24km','1080km'],1,{speed:12,timeMinutes:90,expected:18,unit:'km'},['① 速さは時速12kmです。','② 時間は90分です。','③ 時速を使うので、90分を時間に直します。','④ 90分は1.5時間です。','⑤ 距離を求めるので、速さ×時間を使います。','⑥ 12×1.5＝18です。'],'90をそのまま時間として掛けると、分と時間が混ざります。'),
  segments('speed-b-001','memorize',['memorize'],'3kmを時速6kmで進み、その後4kmを時速8kmで進みます。合計で何時間かかりますか。',['30分','45分','1時間','1時間30分'],2,{d1:3,s1:6,d2:4,s2:8,expected:1,unit:'時間'},['① 区間は2つあります。','② 1つ目の時間は、距離÷速さで求めます。','③ 3÷6＝0.5時間です。','④ 2つ目の時間も、距離÷速さで求めます。','⑤ 4÷8＝0.5時間です。','⑥ 2つの時間を足します。','⑦ 0.5＋0.5＝1時間です。'],'2つの距離を先に足すと、速さが違うため時間を正しく求められません。'),
  meeting('speed-c-001','memorize',['memorize'],'18km離れたP町とQ町から、2人が同時に向かい合って進みます。P町側は時速4km、Q町側は時速5kmです。出会うまで何時間ですか。',['1時間','2時間','3時間','4時間'],1,{distance:18,a:4,b:5,expected:2,unit:'時間'},['① 2人は向かい合って進みます。','② 向かい合うと、2人の間の距離は両方から縮みます。','③ 速さの和は、2人の速さを足した数です。','④ 4＋5＝9km/hです。','⑤ 出会うまでの時間は、距離÷近づく速さで求めます。','⑥ 18÷9＝2時間です。'],'向かい合うときに速さを引くと、近づく速さが小さくなってしまいます。'),
  chase('speed-d-001','memorize',['memorize'],'Aさんは時速4kmで出発し、30分後にBさんが同じ方向へ時速6kmで出発します。Bさんは出発してから何時間後にAさんへ追いつきますか。',['30分後','1時間後','1時間30分後','2時間後'],1,{slow:4,fast:6,leadMinutes:30,expected:1,unit:'時間'},['① 2人は同じ方向へ進みます。','② BさんがAさんに近づくので、使うのは速さの差です。','③ 6－4＝2km/hです。','④ 30分を時間に直します。','⑤ 30分は0.5時間です。','⑥ Aさんが先に進んだ距離は、4×0.5＝2kmです。','⑦ 追いつく時間は、先行距離÷速さの差です。','⑧ 2÷2＝1時間です。'],'先に出発した30分を、追いつく時間にそのまま足しません。'),
  circuit('speed-e-001','memorize',['memorize'],'1周1.2kmの池のまわりを、Aさんは時速4km、Bさんは時速2kmで、同じ地点から同時に反対方向へ進みます。次に出会うのは何分後ですか。',['6分後','12分後','18分後','24分後'],1,{lap:1.2,a:4,b:2,direction:'反対',expected:12,unit:'分'},['① 2人は反対方向へ進みます。','② 反対方向では、2人は近づいていきます。','③ 相対速度は、2人の間の距離が変わる速さです。','④ 反対方向では、相対速度は速さの和です。','⑤ 4＋2＝6km/hです。','⑥ 次に出会うまでに、2人で1周分の1.2kmを縮めます。','⑦ 1.2÷6＝0.2時間です。','⑧ 0.2時間は、0.2×60＝12分です。'],'反対方向でも1人分の速さだけを使うと、時間が長くなりすぎます。'),
  arrival('speed-f-001','memorize',['memorize'],'家から図書館までを、いつもは時速5kmで進みます。今日は時速6kmで進んだところ、20分早く着きました。家から図書館までの距離は何kmですか。',['5km','8km','10km','12km'],2,{normal:5,changed:6,differenceMinutes:20,expected:10,unit:'km'},['① 家から図書館までの道は同じです。','② そのため、いつもも今日も距離は同じです。','③ 20分を時間に直します。','④ 20分は1/3時間です。','⑤ いつもかかる時間を□時間とします。','⑥ 今日の時間は、□－1/3時間です。','⑦ 同じ距離なので、5×□＝6×（□－1/3）とします。','⑧ □＝2時間です。','⑨ 距離は、5×2＝10kmです。'],'速さだけを比べても距離は出ません。同じ距離になる式を使います。'),
  average('speed-g-001','memorize',['memorize'],'6km先へ時速3kmで行き、同じ道を時速6kmで戻りました。往復の平均の速さは時速何kmですか。',['3km','4km','4.5km','6km'],1,{distance:6,go:3,back:6,expected:4,unit:'km/h'},['① 行きの時間は、6÷3＝2時間です。','② 帰りの時間は、6÷6＝1時間です。','③ 全部の距離は、6＋6＝12kmです。','④ 全部の時間は、2＋1＝3時間です。','⑤ 平均の速さは、全部の距離÷全部の時間です。','⑥ 12÷3＝4km/hです。'],'3km/hと6km/hをそのまま平均すると、時間の違いを無視してしまいます。'),
  basic('speed-a-002','blank',['blank'],'時速54kmは、1分あたり□mです。',['54m','540m','900m','5400m'],2,{speed:54,expected:900,unit:'m/分'},['① 1時間は60分です。','② 54kmは54000mです。','③ 54000÷60＝900です。'],'kmをmに直さずに60で割ると、単位がそろいません。'),
  meeting('speed-c-002','blank',['blank'],'時速3kmと時速5kmの2人が反対方向に進むとき、2人の間が近づく速さは時速□kmです。',['2km','5km','8km','15km'],2,{a:3,b:5,expected:8,unit:'km/h'},['① 反対方向では、2人は近づきます。','② 近づく速さは、2人の速さの和です。','③ 3＋5＝8km/hです。'],'反対方向では差ではなく和を使います。'),
  segments('speed-b-002','substitute',['substitute'],'2kmを時速4kmで進み、その後3kmを時速6kmで進みます。合計で何時間かかりますか。',['30分','45分','1時間','1時間15分'],2,{d1:2,s1:4,d2:3,s2:6,expected:1,unit:'時間'},['① 1つ目の時間は2÷4＝0.5時間です。','② 2つ目の時間は3÷6＝0.5時間です。','③ 0.5＋0.5＝1時間です。'],'区間ごとの時間を出してから足します。'),
  chase('speed-d-002','substitute',['substitute'],'Aさんは時速3kmで出発し、20分後にBさんが同じ方向へ時速5kmで出発します。Bさんが出発してから、Aさんへ追いつくのは何分後ですか。',['20分後','30分後','40分後','60分後'],1,{slow:3,fast:5,leadMinutes:20,expected:30,unit:'分'},['① 20分は1/3時間です。','② Aさんの先行距離は3×1/3＝1kmです。','③ 速さの差は5－3＝2km/hです。','④ 1÷2＝0.5時間です。','⑤ 0.5時間は30分です。'],'先行距離を求めずに、20分だけで追いつく時間は決まりません。'),
  average('speed-g-002','substitute',['substitute'],'8km先へ時速4kmで行き、同じ道を時速12kmで戻りました。往復の平均の速さは時速何kmですか。',['4km','6km','8km','12km'],1,{distance:8,go:4,back:12,expected:6,unit:'km/h'},['① 行きの時間は8÷4＝2時間です。','② 帰りの時間は8÷12＝2/3時間です。','③ 全部の距離は16kmです。','④ 全部の時間は2と2/3時間です。','⑤ 16÷（2と2/3）＝6km/hです。'],'4と12を平均した8km/hではありません。'),

  basic('speed-a-003','apply',['practice'],'720mの道のりを3分で走りました。速さは1分あたり何mですか。',['120m','180m','240m','360m'],2,{distance:720,timeMinutes:3,expected:240,unit:'m/分'},['① 距離は720mです。','② 時間は3分です。','③ 速さを求めるので、距離÷時間を使います。','④ 720÷3＝240m/分です。'],'距離と時間を掛けると、速さではなく別の量になります。'),
  basic('speed-a-004','apply',['practice'],'時速72kmの電車が25分進むと、何km進みますか。',['24km','30km','36km','72km'],1,{speed:72,timeMinutes:25,expected:30,unit:'km'},['① 時速72kmは、1時間で72km進む速さです。','② 25分を時間に直します。','③ 25分は5/12時間です。','④ 距離を求めるので、速さ×時間を使います。','⑤ 72×5/12＝30kmです。'],'25分を25時間として掛けません。'),
  basic('speed-a-005','apply',['practice'],'1500mを5分で走りました。速さは1分あたり何mですか。',['250m','300m','350m','500m'],1,{distance:1500,timeMinutes:5,expected:300,unit:'m/分'},['① 距離は1500mです。','② 時間は5分です。','③ 速さは距離÷時間です。','④ 1500÷5＝300m/分です。'],'時間を距離で割ると、求める向きが逆になります。'),
  basic('speed-a-006','apply',['practice'],'自転車で12kmを40分で進みました。速さは時速何kmですか。',['12km','16km','18km','24km'],2,{distance:12,timeMinutes:40,expected:18,unit:'km/h'},['① 時間は40分です。','② 時速を求めるので、40分を時間に直します。','③ 40分は2/3時間です。','④ 速さは距離÷時間です。','⑤ 12÷2/3＝18km/hです。'],'40分をそのまま12で割ると、km/hになりません。'),
  basic('speed-a-007','apply',['practice'],'1分あたり75mで900m進むと、何分かかりますか。',['10分','12分','15分','18分'],1,{speed:75,distance:900,expected:12,unit:'分'},['① 速さは1分あたり75mです。','② 距離は900mです。','③ 時間を求めるので、距離÷速さを使います。','④ 900÷75＝12分です。'],'距離と速さの単位がどちらもmと分なので、そのまま割れます。'),
  basic('speed-a-008','apply',['practice'],'1分あたり90mで3.6km進むと、何分かかりますか。',['30分','36分','40分','45分'],2,{speed:90,distance:3.6,expected:40,unit:'分'},['① 距離は3.6kmです。','② 速さがm/分なので、距離をmに直します。','③ 3.6kmは3600mです。','④ 時間は距離÷速さです。','⑤ 3600÷90＝40分です。'],'kmのまま90で割ると、単位がそろいません。'),
  basic('speed-a-009','apply',['practice'],'時速8kmで24km進むと、何時間かかりますか。',['2時間','3時間','4時間','6時間'],1,{speed:8,distance:24,expected:3,unit:'時間'},['① 距離は24kmです。','② 速さは時速8kmです。','③ 時間は距離÷速さです。','④ 24÷8＝3時間です。'],'距離を速さに掛けません。'),

  segments('speed-b-003','apply',['practice'],'バス停から図書館まで6kmを時速12kmで進み、図書館から公園まで3kmを時速6kmで進みます。全部で何時間かかりますか。',['30分','45分','1時間','1時間30分'],2,{d1:6,s1:12,d2:3,s2:6,expected:1,unit:'時間'},['① バス停から図書館までの時間は6÷12＝0.5時間です。','② 図書館から公園までの時間は3÷6＝0.5時間です。','③ 0.5＋0.5＝1時間です。'],'区間の速さが違うため、距離をまとめて1つの速さで割りません。'),
  segments('speed-b-004','apply',['practice'],'通学で800mを1分80m、その後600mを1分60mで歩きます。合計時間は何分ですか。',['15分','18分','20分','25分'],2,{d1:800,s1:80,d2:600,s2:60,expected:20,unit:'分'},['① 1つ目の時間は800÷80＝10分です。','② 2つ目の時間は600÷60＝10分です。','③ 10＋10＝20分です。'],'mと分でそろっているので、時間を直さずに計算できます。'),
  segments('speed-b-005','apply',['practice'],'4kmを時速4kmで歩き、その後12kmを時速24kmのバスで進みます。合計時間は何時間ですか。',['1時間','1時間15分','1時間30分','2時間'],2,{d1:4,s1:4,d2:12,s2:24,expected:1.5,unit:'時間'},['① 歩く時間は4÷4＝1時間です。','② バスの時間は12÷24＝0.5時間です。','③ 1＋0.5＝1.5時間です。','④ 1.5時間は1時間30分です。'],'歩く時間とバスの時間を別々に求めます。'),
  segments('speed-b-006','apply',['practice'],'1.2kmを1分60m、その後800mを1分80mで進みます。合計時間は何分ですか。',['20分','25分','30分','35分'],2,{d1:1200,s1:60,d2:800,s2:80,expected:30,unit:'分'},['① 1.2kmを1200mに直します。','② 1つ目の時間は1200÷60＝20分です。','③ 2つ目の時間は800÷80＝10分です。','④ 20＋10＝30分です。'],'1.2kmを1.2mとして計算しません。'),
  segments('speed-b-007','apply',['practice'],'5kmを時速10km、その後6kmを時速12kmで自転車に乗ります。合計時間は何時間ですか。',['30分','45分','1時間','1時間15分'],2,{d1:5,s1:10,d2:6,s2:12,expected:1,unit:'時間'},['① 1つ目の時間は5÷10＝0.5時間です。','② 2つ目の時間は6÷12＝0.5時間です。','③ 0.5＋0.5＝1時間です。'],'速さが違っても、時間を出してから足します。'),
  segments('speed-b-008','apply',['practice'],'最初の30分は時速8km、その後1時間は時速6kmで進みました。合計距離は何kmですか。',['8km','9km','10km','12km'],2,{t1:0.5,s1:8,t2:1,s2:6,expected:10,unit:'km'},['① 最初の30分を時間に直します。','② 30分は0.5時間です。','③ 最初の距離は8×0.5＝4kmです。','④ 次の距離は6×1＝6kmです。','⑤ 4＋6＝10kmです。'],'時間が分と時間で混ざらないようにします。'),
  segments('speed-b-009','apply',['practice'],'3kmを時速3km、その後2kmを時速4kmで歩きました。合計時間は何時間ですか。',['1時間','1時間15分','1時間30分','2時間'],2,{d1:3,s1:3,d2:2,s2:4,expected:1.5,unit:'時間'},['① 1つ目の時間は3÷3＝1時間です。','② 2つ目の時間は2÷4＝0.5時間です。','③ 1＋0.5＝1.5時間です。','④ 1.5時間は1時間30分です。'],'合計距離5kmを、どちらか片方の速さで割りません。'),

  meeting('speed-c-003','apply',['practice'],'24km離れた2つの駅から、2人が同時に向かい合って自転車で進みます。速さはそれぞれ時速4kmと時速8kmです。出会うまで何時間ですか。',['1時間','1時間30分','2時間','3時間'],2,{distance:24,a:4,b:8,expected:2,unit:'時間'},['① 2人は向かい合うので近づきます。','② 近づく速さは4＋8＝12km/hです。','③ 時間は距離÷近づく速さです。','④ 24÷12＝2時間です。'],'出会い算では速さの差を使いません。'),
  meeting('speed-c-004','apply',['practice'],'900m離れた両端から、1分60mと1分90mで同時に歩きます。出会うまで何分ですか。',['5分','6分','8分','10分'],1,{distance:900,a:60,b:90,expected:6,unit:'分'},['① 2人は向かい合います。','② 近づく速さは60＋90＝150m/分です。','③ 時間は900÷150＝6分です。'],'距離がmなので、速さもm/分のまま使えます。'),
  meeting('speed-c-005','apply',['practice'],'84km離れた町から、時速28kmと時速14kmの車が向かい合って進みます。出会うまで何時間ですか。',['1時間','2時間','3時間','4時間'],1,{distance:84,a:28,b:14,expected:2,unit:'時間'},['① 向かい合うので、速さを足します。','② 28＋14＝42km/hです。','③ 84÷42＝2時間です。'],'遅い車の速さだけで割りません。'),
  meeting('speed-c-006','apply',['practice'],'1.8kmの道の両端から、1分120mと1分60mで同時に走ります。出会うまで何分ですか。',['6分','8分','10分','12分'],2,{distance:1800,a:120,b:60,expected:10,unit:'分'},['① 1.8kmを1800mに直します。','② 近づく速さは120＋60＝180m/分です。','③ 1800÷180＝10分です。'],'距離だけkmのまま残しません。'),
  meeting('speed-c-007','apply',['practice'],'30km離れた町から、時速12kmの自転車と時速18kmのバスが向かい合って出発します。出会うまで何時間ですか。',['30分','1時間','1時間30分','2時間'],1,{distance:30,a:12,b:18,expected:1,unit:'時間'},['① 向かい合う速さは12＋18＝30km/hです。','② 30kmを30km/hで縮めます。','③ 30÷30＝1時間です。'],'出会うまでの距離は、2人の間の30kmです。'),
  meeting('speed-c-008','apply',['practice'],'2.4km離れた家から、時速3kmと時速5kmの2人が向かい合って歩きます。出会うまで何分ですか。',['12分','15分','18分','24分'],2,{distance:2.4,a:3,b:5,expected:18,unit:'分'},['① 近づく速さは3＋5＝8km/hです。','② 時間は2.4÷8＝0.3時間です。','③ 0.3×60＝18分です。'],'0.3時間を3分と読みません。'),
  meeting('speed-c-009','apply',['practice'],'時速4kmと6kmの2人が向かい合って進み、15分後に出会いました。出発した場所の間は何kmですか。',['2km','2.5km','3km','4km'],1,{a:4,b:6,time:0.25,expected:2.5,unit:'km'},['① 向かい合う速さは4＋6＝10km/hです。','② 15分を時間に直します。','③ 15分は0.25時間です。','④ 距離は速さ×時間です。','⑤ 10×0.25＝2.5kmです。'],'15分を15時間として掛けません。'),

  chase('speed-d-003','apply',['practice'],'時速12kmのAさんが出発して15分後、Bさんが時速16kmで同じ方向へ出発します。Bさんは何分後に追いつきますか。',['30分','45分','60分','75分'],1,{slow:12,fast:16,leadMinutes:15,expected:45,unit:'分'},['① 15分は0.25時間です。','② Aさんの先行距離は12×0.25＝3kmです。','③ 速さの差は16－12＝4km/hです。','④ 3÷4＝0.75時間です。','⑤ 0.75×60＝45分です。'],'速さの和ではなく差を使います。'),
  chase('speed-d-004','apply',['practice'],'兄は1分60mで歩き、5分後に弟が1分90mで同じ方向へ出発します。弟は何分後に追いつきますか。',['5分','8分','10分','15分'],2,{slow:60,fast:90,leadMinutes:5,expected:10,unit:'分'},['① 兄の先行距離は60×5＝300mです。','② 速さの差は90－60＝30m/分です。','③ 300÷30＝10分です。'],'分速なので、5分を時間へ直す必要はありません。'),
  chase('speed-d-005','apply',['practice'],'時速10kmの車が出発して24分後、時速15kmの車が同じ道を出発します。後の車は何分後に追いつきますか。',['36分','40分','48分','60分'],2,{slow:10,fast:15,leadMinutes:24,expected:48,unit:'分'},['① 24分は0.4時間です。','② 先行距離は10×0.4＝4kmです。','③ 速さの差は15－10＝5km/hです。','④ 4÷5＝0.8時間です。','⑤ 0.8×60＝48分です。'],'24分をそのまま速さに掛けません。'),
  chase('speed-d-006','apply',['practice'],'時速4kmで歩く人の30分後に、時速10kmの自転車が同じ方向へ出発します。追いつくのは何分後ですか。',['10分','20分','30分','40分'],1,{slow:4,fast:10,leadMinutes:30,expected:20,unit:'分'},['① 30分は0.5時間です。','② 先行距離は4×0.5＝2kmです。','③ 速さの差は10－4＝6km/hです。','④ 2÷6＝1/3時間です。','⑤ 1/3時間は20分です。'],'速い自転車の速さ10km/hだけで割りません。'),
  chase('speed-d-007','apply',['practice'],'時速3kmの船が1時間先に出発しました。時速5kmの船は同じ方向へ進みます。追いつくのは何時間後ですか。',['1時間','1時間30分','2時間','3時間'],1,{slow:3,fast:5,leadMinutes:60,expected:1.5,unit:'時間'},['① 先行距離は3×1＝3kmです。','② 速さの差は5－3＝2km/hです。','③ 3÷2＝1.5時間です。','④ 1.5時間は1時間30分です。'],'先行した1時間を、追いつく時間に足しません。'),
  chase('speed-d-008','apply',['practice'],'時速60kmの車が出発して30分後、時速80kmの車が同じ方向へ出発します。後の車は何時間後に追いつきますか。',['1時間','1時間30分','2時間','2時間30分'],1,{slow:60,fast:80,leadMinutes:30,expected:1.5,unit:'時間'},['① 30分は0.5時間です。','② 先行距離は60×0.5＝30kmです。','③ 速さの差は80－60＝20km/hです。','④ 30÷20＝1.5時間です。'],'60と80を足しません。'),
  chase('speed-d-009','apply',['practice'],'時速6kmの人の20分後に、時速9kmの自転車が同じ方向へ出発します。追いつく場所まで、自転車は何km進みますか。',['4km','5km','6km','8km'],2,{slow:6,fast:9,leadMinutes:20,expected:6,unit:'km'},['① 20分は1/3時間です。','② 先行距離は6×1/3＝2kmです。','③ 速さの差は9－6＝3km/hです。','④ 追いつく時間は2÷3＝2/3時間です。','⑤ 自転車の距離は9×2/3＝6kmです。'],'追いつく時間だけで終わらず、自転車の距離を最後に求めます。'),

  circuit('speed-e-003','apply',['practice'],'1周2.4kmのコースを、時速5kmと3kmで同じ方向へ進みます。速い人が1周差をつけるのは何分後ですか。',['48分','60分','72分','90分'],2,{lap:2.4,a:5,b:3,direction:'同じ',expected:72,unit:'分'},['① 2人は同じ方向へ進みます。','② 同じ方向では、速い人が差を縮めます。','③ 相対速度は5－3＝2km/hです。','④ 1周差は2.4kmです。','⑤ 2.4÷2＝1.2時間です。','⑥ 1.2×60＝72分です。'],'同じ方向では速さを足しません。'),
  circuit('speed-e-004','apply',['practice'],'1周1.8kmのコースを、時速3kmと6kmで反対方向へ進みます。次に出会うのは何分後ですか。',['10分','12分','15分','18分'],1,{lap:1.8,a:3,b:6,direction:'反対',expected:12,unit:'分'},['① 反対方向なので、速さを足します。','② 相対速度は3＋6＝9km/hです。','③ 1.8÷9＝0.2時間です。','④ 0.2×60＝12分です。'],'反対方向でもコース1周分を使います。'),
  circuit('speed-e-005','apply',['practice'],'1周900mのコースを、1分80mと1分50mで同じ方向へ進みます。速い人が1周差をつけるのは何分後ですか。',['20分','25分','30分','36分'],2,{lap:900,a:80,b:50,direction:'同じ',expected:30,unit:'分'},['① 同じ方向なので、速さの差を使います。','② 80－50＝30m/分です。','③ 1周差は900mです。','④ 900÷30＝30分です。'],'mと分でそろっているので換算は不要です。'),
  circuit('speed-e-006','apply',['practice'],'1周3kmのコースを、時速4kmと2kmで反対方向へ進みます。次に出会うのは何分後ですか。',['20分','30分','40分','45分'],1,{lap:3,a:4,b:2,direction:'反対',expected:30,unit:'分'},['① 反対方向では速さを足します。','② 4＋2＝6km/hです。','③ 3÷6＝0.5時間です。','④ 0.5時間は30分です。'],'同じ方向の差と取り違えません。'),
  circuit('speed-e-007','apply',['practice'],'1周1.2kmのコースを、時速6kmと4kmで同じ方向へ進みます。速い人が1周差をつけるのは何分後ですか。',['24分','30分','36分','40分'],2,{lap:1.2,a:6,b:4,direction:'同じ',expected:36,unit:'分'},['① 同じ方向なので、速さの差を使います。','② 6－4＝2km/hです。','③ 1.2÷2＝0.6時間です。','④ 0.6×60＝36分です。'],'1.2kmを6km/hで割りません。'),
  circuit('speed-e-008','apply',['practice'],'1周600mのコースを、1分50mと1分70mで反対方向へ進みます。次に出会うのは何分後ですか。',['4分','5分','6分','8分'],1,{lap:600,a:50,b:70,direction:'反対',expected:5,unit:'分'},['① 反対方向なので、速さを足します。','② 50＋70＝120m/分です。','③ 600÷120＝5分です。'],'2人が近づく速さは120m/分です。'),
  circuit('speed-e-009','apply',['practice'],'1周2kmのコースを、時速10kmと6kmで同じ方向へ進みます。速い人が1周差をつけるのは何分後ですか。',['20分','24分','30分','36分'],2,{lap:2,a:10,b:6,direction:'同じ',expected:30,unit:'分'},['① 同じ方向なので、速さの差は10－6＝4km/hです。','② 1周差は2kmです。','③ 2÷4＝0.5時間です。','④ 0.5時間は30分です。'],'追いつくまでに縮める距離は1周分です。'),

  arrival('speed-f-003','apply',['practice'],'普段は時速4km、今日は時速5kmで進むと30分早く着きました。距離は何kmですか。',['6km','8km','10km','12km'],2,{normal:4,changed:5,differenceMinutes:30,expected:10,unit:'km'},['① 同じ道なので距離は同じです。','② 30分は0.5時間です。','③ 普段の時間を□時間とします。','④ 今日の時間は□－0.5時間です。','⑤ 4×□＝5×（□－0.5）とします。','⑥ □＝2.5時間です。','⑦ 4×2.5＝10kmです。'],'速さを足したり引いたりして距離を出しません。'),
  arrival('speed-f-004','apply',['practice'],'普段は時速6km、今日は時速8kmで進むと15分早く着きました。距離は何kmですか。',['4km','5km','6km','8km'],2,{normal:6,changed:8,differenceMinutes:15,expected:6,unit:'km'},['① 15分は0.25時間です。','② 普段の時間を□時間とします。','③ 今日の時間は□－0.25時間です。','④ 同じ距離なので6×□＝8×（□－0.25）です。','⑤ □＝1時間です。','⑥ 距離は6×1＝6kmです。'],'15分を15時間として式に入れません。'),
  arrival('speed-f-005','apply',['practice'],'普段は時速4km、今日は時速6kmで進むと1時間早く着きました。距離は何kmですか。',['8km','10km','12km','16km'],2,{normal:4,changed:6,differenceMinutes:60,expected:12,unit:'km'},['① 1時間早いので、時間差は1時間です。','② 普段の時間を□時間とします。','③ 今日の時間は□－1時間です。','④ 同じ距離なので4×□＝6×（□－1）です。','⑤ □＝3時間です。','⑥ 距離は4×3＝12kmです。'],'距離は速さの差2km/hではありません。'),
  arrival('speed-f-006','apply',['practice'],'普段は1分60m、今日は1分75mで進むと4分早く着きました。距離は何mですか。',['900m','1000m','1200m','1500m'],2,{normal:60,changed:75,differenceMinutes:4,expected:1200,unit:'m'},['① 速さがどちらもm/分なので、時間は分のまま使えます。','② 普段の時間を□分とします。','③ 今日の時間は□－4分です。','④ 同じ距離なので60×□＝75×（□－4）です。','⑤ □＝20分です。','⑥ 距離は60×20＝1200mです。'],'分速の問題で、時間を時間へ直しません。'),
  arrival('speed-f-007','apply',['practice'],'普段は時速10km、今日は時速12kmで進むと30分早く着きました。距離は何kmですか。',['20km','24km','30km','36km'],2,{normal:10,changed:12,differenceMinutes:30,expected:30,unit:'km'},['① 30分は0.5時間です。','② 普段の時間を□時間とします。','③ 今日の時間は□－0.5時間です。','④ 10×□＝12×（□－0.5）です。','⑤ □＝3時間です。','⑥ 10×3＝30kmです。'],'今日の速さ12km/hに30分を直接掛けません。'),
  arrival('speed-f-008','apply',['practice'],'普段は1分80m、今日は1分100mで進むと3分早く着きました。距離は何mですか。',['1000m','1200m','1500m','1800m'],1,{normal:80,changed:100,differenceMinutes:3,expected:1200,unit:'m'},['① 時間は分のまま使えます。','② 普段の時間を□分とします。','③ 今日の時間は□－3分です。','④ 80×□＝100×（□－3）です。','⑤ □＝15分です。','⑥ 80×15＝1200mです。'],'80と100の平均に時間を掛けません。'),
  arrival('speed-f-009','apply',['practice'],'普段は時速15km、今日は時速20kmで進むと20分早く着きました。距離は何kmですか。',['15km','18km','20km','25km'],2,{normal:15,changed:20,differenceMinutes:20,expected:20,unit:'km'},['① 20分は1/3時間です。','② 普段の時間を□時間とします。','③ 今日の時間は□－1/3時間です。','④ 15×□＝20×（□－1/3）です。','⑤ □＝4/3時間です。','⑥ 15×4/3＝20kmです。'],'20分を20時間として扱いません。'),

  average('speed-g-003','apply',['practice'],'9km先へ時速3kmで行き、帰りは時速9kmで戻りました。往復の平均の速さは時速何kmですか。',['3km','4.5km','6km','9km'],1,{distance:9,go:3,back:9,expected:4.5,unit:'km/h'},['① 行きの時間は9÷3＝3時間です。','② 帰りの時間は9÷9＝1時間です。','③ 全部の距離は18kmです。','④ 全部の時間は4時間です。','⑤ 18÷4＝4.5km/hです。'],'3と9を平均した6km/hではありません。'),
  average('speed-g-004','apply',['practice'],'6km先へ時速2kmで行き、帰りは時速6kmで戻りました。往復の平均の速さは時速何kmですか。',['2km','3km','4km','6km'],1,{distance:6,go:2,back:6,expected:3,unit:'km/h'},['① 行きの時間は6÷2＝3時間です。','② 帰りの時間は6÷6＝1時間です。','③ 全部の距離は12kmです。','④ 全部の時間は4時間です。','⑤ 12÷4＝3km/hです。'],'行きに長く時間がかかることを、全体の計算に入れます。'),
  average('speed-g-005','apply',['practice'],'12km先へ時速6kmで行き、帰りは時速18kmで戻りました。往復の平均の速さは時速何kmですか。',['6km','8km','9km','12km'],2,{distance:12,go:6,back:18,expected:9,unit:'km/h'},['① 行きの時間は12÷6＝2時間です。','② 帰りの時間は12÷18＝2/3時間です。','③ 全部の距離は24kmです。','④ 全部の時間は2と2/3時間です。','⑤ 24÷（2と2/3）＝9km/hです。'],'6と18の平均12km/hにはなりません。'),
  average('speed-g-006','apply',['practice'],'4km先へ時速2kmで行き、帰りは時速6kmで戻りました。往復の平均の速さは時速何kmですか。',['2km','3km','4km','6km'],1,{distance:4,go:2,back:6,expected:3,unit:'km/h'},['① 行きの時間は4÷2＝2時間です。','② 帰りの時間は4÷6＝2/3時間です。','③ 全部の距離は8kmです。','④ 全部の時間は2と2/3時間です。','⑤ 8÷（2と2/3）＝3km/hです。'],'距離が同じでも、速さをそのまま平均しません。'),
  average('speed-g-007','apply',['practice'],'15km先へ時速5kmで行き、帰りは時速15kmで戻りました。往復の平均の速さは時速何kmですか。',['5km','7.5km','10km','15km'],1,{distance:15,go:5,back:15,expected:7.5,unit:'km/h'},['① 行きの時間は15÷5＝3時間です。','② 帰りの時間は15÷15＝1時間です。','③ 全部の距離は30kmです。','④ 全部の時間は4時間です。','⑤ 30÷4＝7.5km/hです。'],'5と15の平均10km/hとは違います。'),
  average('speed-g-008','apply',['practice'],'1.2km先へ1分60mで行き、帰りは1分120mで戻りました。往復の平均の速さは1分あたり何mですか。',['60m','70m','80m','90m'],2,{distance:1200,go:60,back:120,expected:80,unit:'m/分'},['① 1.2kmを1200mに直します。','② 行きの時間は1200÷60＝20分です。','③ 帰りの時間は1200÷120＝10分です。','④ 全部の距離は2400mです。','⑤ 全部の時間は30分です。','⑥ 2400÷30＝80m/分です。'],'60と120を平均した90m/分ではありません。'),
  average('speed-g-009','apply',['practice'],'6km先へ時速4kmで行き、帰りは時速12kmで戻りました。往復の平均の速さは時速何kmですか。',['4km','5km','6km','8km'],2,{distance:6,go:4,back:12,expected:6,unit:'km/h'},['① 行きの時間は6÷4＝1.5時間です。','② 帰りの時間は6÷12＝0.5時間です。','③ 全部の距離は12kmです。','④ 全部の時間は2時間です。','⑤ 12÷2＝6km/hです。'],'4と12の平均8km/hではありません。'),

  identify('speed-h-001','「時速18kmで40分進むと、何km進むか」を解く型はどれですか。',['基本公式','複数区間','出会い算','平均の速さ'],0,['時速','何km'],'1人が1区間を進むので、基本公式の型です。'),
  identify('speed-h-002','「途中で速さを変えて、2つの区間を進む」問題で使う型はどれですか。',['出会い算','複数区間','追いかけ算','周回'],1,['途中で速さを変えて','2つの区間'],'区間ごとに別の計算をするので、複数区間の型です。'),
  identify('speed-h-003','「2人が同時に向かい合って進み、出会うまで」を解く型はどれですか。',['出会い算','追いかけ算','到着時刻をそろえる','平均の速さ'],0,['向かい合って','出会うまで'],'向かい合う2人は近づくので、出会い算です。'),
  identify('speed-h-004','「先に出発した人へ、同じ方向に進む人が追いつくまで」を解く型はどれですか。',['複数区間','出会い算','追いかけ算','周回'],2,['先に出発','同じ方向','追いつく'],'後ろの人が先行した人へ追いつくので、追いかけ算です。'),
  identify('speed-h-005','「池のまわりを同じ地点から反対方向に進み、次に出会うまで」を解く型はどれですか。',['基本公式','周回・相対速度','到着時刻をそろえる','平均の速さ'],1,['池のまわり','反対方向'],'1周分の距離を近づく動きで考えるので、周回の型です。'),
  identify('speed-h-006','「速さを変えたところ、いつもより20分早く着いた」問題で使う型はどれですか。',['出会い算','到着時刻をそろえる','追いかけ算','周回'],1,['速さを変えた','早く着いた'],'同じ道で時間だけが変わるので、到着時刻をそろえる型です。'),
  identify('speed-h-007','「行きと帰りの速さが違う往復の平均の速さ」を解く型はどれですか。',['複数区間','基本公式','平均の速さ','出会い算'],2,['往復','平均の速さ'],'全体の距離と時間を使うので、平均の速さの型です。'),
  identify('speed-h-008','「同時に反対方向へ進む」とき、最初に使う速さはどれですか。',['2人の速さの和','2人の速さの差','速さの平均','遅い方の速さ'],0,['反対方向'],'反対方向では2人が近づくため、速さを足します。'),
  identify('speed-h-009','「900mを1秒5mで進むのに何秒かかる」問題で使う型はどれですか。',['基本公式','出会い算','周回','平均の速さ'],0,['何秒かかる','1秒5m'],'1人の距離・速さ・時間を求めるので、基本公式です。'),
  identify('speed-h-010','「駅まで進み、駅から別の速さで公園まで進む」問題で使う型はどれですか。',['追いかけ算','複数区間','平均の速さ','出会い算'],1,['駅から','別の速さ'],'進む区間が分かれているので、複数区間です。'),
  identify('speed-h-011','「道の両端から同時に出発し、途中で会う」問題で使う型はどれですか。',['到着時刻をそろえる','出会い算','追いかけ算','周回'],1,['両端から','同時に','会う'],'両端から近づいて会うので、出会い算です。'),
  identify('speed-h-012','「20分遅れて同じ道を出発し、前の人に追いつく」問題で使う型はどれですか。',['出会い算','追いかけ算','周回','平均の速さ'],1,['遅れて出発','同じ道','追いつく'],'後から出た人が差を縮めるので、追いかけ算です。'),
  identify('speed-h-013','「1周のコースで、速い人が遅い人に1周差をつける」問題で使う型はどれですか。',['基本公式','周回・相対速度','到着時刻をそろえる','平均の速さ'],1,['1周','1周差'],'1周分の差を縮めるので、周回・相対速度です。'),
  identify('speed-h-014','「いつもより遅く着いたので、同じ道の距離を求める」問題で使う型はどれですか。',['出会い算','複数区間','到着時刻をそろえる','周回'],2,['遅く着いた','同じ道'],'同じ距離で時間が変わるので、到着時刻をそろえる型です。'),
  identify('speed-h-015','「行きと帰りで速さが違う。全体の平均を出す」問題で使う型はどれですか。',['追いかけ算','平均の速さ','出会い算','基本公式'],1,['行きと帰り','全体の平均'],'全体の距離÷全体の時間を使うので、平均の速さです。'),
];

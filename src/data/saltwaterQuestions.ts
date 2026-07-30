import type { Question, SaltwaterData, SaltwaterType } from '../types';

type ModeId = NonNullable<SaltwaterData['modeIds']>[number];
type Data = Omit<SaltwaterData, 'readingClues'|'characterTip'|'validationData'> & {
  readingClues?: string[]; characterTip?: string;
  validationData?: SaltwaterData['validationData'];
};

const make = (
  id:string, typeId:SaltwaterType, learningStage:Question['learningStage'], modeIds:ModeId[],
  question:string, choices:string[], answerIndex:number, data:Data, mistakeReason:string,
):Question => {
  const answer = choices[answerIndex];
  const saltwater:SaltwaterData = {
    ...data,
    readingClues:data.readingClues ?? ['濃度','重さ','何を聞かれているか'],
    characterTip:data.characterTip ?? '低い濃度は左、高い濃度は右に置くよ。',
    modeIds,
    hiddenValue:data.hiddenValue ?? answer,
    diagramBeforeAnswer:true,
    diagramAfterAnswer:true,
    givenInformation:data.givenInformation ?? { lowConcentration:true, targetConcentration:true, highConcentration:true },
    derivationSteps:data.derivationSteps ?? [],
    answerDerivation:data.answerDerivation ?? [`だから答えは ${answer}`],
    saltCheck:data.saltCheck ?? [],
    validationData:data.validationData ?? { expected:answerIndex, unit:'yes-no', answerText:answer },
  };
  return {
    id, categoryId:'saltwater-alligation', subcategoryId:'alligation-redesign', typeId, difficulty:'basic', learningStage,
    question, formula:'天秤算', choices, answerIndex,
    shortRule:saltwater.shortRule ?? '差は反対側の重さにつなぐ',
    triggerWords:saltwater.readingClues,
    steps:['分かっているものを置く','差または比を見る','反対側につなぐ'],
    explanation:'天秤の型に合わせて、分かっている数字から順に進みます。',
    deepExplanation:'低い濃度側の重さ：高い濃度側の重さは、高い側までの差：低い側までの差です。',
    mistakeReason, diagramType:'saltwater-alligation', diagramData:{}, tags:['食塩水','濃度','天秤算',saltwater.problemPattern], saltwater,
  };
};

const normal = (values:Omit<Data, 'validationData'> & { expected:number; unit:'%'|'g'|'ratio'|'yes-no'; answerText?:string; mix?:{lowAmount:number;highAmount:number} }):Data => {
  const { expected, unit, answerText, mix, ...data } = values;
  return { ...data, validationData:{ expected, unit, answerText, mix } };
};

/** 型ごとの合図。問題文・解説でこの言葉を繰り返して使う。 */
export const saltwaterTriggerWords = {
  A:['混ぜると何％','何％の食塩水ができるか'], B:['混ぜる重さの比','何gずつ混ぜる'],
  C:['何gの食塩水を混ぜると'], D:['何％の食塩水を混ぜると'],
  E:['水を何g加える','水で薄める'], F:['食塩を何g加える','食塩を溶かす'],
  G:['水を何g蒸発させる','煮詰める'], H:['全部で何gになるか'],
  I:['使う型は','求めるべきものは','最初に何をするか'],
} as const;

export const saltwaterQuestions:Question[] = [
  // 型A：重さが既知。重さの逆比で、まだ未知の中央濃度を決める。
  make('salt-a-001','mixed-concentration','memorize',['memorize'],
    '3％の食塩水100gと、9％の食塩水200gを混ぜる。最初に比べるものはどれ？',
    ['2つの重さの比','容器の大きさ','食塩水の色','重さの合計だけ'],0,
    normal({problemPattern:'混合後濃度を求める型',questionIntent:'最初の一手を選ぶ',lowConcentration:3,targetConcentration:7,highConcentration:9,lowAmount:100,highAmount:200,leftDifference:4,rightDifference:2,amountRatio:'1：2',lowLabel:'3％・100g',targetLabel:'？％',highLabel:'9％・200g',unknownPosition:'target-concentration',answerType:'identify',expected:0,unit:'yes-no',answerText:'2つの重さの比',shortRule:'量が多い方へ、答えが近づく',readingClues:[...saltwaterTriggerWords.A,'100g と 200g'],knownFacts:['3％は100g','9％は200g','中央の濃度は？％'],derivationSteps:['100：200＝1：2 と約分する','濃度の距離は反対の 2：1 にする'],answerDerivation:['両端の差を反対の比で分けると、中央の濃度が決まる'],saltCheck:['3％側と9％側の食塩の量を足して確かめる'],mixedConcentration:{simplifiedAmountRatio:[1,2],inverseDistanceRatio:[2,1],totalConcentrationGap:6,gapUnit:2,distanceFromLow:4,distanceFromHigh:2,derivedTargetConcentration:7} }),
    '濃度だけでは中央の濃度は決まりません。重さも見ます。'),
  make('salt-a-002','mixed-concentration','apply',['practice'],
    '3％の食塩水100gと、9％の食塩水200gを混ぜると、何％の食塩水ができますか？',
    ['5％','6％','7％','8％'],2,
    normal({problemPattern:'混合後濃度を求める型',questionIntent:'混ぜた後の濃度を求める',lowConcentration:3,targetConcentration:7,highConcentration:9,lowAmount:100,highAmount:200,leftDifference:4,rightDifference:2,amountRatio:'1：2',lowLabel:'3％・100g',targetLabel:'？％',highLabel:'9％・200g',unknownPosition:'target-concentration',answerType:'concentration',expected:7,unit:'%',mix:{lowAmount:100,highAmount:200},shortRule:'量が多い方へ、答えが近づく',readingClues:[...saltwaterTriggerWords.A,'3％100g','9％200g'],knownFacts:['低い濃度は3％・100g','高い濃度は9％・200g','できあがりの濃度は？％'],derivationSteps:['重さの比は 100：200＝1：2','濃度の距離は反対の 2：1','9－3＝6 ポイント','6÷（2＋1）＝2 ポイント'],answerDerivation:['3％から 2ポイントを2つ進む','3＋4＝7％'],saltCheck:['3％の100gは食塩3g','9％の200gは食塩18g','食塩21g ÷ 全体300g＝7％'] ,mixedConcentration:{simplifiedAmountRatio:[1,2],inverseDistanceRatio:[2,1],totalConcentrationGap:6,gapUnit:2,distanceFromLow:4,distanceFromHigh:2,derivedTargetConcentration:7} }),
    '重さを見ずに6％を選ぶと、同じ重さで混ぜる場合と取り違えています。'),
  make('salt-a-003','mixed-concentration','apply',['practice'],
    '容器Aの4％食塩水100gと、容器Bの10％食塩水200gを合わせた。できあがりの濃度は何％ですか？',
    ['6％','7％','8％','9％'],2,
    normal({problemPattern:'混合後濃度を求める型',questionIntent:'できあがりの濃度を求める',lowConcentration:4,targetConcentration:8,highConcentration:10,lowAmount:100,highAmount:200,leftDifference:4,rightDifference:2,amountRatio:'1：2',lowLabel:'4％・100g',targetLabel:'？％',highLabel:'10％・200g',unknownPosition:'target-concentration',answerType:'concentration',expected:8,unit:'%',mix:{lowAmount:100,highAmount:200},shortRule:'量が多い方へ、答えが近づく',readingClues:['合わせた','できあがりの濃度','4％100g と 10％200g'],knownFacts:['4％は100g','10％は200g','できあがりは？％'],derivationSteps:['重さの比は 1：2','濃度の距離は反対の 2：1','10－4＝6 ポイント','6÷3＝2 ポイント'],answerDerivation:['4％から4ポイント進む','4＋4＝8％'],saltCheck:['4％の100gは食塩4g','10％の200gは食塩20g','食塩24g ÷ 全体300g＝8％'],mixedConcentration:{simplifiedAmountRatio:[1,2],inverseDistanceRatio:[2,1],totalConcentrationGap:6,gapUnit:2,distanceFromLow:4,distanceFromHigh:2,derivedTargetConcentration:8} }),
    '10％側が多いので、答えは10％側へ寄ります。'),

  // 型B：目標濃度が既知。差から重さの比へ進む。
  make('salt-b-001','ratio','memorize',['memorize'],
    '4％と10％の食塩水で6％を作る。最初に計算するものはどれ？',
    ['6％から両端までの差','2つの重さの合計','4％と10％の平均','食塩水の容器数'],0,
    normal({problemPattern:'混ぜる重さの比を求める型',questionIntent:'最初の一手を選ぶ',lowConcentration:4,targetConcentration:6,highConcentration:10,leftDifference:2,rightDifference:4,amountRatio:'2：1',lowLabel:'4％',targetLabel:'6％',highLabel:'10％',unknownPosition:'amount-ratio',answerType:'identify',expected:0,unit:'yes-no',answerText:'6％から両端までの差',shortRule:'真ん中から両端を引く',readingClues:[...saltwaterTriggerWords.B,'6％にする'],knownFacts:['低い濃度は4％','目標は6％','高い濃度は10％'],derivationSteps:['6－4 と 10－6 を出す'],answerDerivation:['差を反対側へつなぐと重さの比になる'] }),
    '目標の6％を真ん中に置いてから、左右の差を見ます。'),
  make('salt-b-002','ratio','blank',['blank'],
    '4％と10％の食塩水を混ぜて6％にする。4％側：10％側の重さの比は □：□ です。',
    ['1：2','2：1','1：1','2：3'],1,
    normal({problemPattern:'混ぜる重さの比を求める型',questionIntent:'重さの比の空欄を埋める',lowConcentration:4,targetConcentration:6,highConcentration:10,leftDifference:2,rightDifference:4,amountRatio:'2：1',lowLabel:'4％',targetLabel:'6％',highLabel:'10％',unknownPosition:'amount-ratio',answerType:'ratio',expected:2,unit:'ratio',shortRule:'差は反対側の重さにつなぐ',readingClues:['混ぜて6％','□：□'],knownFacts:['4％・6％・10％は問題文にある','重さの比が？：？'],derivationSteps:['6－4＝2','10－6＝4','4％側には反対の4をつなぐ','10％側には反対の2をつなぐ'],answerDerivation:['4：2 を約分する','4％側：10％側＝2：1'],saltCheck:['4％を2、10％を1の重さで混ぜると6％になる'] }),
    '2：4をそのまま並べると、差を同じ側へ置く間違いになります。'),
  make('salt-b-003','ratio','apply',['practice'],
    '5％の食塩水と11％の食塩水を混ぜて8％にする。混ぜる重さの比は何対何ですか？',
    ['1：2','1：1','2：1','3：1'],1,
    normal({problemPattern:'混ぜる重さの比を求める型',questionIntent:'配合する重さの比を求める',lowConcentration:5,targetConcentration:8,highConcentration:11,leftDifference:3,rightDifference:3,amountRatio:'1：1',lowLabel:'5％',targetLabel:'8％',highLabel:'11％',unknownPosition:'amount-ratio',answerType:'ratio',expected:1,unit:'ratio',shortRule:'差が同じなら、重さも同じ',readingClues:['混ぜて8％','重さの比'],knownFacts:['5％・8％・11％'],derivationSteps:['8－5＝3','11－8＝3','差が同じ'],answerDerivation:['反対側へつないでも同じ','5％側：11％側＝1：1'],saltCheck:['同じ重さなら、食塩の量の平均は8％になる'] }),
    '差が同じなら、片方だけを多くしません。'),

  // 型C：濃度と目標は既知。片方の重さが未知。
  make('salt-c-001','unknown-amount','substitute',['substitute'],
    '6％の食塩水300gに、9％の食塩水を何g混ぜると8％になりますか？',
    ['150g','300g','600g','900g'],2,
    normal({problemPattern:'一方の食塩水の重さを求める型',questionIntent:'9％側の重さを求める',lowConcentration:6,targetConcentration:8,highConcentration:9,lowAmount:300,highAmount:600,leftDifference:2,rightDifference:1,amountRatio:'1：2',lowLabel:'6％・300g',targetLabel:'8％',highLabel:'9％・？g',unknownPosition:'high-amount',answerType:'amount',expected:600,unit:'g',mix:{lowAmount:300,highAmount:600},shortRule:'差を反対側へつなぐ',readingClues:[...saltwaterTriggerWords.C,'6％300g','8％'],knownFacts:['6％側は300g','目標は8％','9％側は？g'],derivationSteps:['8－6＝2','9－8＝1','6％側：9％側＝1：2'],answerDerivation:['6％側の300gが1つ分','9％側は2つ分なので 600g'],saltCheck:['6％の300gは食塩18g','9％の600gは食塩54g','食塩72g ÷ 全体900g＝8％'] }),
    '差の2：1を同じ側の重さにすると、600gと300gを逆にします。'),
  make('salt-c-002','unknown-amount','apply',['practice'],
    '10％の食塩水200gに、4％の食塩水を何g加えると6％になりますか？',
    ['100g','200g','300g','400g'],3,
    normal({problemPattern:'一方の食塩水の重さを求める型',questionIntent:'4％側の重さを求める',lowConcentration:4,targetConcentration:6,highConcentration:10,lowAmount:400,highAmount:200,leftDifference:2,rightDifference:4,amountRatio:'2：1',lowLabel:'4％・？g',targetLabel:'6％',highLabel:'10％・200g',unknownPosition:'low-amount',answerType:'amount',expected:400,unit:'g',mix:{lowAmount:400,highAmount:200},shortRule:'低い方の重さは、高い方までの差',readingClues:['4％を何g加える','10％200g','6％'],knownFacts:['10％側は200g','4％側は？g','目標は6％'],derivationSteps:['6－4＝2','10－6＝4','4％側：10％側＝4：2＝2：1'],answerDerivation:['10％側の200gが1つ分','4％側は2つ分なので400g'],saltCheck:['4％の400gは食塩16g','10％の200gは食塩20g','食塩36g ÷ 全体600g＝6％'] }),
    '10％側の200gを2つ分とすると、比を逆にしています。'),

  // 型D：両方の重さと目標が既知。片方の濃度が未知。
  make('salt-d-001','unknown-concentration','substitute',['substitute'],
    '濃度不明の食塩水200gと、4％の食塩水100gを混ぜると8％になった。不明の食塩水は何％ですか？',
    ['8％','10％','12％','16％'],1,
    normal({problemPattern:'一方の食塩水の濃度を求める型',questionIntent:'高い側の濃度を求める',lowConcentration:4,targetConcentration:8,highConcentration:10,lowAmount:100,highAmount:200,leftDifference:4,rightDifference:2,amountRatio:'1：2',lowLabel:'4％・100g',targetLabel:'8％',highLabel:'？％・200g',unknownPosition:'high-concentration',answerType:'concentration',expected:10,unit:'%',mix:{lowAmount:100,highAmount:200},shortRule:'重さの比から、濃度の距離を逆にする',readingClues:[...saltwaterTriggerWords.D,'200g と 100g','8％になった'],knownFacts:['4％側は100g','不明側は200g','混ぜた後は8％'],derivationSteps:['重さの比は 100：200＝1：2','濃度の距離は反対の 2：1','8％から4％までの距離は4ポイント'],answerDerivation:['右側の距離は2ポイント','8＋2＝10％'],saltCheck:['4％の100gは食塩4g','10％の200gは食塩20g','食塩24g ÷ 全体300g＝8％'] }),
    '8％を端に置くと、目標の濃度と不明の濃度を混同します。'),
  make('salt-d-002','unknown-concentration','apply',['practice'],
    '3％の食塩水100gと、濃度不明の食塩水300gを混ぜると9％になった。不明の食塩水は何％ですか？',
    ['9％','10％','11％','12％'],2,
    normal({problemPattern:'一方の食塩水の濃度を求める型',questionIntent:'高い側の濃度を求める',lowConcentration:3,targetConcentration:9,highConcentration:11,lowAmount:100,highAmount:300,leftDifference:6,rightDifference:2,amountRatio:'1：3',lowLabel:'3％・100g',targetLabel:'9％',highLabel:'？％・300g',unknownPosition:'high-concentration',answerType:'concentration',expected:11,unit:'%',mix:{lowAmount:100,highAmount:300},shortRule:'重さが3つ分なら、反対の距離は1つ分',readingClues:['濃度不明','300g','9％になった'],knownFacts:['3％側は100g','不明側は300g','混ぜた後は9％'],derivationSteps:['重さの比は 1：3','濃度の距離は反対の 3：1','9％から3％までの距離は6ポイント'],answerDerivation:['1つ分は 6÷3＝2ポイント','9＋2＝11％'],saltCheck:['3％の100gは食塩3g','11％の300gは食塩33g','食塩36g ÷ 全体400g＝9％'] }),
    '重さが多い側の濃度は、目標から近い距離にあります。'),

  // 型E：水は0％。
  make('salt-e-001','add-water','memorize',['memorize'],
    '12％の食塩水300gを水で薄めて9％にする。天秤で水は何％として置く？',
    ['0％','1％','9％','12％'],0,
    normal({problemPattern:'水を加えて薄める型',questionIntent:'水を天秤に置く濃度を選ぶ',lowConcentration:0,targetConcentration:9,highConcentration:12,lowAmount:100,highAmount:300,leftDifference:9,rightDifference:3,amountRatio:'1：3',lowLabel:'水・0％',targetLabel:'9％',highLabel:'12％・300g',unknownPosition:'low-concentration',answerType:'identify',expected:0,unit:'yes-no',answerText:'0％',shortRule:'水には食塩が入っていない',readingClues:[...saltwaterTriggerWords.E,'12％300g','9％'],knownFacts:['水には食塩が入っていない'],derivationSteps:['水には食塩が入っていないので、天秤の端に置く濃度を考える'],answerDerivation:['水は0％として天秤に置く'] }),
    '水を1％にすると、食塩が入っていることになってしまいます。'),
  make('salt-e-002','add-water','blank',['blank'],
    '12％の食塩水300gを水で薄めて9％にする。水：12％食塩水の重さの比は □：□ です。',
    ['1：2','1：3','2：1','3：1'],1,
    normal({problemPattern:'水を加えて薄める型',questionIntent:'水と食塩水の比の空欄を埋める',lowConcentration:0,targetConcentration:9,highConcentration:12,lowAmount:100,highAmount:300,leftDifference:9,rightDifference:3,amountRatio:'1：3',lowLabel:'水・0％',targetLabel:'9％',highLabel:'12％・300g',unknownPosition:'amount-ratio',answerType:'ratio',expected:1,unit:'ratio',shortRule:'水は0％。差は反対側へ',readingClues:['水で薄めて9％','□：□'],knownFacts:['水は0％','元の12％食塩水は300g','比は？：？'],derivationSteps:['9－0＝9','12－9＝3','水側：12％側＝3：9'],answerDerivation:['3：9 を約分する','水：12％食塩水＝1：3'],saltCheck:['12％食塩水300gに、水100gを足すと9％になる'] }),
    '9：3をそのまま水：食塩水にすると、差を同じ側へ置く間違いです。'),
  make('salt-e-003','add-water','apply',['practice'],
    '15％の食塩水400gに水を加えて10％にする。水は何g加えますか？',
    ['100g','150g','200g','250g'],2,
    normal({problemPattern:'水を加えて薄める型',questionIntent:'加える水の重さを求める',lowConcentration:0,targetConcentration:10,highConcentration:15,lowAmount:200,highAmount:400,leftDifference:10,rightDifference:5,amountRatio:'1：2',lowLabel:'水・0％・？g',targetLabel:'10％',highLabel:'15％・400g',unknownPosition:'low-amount',answerType:'amount',expected:200,unit:'g',mix:{lowAmount:200,highAmount:400},shortRule:'水は0％',readingClues:['水を加えて10％','15％400g'],knownFacts:['水は0％・？g','元の食塩水は15％・400g','目標は10％'],derivationSteps:['10－0＝10','15－10＝5','水：15％食塩水＝5：10＝1：2'],answerDerivation:['15％側の400gが2つ分','水は1つ分なので200g'],saltCheck:['15％の400gは食塩60g','食塩60g ÷ 全体600g＝10％'] }),
    '600gは完成後の全体量です。聞かれている水の重さではありません。'),

  // 型F：食塩は100％。
  make('salt-f-001','add-salt','memorize',['memorize'],
    '8％の食塩水440gに食塩を加えて12％にする。天秤で食塩は何％として置く？',
    ['0％','8％','12％','100％'],3,
    normal({problemPattern:'食塩を加えて濃くする型',questionIntent:'食塩を天秤に置く濃度を選ぶ',lowConcentration:8,targetConcentration:12,highConcentration:100,lowAmount:440,highAmount:20,leftDifference:4,rightDifference:88,amountRatio:'22：1',lowLabel:'8％・440g',targetLabel:'12％',highLabel:'食塩・100％',unknownPosition:'high-concentration',answerType:'identify',expected:3,unit:'yes-no',answerText:'100％',shortRule:'食塩だけなら全部が食塩',readingClues:[...saltwaterTriggerWords.F,'8％440g','12％'],knownFacts:['食塩だけなら全部が食塩'],derivationSteps:['食塩を天秤の高い濃度側に置く'],answerDerivation:['食塩は100％として天秤に置く'] }),
    '食塩を0％にすると、水を加える型と取り違えます。'),
  make('salt-f-002','add-salt','apply',['practice'],
    '10％の食塩水440gに食塩を溶かして12％にする。食塩は何g加えますか？',
    ['8g','10g','12g','20g'],1,
    normal({problemPattern:'食塩を加えて濃くする型',questionIntent:'加える食塩の重さを求める',lowConcentration:10,targetConcentration:12,highConcentration:100,lowAmount:440,highAmount:10,leftDifference:2,rightDifference:88,amountRatio:'44：1',lowLabel:'10％・440g',targetLabel:'12％',highLabel:'食塩・100％・？g',unknownPosition:'high-amount',answerType:'amount',expected:10,unit:'g',mix:{lowAmount:440,highAmount:10},shortRule:'食塩は100％',readingClues:['食塩を溶かして12％','10％440g'],knownFacts:['元の食塩水は10％・440g','食塩は100％・？g','目標は12％'],derivationSteps:['12－10＝2','100－12＝88','10％側：食塩側＝88：2＝44：1'],answerDerivation:['10％側の440gが44つ分','食塩は1つ分なので10g'],saltCheck:['10％の440gは食塩44g','44g＋食塩10g＝54g','食塩54g ÷ 全体450g＝12％'] }),
    '440gを答えにすると、元の食塩水の重さを選んでいます。'),

  // 型G：蒸発して消えるのは0％の水。食塩量は変わらない。
  make('salt-g-001','evaporation','substitute',['substitute'],
    '8％の食塩水500gを加熱して10％にする。蒸発して減るものを天秤で何％として置く？',
    ['0％の水','8％の食塩水','10％の食塩水','100％の食塩'],0,
    normal({problemPattern:'水を蒸発させる型',questionIntent:'蒸発したものを天秤に置く濃度を選ぶ',lowConcentration:0,targetConcentration:8,highConcentration:10,lowAmount:100,highAmount:400,sourceAmount:500,leftDifference:8,rightDifference:2,amountRatio:'1：4',lowLabel:'蒸発した水・0％',targetLabel:'元の8％・500g',highLabel:'残った10％・？g',unknownPosition:'low-concentration',answerType:'identify',expected:0,unit:'yes-no',answerText:'0％の水',shortRule:'蒸発するのは水',readingClues:[...saltwaterTriggerWords.G,'8％500g','10％'],knownFacts:['蒸発前は8％・500g','蒸発後は10％','蒸発したものは水'],derivationSteps:['残った食塩水と蒸発した水を合わせると、蒸発前の食塩水になる'],answerDerivation:['蒸発したものは0％の水として置く'] }),
    '食塩が蒸発すると考えると、食塩量が変わらない約束を見落とします。'),
  make('salt-g-002','evaporation','apply',['practice'],
    '6％の食塩水400gを加熱して8％にする。蒸発した水は何gですか？',
    ['50g','75g','100g','150g'],2,
    normal({problemPattern:'水を蒸発させる型',questionIntent:'蒸発した水の重さを求める',lowConcentration:0,targetConcentration:6,highConcentration:8,lowAmount:100,highAmount:300,sourceAmount:400,leftDifference:6,rightDifference:2,amountRatio:'1：3',lowLabel:'蒸発した水・0％・？g',targetLabel:'元の6％・400g',highLabel:'残った8％・？g',unknownPosition:'low-amount',answerType:'amount',expected:100,unit:'g',mix:{lowAmount:100,highAmount:300},shortRule:'蒸発して消えるのは0％の水',readingClues:['加熱して8％','6％400g','蒸発した水'],knownFacts:['蒸発前は6％・400g','蒸発後は8％','蒸発した水は？g'],derivationSteps:['残った8％と蒸発した0％を合わせて、元の6％と考える','6－0＝6','8－6＝2','水：残った食塩水＝2：6＝1：3'],answerDerivation:['元の400gは4つ分','蒸発した水は1つ分なので100g','残った食塩水は300g'],saltCheck:['蒸発前の食塩量は 400g×6％＝24g','蒸発後は 300g×8％＝24g'] }),
    '300gは残った食塩水です。聞かれている蒸発した水ではありません。'),

  // 型H：水を求めた後、元の量と足して完成量を出す。
  make('salt-h-001','total-amount','substitute',['substitute'],
    '10％の食塩水200gを水で薄めて8％にする。完成後は全部で何gですか？',
    ['40g','50g','200g','250g'],3,
    normal({problemPattern:'完成後の全体量を求める型',questionIntent:'完成後の食塩水全体の重さを求める',lowConcentration:0,targetConcentration:8,highConcentration:10,lowAmount:50,highAmount:200,leftDifference:8,rightDifference:2,amountRatio:'1：4',lowLabel:'水・0％・？g',targetLabel:'8％・完成後？g',highLabel:'10％・200g',unknownPosition:'total-amount',answerType:'amount',expected:250,unit:'g',mix:{lowAmount:50,highAmount:200},shortRule:'水の量を出してから、全部を足す',readingClues:[...saltwaterTriggerWords.H,'10％200g','8％'],knownFacts:['元の食塩水は10％・200g','水は0％・？g','完成後は全部で？g'],derivationSteps:['8－0＝8','10－8＝2','水：10％食塩水＝2：8＝1：4','10％側の200gが4つ分'],answerDerivation:['水は50g','200g＋50g＝250g'],saltCheck:['10％の200gは食塩20g','食塩20g ÷ 全体250g＝8％'] }),
    '50gは水の量です。完成後の全体量ではありません。'),
  make('salt-h-002','total-amount','apply',['practice'],
    '12％の食塩水300gに水を加えて9％にした。完成後は全部で何gですか？',
    ['100g','300g','400g','450g'],2,
    normal({problemPattern:'完成後の全体量を求める型',questionIntent:'完成後の食塩水全体の重さを求める',lowConcentration:0,targetConcentration:9,highConcentration:12,lowAmount:100,highAmount:300,leftDifference:9,rightDifference:3,amountRatio:'1：3',lowLabel:'水・0％・？g',targetLabel:'9％・完成後？g',highLabel:'12％・300g',unknownPosition:'total-amount',answerType:'amount',expected:400,unit:'g',mix:{lowAmount:100,highAmount:300},shortRule:'水の量と、完成後の全部を分ける',readingClues:['水を加えて9％','全部で何g','12％300g'],knownFacts:['元の食塩水は12％・300g','完成後は全部で？g'],derivationSteps:['9－0＝9','12－9＝3','水：12％食塩水＝3：9＝1：3'],answerDerivation:['水は100g','300g＋100g＝400g'],saltCheck:['12％の300gは食塩36g','食塩36g ÷ 全体400g＝9％'] }),
    '100gは加えた水です。問題は完成後の全部を聞いています。'),

  // 型I：計算せず、問題文の合図から型だけを選ぶ。
  make('salt-i-001','alligation-identify','identify',['identify'],
    '3％の食塩水100gと、9％の食塩水200gを混ぜると何％になるか。使う型は？',
    ['混合後濃度','一方の重さ','水を加える','蒸発'],0,
    normal({problemPattern:'型を見分ける',questionIntent:'使う型を選ぶ',lowConcentration:3,targetConcentration:7,highConcentration:9,lowAmount:100,highAmount:200,leftDifference:4,rightDifference:2,amountRatio:'1：2',lowLabel:'3％・100g',targetLabel:'？％',highLabel:'9％・200g',unknownPosition:'target-concentration',answerType:'identify',expected:0,unit:'yes-no',answerText:'混合後濃度',shortRule:'「何％になるか」なら、できあがりの濃度を探す',readingClues:[...saltwaterTriggerWords.I,'何％になるか'],knownFacts:['2つの濃度と両方の重さがある'],derivationSteps:['答えが濃度なので、できあがりの濃度を探す'],answerDerivation:['使う型は「混合後濃度」'] }),
    '何gを聞く型ではありません。'),
  make('salt-i-002','alligation-identify','identify',['identify'],
    '12％の食塩水300gに水を加えて9％にする。使う型は？',
    ['混合後濃度','水を加える','食塩を加える','蒸発'],1,
    normal({problemPattern:'型を見分ける',questionIntent:'使う型を選ぶ',lowConcentration:0,targetConcentration:9,highConcentration:12,lowAmount:100,highAmount:300,leftDifference:9,rightDifference:3,amountRatio:'1：3',lowLabel:'水・0％',targetLabel:'9％',highLabel:'12％・300g',unknownPosition:'low-amount',answerType:'identify',expected:1,unit:'yes-no',answerText:'水を加える',shortRule:'水が入り、濃度を下げる',readingClues:[...saltwaterTriggerWords.I,'水を加えて'],knownFacts:['水が入る','濃度を下げる'],derivationSteps:['水には食塩が入っていないため、低い濃度側に置ける'],answerDerivation:['使う型は「水を加える」'] }),
    '食塩を入れる型や蒸発の型ではありません。'),
  make('salt-i-003','alligation-identify','identify',['identify'],
    '濃度不明の食塩水200gと、4％の食塩水100gを混ぜると8％になった。使う型は？',
    ['混合後濃度','一方の濃度','一方の重さ','完成後全体量'],1,
    normal({problemPattern:'型を見分ける',questionIntent:'使う型を選ぶ',lowConcentration:4,targetConcentration:8,highConcentration:10,lowAmount:100,highAmount:200,leftDifference:4,rightDifference:2,amountRatio:'1：2',lowLabel:'4％・100g',targetLabel:'8％',highLabel:'？％・200g',unknownPosition:'high-concentration',answerType:'identify',expected:1,unit:'yes-no',answerText:'一方の濃度',shortRule:'「何％の食塩水」なら一方の濃度',readingClues:[...saltwaterTriggerWords.I,'濃度不明'],knownFacts:['不明なのは濃度','両方の重さは書かれている'],derivationSteps:['？に入るのは濃度'],answerDerivation:['使う型は「一方の濃度」'] }),
    '不明なのは重さではなく濃度です。'),
  make('salt-i-004','alligation-identify','identify',['identify'],
    '6％の食塩水300gに9％の食塩水を何g混ぜると8％になるか。最初に計算するものは？',
    ['6％から8％、8％から9％の差','300gを2で割る','6％と9％の平均','食塩水の合計の重さ'],0,
    normal({problemPattern:'型を見分ける',questionIntent:'最初の計算を選ぶ',lowConcentration:6,targetConcentration:8,highConcentration:9,lowAmount:300,highAmount:600,leftDifference:2,rightDifference:1,amountRatio:'1：2',lowLabel:'6％・300g',targetLabel:'8％',highLabel:'9％・？g',unknownPosition:'high-amount',answerType:'identify',expected:0,unit:'yes-no',answerText:'6％から8％、8％から9％の差',shortRule:'目標が分かるときは、真ん中から両端を引く',readingClues:[...saltwaterTriggerWords.I,'何g混ぜると8％'],knownFacts:['目標の8％が書かれている','9％側の重さが？g'],derivationSteps:['まず真ん中の8％から両端までの差を見る'],answerDerivation:['最初に計算するのは濃度差'] }),
    '重さは、濃度差を反対側へつないでから求めます。'),
  make('salt-i-005','alligation-identify','identify',['identify'],
    '6％の食塩水300gに9％の食塩水を何g混ぜると8％になるか。求めるべきものは？',
    ['一方の重さ','一方の濃度','混合後濃度','配合比'],0,
    normal({problemPattern:'型を見分ける',questionIntent:'求めるものを選ぶ',lowConcentration:6,targetConcentration:8,highConcentration:9,lowAmount:300,highAmount:600,leftDifference:2,rightDifference:1,amountRatio:'1：2',lowLabel:'6％・300g',targetLabel:'8％',highLabel:'9％・？g',unknownPosition:'high-amount',answerType:'identify',expected:0,unit:'yes-no',answerText:'一方の重さ',shortRule:'「何gの食塩水」なら一方の重さ',readingClues:[...saltwaterTriggerWords.I,'何g混ぜると'],knownFacts:['不明なのは9％側の重さ'],derivationSteps:['？に入るのはg'],answerDerivation:['求めるものは「一方の重さ」'] }),
    '濃度はすべて問題文に書かれています。'),
  make('salt-i-006','alligation-identify','identify',['identify'],
    '10％の食塩水440gに食塩を溶かして12％にした。使う型は？',
    ['水を加える','食塩を加える','蒸発','完成後全体量'],1,
    normal({problemPattern:'型を見分ける',questionIntent:'使う型を選ぶ',lowConcentration:10,targetConcentration:12,highConcentration:100,lowAmount:440,highAmount:10,leftDifference:2,rightDifference:88,amountRatio:'44：1',lowLabel:'10％・440g',targetLabel:'12％',highLabel:'食塩・100％',unknownPosition:'high-amount',answerType:'identify',expected:1,unit:'yes-no',answerText:'食塩を加える',shortRule:'食塩が入り、濃度を上げる',readingClues:[...saltwaterTriggerWords.I,'食塩を溶かして'],knownFacts:['食塩が入る','濃度を上げる'],derivationSteps:['食塩だけなら全部が食塩なので、高い濃度側に置ける'],answerDerivation:['使う型は「食塩を加える」'] }),
    '水を加える型は濃度を下げるときに使います。'),
  make('salt-i-007','alligation-identify','identify',['identify'],
    '6％の食塩水400gを加熱して8％にした。使う型は？',
    ['水を加える','食塩を加える','蒸発','一方の重さ'],2,
    normal({problemPattern:'型を見分ける',questionIntent:'使う型を選ぶ',lowConcentration:0,targetConcentration:6,highConcentration:8,lowAmount:100,highAmount:300,sourceAmount:400,leftDifference:6,rightDifference:2,amountRatio:'1：3',lowLabel:'蒸発した水・0％',targetLabel:'元の6％・400g',highLabel:'残った8％',unknownPosition:'low-amount',answerType:'identify',expected:2,unit:'yes-no',answerText:'蒸発',shortRule:'加熱して、水分が減る',readingClues:[...saltwaterTriggerWords.I,'加熱して'],knownFacts:['水分が減る','食塩量は変わらない'],derivationSteps:['消えるものは水だけで、食塩量は変わらない'],answerDerivation:['使う型は「蒸発」'] }),
    '食塩を加えたとは書かれていません。'),
  make('salt-i-008','alligation-identify','identify',['identify'],
    '12％の食塩水300gに水を加えて9％にした。求められているのは？',
    ['完成後全体量','一方の重さ','混合後濃度','配合比'],0,
    normal({problemPattern:'型を見分ける',questionIntent:'求めるものを選ぶ',lowConcentration:0,targetConcentration:9,highConcentration:12,lowAmount:100,highAmount:300,leftDifference:9,rightDifference:3,amountRatio:'1：3',lowLabel:'水・0％',targetLabel:'9％・完成後？g',highLabel:'12％・300g',unknownPosition:'total-amount',answerType:'identify',expected:0,unit:'yes-no',answerText:'完成後全体量',shortRule:'「全部で何g」なら完成後全体量',readingClues:[...saltwaterTriggerWords.I,'完成後は全部で何g'],knownFacts:['水を加える','聞かれているのは完成後の全部'],derivationSteps:['先に水の重さを出してから、元の重さと足す'],answerDerivation:['求めるものは「完成後全体量」'] }),
    '水の重さだけを聞く問題ではありません。'),
];

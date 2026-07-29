export type CheerSpeaker = 'sui'|'runa'|'sui-and-runa'|'supporter';
export type CheerMessage = {id:string; speaker:CheerSpeaker; message:string; timing:'first-start'|'before-question'};
const messages = [
 ['sui','ママ、今日もいっしょにがんばろう！'],['sui','ママ、今のところまで進めたの、すごいよ！'],['sui','ママ、がんばって！すいも応援してるよ！'],['sui','ママ、本番まで一緒にがんばろうね！'],['sui','ママ、1問ずつで大丈夫だよ！'],['sui','ママ、型が見えてきたね！'],
 ['runa','ママ、まずは1問だけやってみよう！'],['runa','ママならできるよ。あとちょっと、がんばって！'],['runa','ママ、まちがえても大丈夫だよ。次はできるよ！'],['runa','ママ、今日覚えたことが本番の1点になるよ！'],['runa','ママ、ゆっくり見れば大丈夫だよ！'],['runa','ママ、合言葉を思い出そう！'],
 ['sui-and-runa','ママ、いつもお勉強がんばっていてすごいね！'],['sui-and-runa','ママががんばっているの、ちゃんと見てるよ！'],['sui-and-runa','ママ、次の1問もいっしょに見よう！'],['sui-and-runa','ママ、できたことを1つずつ増やそうね！'],['sui-and-runa','ママ、焦らなくて大丈夫だよ！'],['sui-and-runa','ママ、応援してるよ！'],
 ['supporter','祐美、ここまでしっかり進められているよ'],['supporter','少しずつ問題の型が見えるようになってきたね'],['supporter','今日覚えた1つが、本番の1点になるよ'],['supporter','全部を一度に覚えなくても大丈夫。今はこの1つだけでいいよ'],['supporter','間違えた問題ほど、次に点数へ変わるよ'],['supporter','焦らなくて大丈夫。前より確実に進んでいるよ'],['supporter','初めて見る文章でも、型が同じなら解き方は同じだよ'],['supporter','今は速さよりも、迷わず型を選べることが大切だよ'],['supporter','見る場所が分かれば、次の手順は決めやすいよ'],['supporter','合言葉を思い出せたら、もう大きな一歩だよ']
] as const;
export const cheers: CheerMessage[] = messages.map(([speaker,message],i)=>({id:`cheer-${i+1}`,speaker: speaker as CheerSpeaker,message,timing:i<2?'first-start':'before-question'}));

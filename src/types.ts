export type FormulaId = 'basic' | 'square-plus' | 'square-minus' | 'difference-squares';
export type SaltwaterType = 'placement' | 'difference-cross' | 'ratio' | 'mixed-concentration' | 'unknown-amount' | 'add-water' | 'add-salt' | 'evaporation' | 'unknown-concentration' | 'alligation-identify';
export type LearningStage = 'memorize' | 'forward' | 'reverse' | 'blank' | 'symbol' | 'identify' | 'substitute' | 'compare' | 'place' | 'difference' | 'cross' | 'ratio' | 'apply';
export type SaltwaterData = {
  problemPattern:string; questionIntent:string; lowConcentration:number; targetConcentration:number; highConcentration:number;
  lowAmount?:number; highAmount?:number; leftDifference:number; rightDifference:number; amountRatio:string;
  lowLabel:string; targetLabel:string; highLabel:string; knownWeight?:string; unknownPosition?:string;
  readingClues:string[]; characterTip:string; answerType:'concentration'|'amount'|'ratio'|'identify';
  validationData:{ expected:number; unit:'%'|'g'|'ratio'|'yes-no'; answerText?:string; mix?:{lowAmount:number;highAmount:number}; };
  finalConcentration?:number; diagramMode?:'placement'|'difference'|'cross'|'ratio'|'water'|'salt'|'evaporation';
};
export type Question = { id:string; categoryId:string; subcategoryId:string; typeId:FormulaId|SaltwaterType; difficulty:'basic'; learningStage:LearningStage; question:string; formula:string; choices:string[]; answerIndex:number; shortRule:string; triggerWords:string[]; steps:string[]; explanation:string; deepExplanation:string; mistakeReason:string; diagramType:'sum-product-pair'|'square-tiles'|'difference-squares'|'saltwater-alligation'; diagramData:Record<string,string>; tags:string[]; saltwater?:SaltwaterData };
export type Formula = {id:FormulaId; name:string; formula:string; rule:string; lookFor:string; example:string; diagramType:Question['diagramType']};

import type { Question } from '../types';
import { SaltwaterAlligationDiagram } from './SaltwaterAlligationDiagram';
import { SequencePatternDiagram } from './SequencePatternDiagram';
export function Diagram({question}:{question:Question}) { const d=question.diagramData;
 if(question.diagramType==='saltwater-alligation' && question.saltwater) return <SaltwaterAlligationDiagram data={question.saltwater} />;
 if(question.diagramType==='sequence-pattern' && question.sequence) return <SequencePatternDiagram data={question.sequence} />;
 if(question.diagramType==='sum-product-pair') return <div className="diagram"><p className="diagram-label">① 2つの数をくらべる</p><div className="pair-grid"><div><b className="blue">1 と 6</b><span>足すと 7</span><span>掛けると {d.last}</span></div><div className="chosen"><b className="green">2 と 3</b><span>足すと {d.middle}</span><span>掛けると {d.last}</span></div></div><p className="arrow">↓ 採用</p><strong className="answer">(x＋2)(x＋3)</strong></div>;
 if(question.diagramType==='square-tiles') return <div className="diagram"><p className="diagram-label">① 4つのピースで正方形</p><div className="tile"><span>x²</span><span>ax</span><span>ax</span><span>a²</span></div><p className="arrow">↓ ひとまとまり</p><strong className="answer">(x {d.sign} a)²</strong></div>;
 return <div className="diagram"><p className="diagram-label">① 同じ数をプラスとマイナスへ</p><div className="split"><span className="blue">x²－a²</span><span>→</span><span className="green">(x＋a)</span><span className="red">(x－a)</span></div><p className="muted">真ん中の項は、＋ax と －ax で消える</p></div>;
}

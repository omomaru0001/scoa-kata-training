import { useEffect, useRef, useState } from 'react';

export type QuizBackActions = {
  canGoPrevious: boolean;
  onPrevious: () => void;
  onCategory: () => void;
  onCategories: () => void;
  onHome: () => void;
};

export function BackMenu({ canGoPrevious, onPrevious, onCategory, onCategories, onHome }: QuizBackActions) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const close = () => setOpen(false);

  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => { if (!root.current?.contains(event.target as Node)) close(); };
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape') close(); };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => { document.removeEventListener('mousedown', onPointerDown); document.removeEventListener('keydown', onKeyDown); };
  }, []);

  const choose = (action: () => void) => { close(); action(); };
  return <div className="back-menu" ref={root}>
    <button className="back-button back-menu-trigger" aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen((value) => !value)}>← 戻る <span aria-hidden>▼</span></button>
    {open && <div className="back-menu-list" role="menu" aria-label="戻るメニュー">
      <button role="menuitem" disabled={!canGoPrevious} onClick={() => choose(onPrevious)}>前の問題に戻る</button>
      <button role="menuitem" onClick={() => choose(onCategory)}>このカテゴリに戻る</button>
      <button role="menuitem" onClick={() => choose(onCategories)}>カテゴリを選ぶ</button>
      <button role="menuitem" onClick={() => choose(onHome)}>TOPに戻る</button>
    </div>}
  </div>;
}

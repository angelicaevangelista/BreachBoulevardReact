import React, { useId, useState } from 'react';
export default function FaqItem({
  className,
  buttonClass,
  iconClass,
  answerClass,
  question,
  children,
}) {
  const [open, setOpen] = useState(false);
  const id = useId();
  return (
    <div className={className}>
      <button
        className={buttonClass}
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((value) => !value)}
      >
        {question}
        <span
          aria-hidden="true"
          className={iconClass
            .replace('rotate-0', open ? 'rotate-180' : 'rotate-0')
            .replace('fa-plus', open ? 'fa-minus' : 'fa-plus')}
        />
      </button>
      <div id={id} className={`${open ? '' : 'hidden '}${answerClass.replace(/\bhidden\s*/, '')}`}>
        {children}
      </div>
    </div>
  );
}

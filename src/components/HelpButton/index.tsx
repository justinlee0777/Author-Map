import clsx from 'clsx';

import type { JSX } from 'react';
import { MdHelpOutline } from 'react-icons/md';

interface Props {
  onClick: () => void;

  className?: string;
}

export function HelpButton({ onClick, className }: Props): JSX.Element {
  return (
    <button
      className={clsx('helpButton', 'button', className)}
      onClick={onClick}
    >
      <MdHelpOutline />
    </button>
  );
}

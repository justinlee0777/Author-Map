import clsx from 'clsx';
import { JSX, ReactNode } from 'react';
import { MdAdd } from 'react-icons/md';

interface Props {
  className?: string;
  onClick?: () => void;

  children?: {
    left?: ReactNode;
    right?: ReactNode;
  };
}

export function AddAuthor({
  className,
  onClick,
  children,
}: Props): JSX.Element {
  return (
    <button
      className={clsx('button', 'addAuthor', className)}
      onClick={onClick}
    >
      {children?.left}
      <MdAdd />
      {children?.right}
    </button>
  );
}

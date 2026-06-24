import { MdAdd } from 'react-icons/md';
import { clsx } from 'clsx';
import { JSX, ReactNode } from 'react';

interface Props {
  className?: string;
  onClick?: () => void;

  children?: {
    left?: ReactNode;
    right?: ReactNode;
  };
}

export function AddMajorEvent({
  className,
  onClick,
  children,
}: Props): JSX.Element {
  return (
    <button
      className={clsx('button', 'addMajorEvent', className)}
      onClick={onClick}
    >
      {children?.left}
      <MdAdd />
      {children?.right}
    </button>
  );
}

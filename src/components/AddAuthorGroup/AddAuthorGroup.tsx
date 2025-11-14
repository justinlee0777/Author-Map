import commonStyles from '../../common.module.css';
import styles from './AddAuthorGroup.module.css';

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

export function AddAuthorGroup({
  className,
  onClick,
  children,
}: Props): JSX.Element {
  return (
    <button
      className={clsx(commonStyles.button, styles.addAuthorGroup, className)}
      onClick={onClick}
    >
      {children?.left}
      <MdAdd />
      {children?.right}
    </button>
  );
}

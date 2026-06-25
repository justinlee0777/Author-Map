import clsx from 'clsx';
import { JSX, ReactNode } from 'react';
import { MdClose } from 'react-icons/md';

interface Props {
  title: string;

  children?: ReactNode;
  className?: string;
  onClose?: () => void;
}

export function SideDrawer({
  title,
  children,
  className,
  onClose,
}: Props): JSX.Element {
  return (
    <div className={clsx('sideDrawer', className)}>
      <h3>
        {title}

        <button className={clsx('button', 'sideDrawerClose')} onClick={onClose}>
          <MdClose />
        </button>
      </h3>
      {children}
    </div>
  );
}

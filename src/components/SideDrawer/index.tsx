import clsx from 'clsx';
import { JSX, ReactNode } from 'react';
import { MdClose } from 'react-icons/md';
import { CommonModal } from '../CommonModal/CommonModal';

interface Props {
  opened: boolean;
  title: string;

  children?: ReactNode;
  className?: string;
  onClose?: () => void;
}

export function SideDrawer({
  opened,
  title,
  children,
  className,
  onClose,
}: Props): JSX.Element {
  return (
    <CommonModal
      className={clsx('sideDrawer', className)}
      opened={opened}
      onClose={onClose}
    >
      <h3>{title}</h3>
      {children}
    </CommonModal>
  );
}

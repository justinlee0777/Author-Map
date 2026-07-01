import clsx from 'clsx';
import { JSX, ReactNode } from 'react';
import { MdClear } from 'react-icons/md';
import Modal from 'react-modal';

interface Props {
  children: ReactNode;
  opened: boolean;

  onClose?: () => void;
}

export function CommonModal({ children, opened, onClose }: Props): JSX.Element {
  return (
    <Modal className="modal" isOpen={opened}>
      <button
        className={clsx('button', 'closeModal')}
        type="button"
        onClick={onClose}
      >
        <MdClear />
      </button>
      {children}
    </Modal>
  );
}

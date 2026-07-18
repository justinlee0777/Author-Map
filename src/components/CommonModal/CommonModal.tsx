import clsx from 'clsx';
import { type JSX, type ReactNode, useEffect, useRef } from 'react';
import { MdClear } from 'react-icons/md';

interface Props {
  children: ReactNode;
  opened: boolean;

  className?: string;
  onClose?: () => void;
}

export function CommonModal({
  children,
  opened,
  className,
  onClose,
}: Props): JSX.Element {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog) {
      if (opened && !dialog.open) {
        dialog.showModal();
      } else if (!opened && dialog.open) {
        dialog.close();
      }
    }
  }, [opened, dialogRef]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog) {
      const handleCancel = (event: Event) => {
        event.preventDefault();
        onClose?.();
      };

      dialog.addEventListener('cancel', handleCancel);

      return () => dialog.removeEventListener('cancel', handleCancel);
    }
  }, [onClose]);

  return (
    <dialog className={clsx('modal', className)} ref={dialogRef}>
      <button
        className={clsx('button', 'closeModal')}
        type="button"
        onClick={onClose}
      >
        <MdClear />
      </button>
      {children}
    </dialog>
  );
}

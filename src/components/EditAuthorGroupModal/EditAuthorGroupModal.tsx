import styles from './EditAuthorGroupModal.module.css';

import { JSX, useState } from 'react';

import Modal from 'react-modal';
import { AuthorGroup } from '../../models';
import { RegisterAuthorGroup } from '../RegisterAuthorGroup/RegisterAuthorGroup';
import { MdClear } from 'react-icons/md';

interface Props {
  appElement: HTMLElement;
  opened: boolean;

  initialAuthorGroup: Partial<AuthorGroup>;

  onClose?: () => void;
  onSubmit?: (authorGroup: AuthorGroup) => void | Promise<void>;
}

export function EditAuthorGroupModal({
  appElement,
  opened,
  initialAuthorGroup,
  onClose,
  onSubmit,
}: Props): JSX.Element {
  const [loading, setLoading] = useState(false);

  const [authorGroup, setAuthorGroup] = useState(initialAuthorGroup);

  return (
    <Modal isOpen={opened} appElement={appElement}>
      <div className={styles.editAuthorGroupModal}>
        <button
          className={styles.editAuthorGroupCloseModal}
          type="button"
          onClick={onClose}
        >
          <MdClear />
        </button>

        <RegisterAuthorGroup
          id="create-author-group"
          value={authorGroup}
          disabled={loading}
          onChange={setAuthorGroup}
          onSubmit={async (group) => {
            setLoading(true);
            try {
              await onSubmit?.(group);
            } finally {
              setLoading(false);
            }
          }}
        />
      </div>
    </Modal>
  );
}

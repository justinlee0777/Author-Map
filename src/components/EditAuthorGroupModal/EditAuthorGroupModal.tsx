import styles from './EditAuthorGroupModal.module.css';

import { JSX, useState } from 'react';

import { AuthorGroup } from '../../models';
import { RegisterAuthorGroup } from '../RegisterAuthorGroup/RegisterAuthorGroup';
import { CommonModal } from '../CommonModal/CommonModal';

interface Props {
  appElement: HTMLElement;
  opened: boolean;

  initialAuthorGroup: Partial<AuthorGroup>;

  disabled?: boolean | string;
  onClose?: () => void;
  onSubmit?: (authorGroup: AuthorGroup) => void | Promise<void>;
}

export function EditAuthorGroupModal({
  appElement,
  opened,
  initialAuthorGroup,
  disabled,
  onClose,
  onSubmit,
}: Props): JSX.Element {
  const [loading, setLoading] = useState(false);

  const [authorGroup, setAuthorGroup] = useState(initialAuthorGroup);

  return (
    <CommonModal opened={opened} appElement={appElement} onClose={onClose}>
      <div className={styles.editAuthorGroupModal}>
        <RegisterAuthorGroup
          id="create-author-group"
          value={authorGroup}
          disabled={disabled || loading}
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
    </CommonModal>
  );
}

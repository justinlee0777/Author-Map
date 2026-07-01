import { JSX, useState } from 'react';

import { AuthorGroup } from '../../models';
import { RegisterAuthorGroup } from '../RegisterAuthorGroup/RegisterAuthorGroup';
import { CommonModal } from '../CommonModal/CommonModal';

interface Props {
  opened: boolean;

  initialAuthorGroup: Partial<AuthorGroup>;

  disabled?: boolean | string;
  onClose?: () => void;
  onSubmit?: (authorGroup: AuthorGroup) => void | Promise<void>;
}

export function EditAuthorGroupModal({
  opened,
  initialAuthorGroup,
  disabled,
  onClose,
  onSubmit,
}: Props): JSX.Element {
  const [loading, setLoading] = useState(false);

  const [authorGroup, setAuthorGroup] = useState(initialAuthorGroup);

  return (
    <CommonModal opened={opened} onClose={onClose}>
      <div className="editAuthorGroupModal">
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

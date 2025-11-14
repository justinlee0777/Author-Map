import commonStyles from '../../common.module.css';
import styles from './AuthorGroupInput.module.css';

import { JSX, useCallback, useContext, useMemo, useState } from 'react';
import { AuthorGroupContext } from '../../contexts';
import { RegisterAuthorGroup } from '../RegisterAuthorGroup/RegisterAuthorGroup';
import { AuthorGroup } from '../../models';
import { MdAdd, MdClear } from 'react-icons/md';
import clsx from 'clsx';
import { formatDate } from '../../utils/dates';
import { createKeyGenerator } from '../../utils/stores';
import { DynamicList, ItemProps } from '../DynamicList/DynamicList';

interface Props {
  values: Array<AuthorGroup>;

  registerAuthorGroup: (group: AuthorGroup) => void | Promise<void>;
  onChange: (groups: Array<AuthorGroup>) => void;

  disabled?: boolean;
  className?: string;
}

export function AuthorGroupInput({
  values,
  className,
  disabled,
  onChange,
  registerAuthorGroup,
}: Props): JSX.Element {
  const { groups } = useContext(AuthorGroupContext);

  const [creatingAuthorGroupId, selectAuthorGroupId] = useMemo(
    () => ['create-author-group', 'select-existing-author-group'],
    [],
  );

  const keyGenerator = useMemo(() => createKeyGenerator(), []);

  const [creatingGroup, setCreatingGroup] =
    useState<Partial<AuthorGroup> | null>(null);

  const AuthorGroupTag = useCallback(
    ({ item, RemoveButton, index }: ItemProps<AuthorGroup>): JSX.Element => {
      return (
        <div className={styles.authorGroupInputTag}>
          {item.name} <RemoveButton item={item} index={index} />
        </div>
      );
    },
    [],
  );

  let content: JSX.Element;

  if (groups.length === 0) {
    content = (
      <>
        <p className={styles.authorGroupInputNoneMessage}>
          No groups found. Please create one.
        </p>
      </>
    );
  } else {
    content = (
      <>
        <label htmlFor={selectAuthorGroupId}>Pick group</label>
        <select
          id={selectAuthorGroupId}
          onChange={(event) => {
            if (event.currentTarget.value) {
              const index = Number(event.currentTarget.value);

              const group = groups[index];

              if (values.every((addedGroup) => addedGroup.id !== group.id)) {
                onChange(values.concat(group));
              }
            }
          }}
        >
          <option></option>
          {groups.map((group, index) => {
            const { id, name, span, description } = group;

            let spanString: string | undefined;

            if (span) {
              spanString = `${formatDate(span.startDate)} - ${formatDate(span.endDate)}`;
            }

            return (
              <option key={keyGenerator.getKey(id)} value={index}>
                {name} {spanString}: {description.slice(0, 100)}
              </option>
            );
          })}
        </select>
      </>
    );
  }

  let creatingGroupContent: JSX.Element;

  if (creatingGroup) {
    creatingGroupContent = (
      <>
        <label
          className={styles.authorGroupInputNewGroupLabel}
          htmlFor={creatingAuthorGroupId}
        >
          New group{' '}
          <button
            className={commonStyles.button}
            type="button"
            onClick={() => setCreatingGroup(null)}
            disabled={disabled}
          >
            <MdClear />
          </button>
        </label>
        <RegisterAuthorGroup
          id={creatingAuthorGroupId}
          value={creatingGroup}
          onChange={setCreatingGroup}
          onSubmit={async (authorGroup) => {
            await registerAuthorGroup?.(authorGroup);

            setCreatingGroup(null);
          }}
        />
      </>
    );
  } else {
    creatingGroupContent = (
      <button
        className={clsx(commonStyles.button, styles.authorGroupCreateGroup)}
        type="button"
        onClick={() => setCreatingGroup({})}
        disabled={disabled}
      >
        <MdAdd /> Create group
      </button>
    );
  }

  return (
    <div className={clsx(styles.authorGroupInput, className)}>
      {content}

      <DynamicList<AuthorGroup>
        classes={{
          listItems: styles.authorGroupInputTags,
        }}
        items={values}
        ItemTemplate={AuthorGroupTag}
        trackItem={({ item }) => keyGenerator.getKey(item.id)}
        onRemove={({ item }) => {
          onChange(values.filter((group) => group.id !== item.id));
        }}
      />

      {creatingGroupContent}
    </div>
  );
}

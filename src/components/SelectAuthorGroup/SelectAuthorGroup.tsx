import { JSX, useContext, useMemo } from 'react';
import { AuthorGroup } from '../../models';
import { AuthorGroupContext } from '../../contexts';
import { formatDate } from '../../utils/dates';
import { createKeyGenerator } from '../../utils/stores';

interface Props {
  id: string;
  label: string;

  onSelect: (group: AuthorGroup | null) => void;
}

export function SelectAuthorGroup({ id, label, onSelect }: Props): JSX.Element {
  const { groups } = useContext(AuthorGroupContext);

  const keyGenerator = useMemo(() => createKeyGenerator(), []);

  return (
    <>
      <label htmlFor={id}>{label}</label>
      <select
        id={id}
        onChange={(event) => {
          if (event.currentTarget.value) {
            const index = Number(event.currentTarget.value);

            const group = groups[index];

            onSelect(group);
          } else {
            onSelect(null);
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

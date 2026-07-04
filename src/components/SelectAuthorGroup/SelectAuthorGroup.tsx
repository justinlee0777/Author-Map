import { JSX, useContext, useMemo } from 'react';
import { AuthorGroup } from '../../models';
import { AuthorMapDataContext } from '../../contexts';
import { formatDate } from '../../utils/dates';
import { createKeyGenerator } from '../../utils/stores';

interface Props {
  id: string;
  onSelect: (group: AuthorGroup | null) => void;

  value?: string;
}

export function SelectAuthorGroup({ id, value, onSelect }: Props): JSX.Element {
  const { groups } = useContext(AuthorMapDataContext);

  const keyGenerator = useMemo(() => createKeyGenerator(), []);

  return (
    <select
      id={id}
      value={value}
      onChange={(event) => {
        if (event.currentTarget.value) {
          const id = event.currentTarget.value;

          const group = groups.find((g) => g.id === id)!;

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
          <option key={keyGenerator.getKey(id)} value={id}>
            {name} {spanString}: {description.slice(0, 100)}
          </option>
        );
      })}
    </select>
  );
}

import { MdAdd, MdClear } from 'react-icons/md';

import { JSX, useCallback } from 'react';
import clsx from 'clsx';

interface ItemData<ItemType> {
  item: ItemType;
  index: number;
}

export interface ItemProps<ItemType> extends ItemData<ItemType> {
  RemoveButton: (props: ItemData<ItemType>) => JSX.Element;
}

interface Props<ItemType> {
  items: Array<ItemType>;
  ItemTemplate: (props: ItemProps<ItemType>) => JSX.Element;
  trackItem: (props: ItemData<ItemType>) => string;

  classes?: {
    component?: string;
    listItems?: string;
  };
  addText?: string;
  onAdd?: () => void;
  onRemove?: (props: ItemData<ItemType>) => void;
}

export function DynamicList<ItemType>({
  classes,
  items,
  ItemTemplate,
  trackItem,
  addText,
  onAdd,
  onRemove,
}: Props<ItemType>): JSX.Element {
  const RemoveButton = useCallback(
    (props: ItemData<ItemType>) => {
      return (
        <button
          type="button"
          className={clsx('dynamicListButton', 'dynamicListRemoveButton')}
          onClick={() => {
            onRemove?.(props);
          }}
        >
          <MdClear />
        </button>
      );
    },
    [onRemove],
  );

  return (
    <div className={clsx('dynamicList', classes?.component)}>
      <div className={clsx('dynamicListItems', classes?.listItems)}>
        {items.map((item, index) => {
          return (
            <ItemTemplate
              key={trackItem({ item, index })}
              item={item}
              index={index}
              RemoveButton={RemoveButton}
            />
          );
        })}
      </div>
      {onAdd && (
        <button
          className={clsx('dynamicListButton', 'dynamicListAddButton')}
          type="button"
          onClick={onAdd}
        >
          <MdAdd />
          {addText}
        </button>
      )}
    </div>
  );
}

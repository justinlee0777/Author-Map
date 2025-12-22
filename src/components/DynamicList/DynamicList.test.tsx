import { render, waitFor, screen, fireEvent } from '@testing-library/react';
import { DynamicList } from './DynamicList';

describe('<DynamicList/>', () => {
  test('should render', async () => {
    render(
      <DynamicList<string>
        items={['foo', 'bar', 'baz']}
        addText="Add"
        ItemTemplate={({ item, index, RemoveButton }) => {
          return (
            <p>
              {item} <RemoveButton item={item} index={index} />
            </p>
          );
        }}
        onAdd={() => {}}
        trackItem={({ index }) => index.toString()}
      />,
    );

    const fooItem = await waitFor(() => screen.findByText('foo'));

    expect(fooItem).toBeTruthy();

    const barItem = await waitFor(() => screen.findByText('bar'));

    expect(barItem).toBeTruthy();

    const bazItem = await waitFor(() => screen.findByText('baz'));

    expect(bazItem).toBeTruthy();

    [fooItem, barItem, bazItem].forEach((element) => {
      expect(element.querySelector('button')).toBeTruthy();
    });

    const addButton = await waitFor(() => screen.findByText('Add'));

    expect(addButton).toBeTruthy();
  });

  test('should add items', async () => {
    const onAdd = jest.fn();

    render(
      <DynamicList<string>
        items={['foo', 'bar', 'baz']}
        addText="Add"
        ItemTemplate={({ item, index, RemoveButton }) => {
          return (
            <p>
              {item} <RemoveButton item={item} index={index} />
            </p>
          );
        }}
        trackItem={({ index }) => index.toString()}
        onAdd={onAdd}
      />,
    );

    const addButton = await waitFor(() => screen.findByText('Add'));

    fireEvent.click(addButton);

    expect(onAdd).toHaveBeenCalledTimes(1);
  });

  test('should remove items', async () => {
    const onRemove = jest.fn();
    const items = ['foo', 'bar', 'baz'];
    render(
      <DynamicList<string>
        items={items}
        addText="Add"
        ItemTemplate={({ item, index, RemoveButton }) => {
          return (
            <p>
              {item} <RemoveButton item={item} index={index} />
            </p>
          );
        }}
        trackItem={({ index }) => index.toString()}
        onRemove={onRemove}
      />,
    );

    const fooItem = await waitFor(() => screen.findByText('foo')),
      barItem = await waitFor(() => screen.findByText('bar')),
      bazItem = await waitFor(() => screen.findByText('baz'));

    [fooItem, barItem, bazItem].forEach((item, index) => {
      fireEvent.click(item.querySelector('button')!);

      expect(onRemove).toHaveBeenCalledTimes(index + 1);
      expect(onRemove).toHaveBeenCalledWith({ index, item: items[index] });
    });
  });
});

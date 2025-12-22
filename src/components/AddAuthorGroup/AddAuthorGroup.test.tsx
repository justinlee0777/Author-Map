import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { AddAuthorGroup } from './AddAuthorGroup';

describe('<AddAuthorGroup/>', () => {
  test('should render', async () => {
    const onClickSpy = jest.fn();

    render(
      <AddAuthorGroup
        children={{ left: 'Foo', right: 'Bar' }}
        onClick={onClickSpy}
      />,
    );

    const button = await waitFor(() => screen.findByRole('button'));

    expect(button).toBeTruthy();

    expect(button.childNodes.length).toBe(3);

    expect(button.childNodes.item(0).textContent).toBe('Foo');

    expect((button.childNodes.item(1) as Element).tagName).toBe('svg');

    expect(button.childNodes.item(2).textContent).toBe('Bar');

    fireEvent.click(button);

    expect(onClickSpy).toHaveBeenCalledTimes(1);
  });
});

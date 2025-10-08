import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { DatePicker } from './DatePicker';

describe('<DatePicker/>', () => {
  test('should render without a value', async () => {
    const result = render(<DatePicker id="example" onChange={() => {}} />);

    const checkboxLabel = await waitFor(() =>
      screen.findByText('I know the exact date'),
    );

    expect(checkboxLabel).toBeTruthy();

    const htmlFor = (checkboxLabel as HTMLLabelElement).htmlFor;

    expect(htmlFor).toBeTruthy();

    const component = result.container;

    const checkbox = component.querySelector(
      `#${htmlFor}`,
    )! as HTMLInputElement;

    expect(checkbox).toBeTruthy();

    expect(checkbox.checked).toBe(false);

    const fullDateInput = component.querySelector('#example-full-date');

    expect(fullDateInput).toBeFalsy();

    const monthInput = component.querySelector('#example-month');

    expect(monthInput).toBeTruthy();

    const yearInput = component.querySelector('#example-year');

    expect(yearInput).toBeTruthy();
  });

  test('should render with the date known', async () => {
    const result = render(
      <DatePicker id="example" onChange={() => {}} value="1992-08-19" />,
    );

    const checkboxLabel = await waitFor(() =>
      screen.findByText('I know the exact date'),
    );

    expect(checkboxLabel).toBeTruthy();

    const htmlFor = (checkboxLabel as HTMLLabelElement).htmlFor;

    expect(htmlFor).toBeTruthy();

    const component = result.container;

    const checkbox = component.querySelector(
      `#${htmlFor}`,
    )! as HTMLInputElement;

    expect(checkbox.checked).toBe(true);

    const fullDateInput = component.querySelector('#example-full-date');

    expect(fullDateInput).toBeTruthy();

    const monthInput = component.querySelector('#example-month');

    expect(monthInput).toBeFalsy();

    const yearInput = component.querySelector('#example-year');

    expect(yearInput).toBeFalsy();
  });

  test('should populate a date', () => {
    const result = render(
      <DatePicker id="example" onChange={() => {}} value="1985-04-22" />,
    );

    const component = result.container;

    const fullDateInput = component.querySelector(
      '#example-full-date',
    ) as HTMLInputElement;

    expect(fullDateInput.value).toBe('1985-04-22');
  });

  test('should populate month and year', () => {
    const result = render(
      <DatePicker id="example" onChange={() => {}} value="1985-04" />,
    );

    const component = result.container;

    const monthInput = component.querySelector(
      '#example-month',
    ) as HTMLInputElement;

    expect(monthInput.value).toBe('04');

    const yearInput = component.querySelector(
      '#example-year',
    ) as HTMLInputElement;

    expect(yearInput.value).toBe('1985');
  });

  test('should populate year', () => {
    const result = render(
      <DatePicker id="example" onChange={() => {}} value="1985" />,
    );

    const component = result.container;

    const monthInput = component.querySelector(
      '#example-month',
    ) as HTMLInputElement;

    expect(monthInput.value).toBe('');

    const yearInput = component.querySelector(
      '#example-year',
    ) as HTMLInputElement;

    expect(yearInput.value).toBe('1985');
  });

  test('should change date known', () => {
    const onChange = jest.fn();

    const result = render(
      <DatePicker id="example" onChange={onChange} value="1985-04-02" />,
    );

    const component = result.container;

    const fullDateInput = component.querySelector(
      '#example-full-date',
    ) as HTMLInputElement;

    fireEvent.change(fullDateInput, {
      target: { value: '1979-06-27' },
    });

    expect(onChange).toHaveBeenCalledTimes(1);

    expect(onChange).toHaveBeenCalledWith('1979-06-27');
  });

  test('should change month and year', () => {
    const onChange = jest.fn();

    const result = render(
      <DatePicker id="example" onChange={onChange} value="1985" />,
    );

    const component = result.container;

    const yearInput = component.querySelector(
      '#example-year',
    ) as HTMLInputElement;

    fireEvent.change(yearInput, {
      target: { value: '1965' },
    });

    expect(onChange).toHaveBeenCalledTimes(1);

    expect(onChange).toHaveBeenCalledWith('1965');

    const monthInput = component.querySelector(
      '#example-month',
    ) as HTMLInputElement;

    fireEvent.change(monthInput, {
      target: { value: '07' },
    });

    expect(onChange).toHaveBeenCalledTimes(2);

    expect(onChange).toHaveBeenCalledWith('1985-07');
  });
});

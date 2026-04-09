/*
jest.mock('../../DatePicker/DatePicker', () => ({
  DatePicker: () => <p>Date picker</p>,
}));

import { render, waitFor, screen, fireEvent } from '@testing-library/react';
import { TimelineEvent } from './TimelineEvent';
import { USState } from '../../../models';

describe('<TimelineEvent/>', () => {
  test('should render', async () => {
    render(
      <TimelineEvent
        id="example"
        dateKeys={[
          { keyName: 'startDate', label: 'Start date' },
          { keyName: 'endDate', label: 'End Date' },
        ]}
        fieldName="foo"
        item={{
          location: {
            address: 'Foo Bar Baz',
            state: USState.DELAWARE,
          },
        }}
        setFieldValue={() => {}}
        handleChange={() => {}}
      />,
    );

    const startDateLabel = await waitFor(() => screen.findByText('Start date'));

    expect(startDateLabel).toBeTruthy();

    const endDateLabel = await waitFor(() => screen.findByText('End Date'));

    expect(endDateLabel).toBeTruthy();

    const eventHeader = await waitFor(() => screen.findByText('Event'));

    expect(eventHeader).toBeTruthy();

    const stateLabel = await waitFor(() => screen.findByText('State'));

    expect(stateLabel).toBeTruthy();

    const addressLabel = await waitFor(() => screen.findByText('Address'));

    expect(addressLabel).toBeTruthy();
  });

  test('should handle US state changes', async () => {
    const handleChange = jest.fn();

    const result = render(
      <TimelineEvent
        id="example"
        dateKeys={[
          { keyName: 'startDate', label: 'Start date' },
          { keyName: 'endDate', label: 'End Date' },
        ]}
        fieldName="foo"
        item={{
          location: {
            address: 'Foo Bar Baz',
            state: USState.DELAWARE,
          },
        }}
        setFieldValue={() => {}}
        handleChange={handleChange}
      />,
    );

    const component = result.container;

    const stateLabel = (await waitFor(() =>
      screen.findByText('State'),
    )) as HTMLLabelElement;

    const stateSelect = component.querySelector(`#${stateLabel.htmlFor}`)!;

    expect(stateSelect).toBeTruthy();

    fireEvent.change(stateSelect, {
      target: { value: USState.ALASKA },
    });

    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  test('should handle US address changes', async () => {
    const handleChange = jest.fn();

    const result = render(
      <TimelineEvent
        id="example"
        dateKeys={[
          { keyName: 'startDate', label: 'Start date' },
          { keyName: 'endDate', label: 'End Date' },
        ]}
        fieldName="foo"
        item={{
          location: {
            address: 'Foo Bar Baz',
            state: USState.DELAWARE,
          },
        }}
        setFieldValue={() => {}}
        handleChange={handleChange}
      />,
    );

    const component = result.container;

    const addressLabel = (await waitFor(() =>
      screen.findByText('Address'),
    )) as HTMLLabelElement;

    const addressField = component.querySelector(`#${addressLabel.htmlFor}`)!;

    expect(addressField).toBeTruthy();

    fireEvent.change(addressField, {
      target: { value: 'Fart' },
    });

    expect(handleChange).toHaveBeenCalledTimes(1);
  });
});
*/

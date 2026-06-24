import { JSX, useMemo } from 'react';
import { MdArrowDropDown, MdArrowDropUp } from 'react-icons/md';
import clsx from 'clsx';

import { Radiogroup, RadiogroupOption } from '../Radiogroup/Radiogroup';
import {
  AmericanLiteraryAward,
  AwardInclusionReason,
  ClassicPublisher,
  ClassicPublisherReason,
  PersonalReason,
  type PoetLaureateReason,
} from '../../models';
import { InclusionReasonFilter } from '../../utils/stores';

export interface InclusionReasonValues {
  poetLaureates: boolean;
  personal: boolean;
  publishers: {
    collapsed: boolean;
    checked: boolean;
    specific: {
      [key in ClassicPublisher]: boolean;
    };
  };
  awards: {
    collapsed: boolean;
    checked: boolean;
    specific: {
      [key in AmericanLiteraryAward]: boolean;
    };
  };
}

interface Props {
  selected: InclusionReasonValues;

  onSelectedChange: (values: InclusionReasonValues) => void;
}

export function InclusionReasonSelect({
  selected,
  onSelectedChange,
}: Props): JSX.Element {
  const poetLaureateValue: PoetLaureateReason['type'] = 'Poet Laureate',
    publisherValue: ClassicPublisherReason['type'] =
      'Published as classical literature',
    awardValue: AwardInclusionReason['type'] = 'award',
    personalValue: PersonalReason['type'] = 'Because I said so; source: me';

  const inclusionReasonOptions: Parameters<typeof Radiogroup>[0]['options'] =
    useMemo(() => {
      const poetLaureateOption: RadiogroupOption<PoetLaureateReason['type']> = {
        label: 'US Poet laureates',
        value: poetLaureateValue,
        render: (OptionComponent) => (
          <OptionComponent
            key="poet-laureates"
            className="inclusionReasonOption"
          />
        ),
      };

      const publisherOption: RadiogroupOption<ClassicPublisherReason['type']> =
        {
          label: 'Publishers of classics',
          value: publisherValue,
          render: (OptionComponent) => {
            return (
              <OptionComponent
                key="publishers"
                className="inclusionReasonOption"
              >
                <button
                  className="button"
                  onClick={() => {
                    const newSelected = structuredClone(selected);

                    newSelected.publishers.collapsed =
                      !newSelected.publishers.collapsed;

                    onSelectedChange(newSelected);
                  }}
                >
                  {selected.publishers.collapsed ? (
                    <MdArrowDropUp />
                  ) : (
                    <MdArrowDropDown />
                  )}
                </button>
              </OptionComponent>
            );
          },
        };

      const publisherOptions: Array<RadiogroupOption<ClassicPublisher>> =
        Object.values(ClassicPublisher).map((value) => ({
          label: value,
          value,
          render: (OptionComponent) => (
            <OptionComponent
              key={value}
              disabled={!selected.publishers.checked}
              className={clsx(
                'inclusionReasonOption',
                'inclusionReasonOptionChild',
                {
                  inclusionReasonOptionCollapsed: selected.publishers.collapsed,
                },
              )}
            />
          ),
        }));

      const awardOption: RadiogroupOption<AwardInclusionReason['type']> = {
        label: 'American literary awards',
        value: awardValue,
        render: (OptionComponent) => (
          <OptionComponent key="awards" className="inclusionReasonOption">
            <button
              className="button"
              onClick={() => {
                const newSelected = structuredClone(selected);

                newSelected.awards.collapsed = !newSelected.awards.collapsed;

                onSelectedChange(newSelected);
              }}
            >
              {selected.awards.collapsed ? (
                <MdArrowDropUp />
              ) : (
                <MdArrowDropDown />
              )}
            </button>
          </OptionComponent>
        ),
      };

      const awardOptions: Array<RadiogroupOption<AmericanLiteraryAward>> =
        Object.values(AmericanLiteraryAward).map((value) => ({
          label: value,
          value,
          render: (OptionComponent) => (
            <OptionComponent
              key={value}
              disabled={!selected.awards.checked}
              className={clsx(
                'inclusionReasonOption',
                'inclusionReasonOptionChild',
                {
                  inclusionReasonOptionCollapsed: selected.awards.collapsed,
                },
              )}
            />
          ),
        }));

      const personalOption: RadiogroupOption<PersonalReason['type']> = {
        label: 'Me',
        value: personalValue,
        render: (OptionComponent) => (
          <OptionComponent key="me" className="inclusionReasonOption" />
        ),
      };

      return [
        poetLaureateOption,
        publisherOption,
        ...publisherOptions,
        awardOption,
        ...awardOptions,
        personalOption,
      ];
    }, [selected, onSelectedChange]);

  const selectedValues: Array<string> = [];

  if (selected.poetLaureates) {
    selectedValues.push(poetLaureateValue);
  }
  if (selected.publishers.checked) {
    selectedValues.push(publisherValue);
  }
  if (selected.awards.checked) {
    selectedValues.push(awardValue);
  }
  if (selected.personal) {
    selectedValues.push(personalValue);
  }
  [
    ...Object.entries(selected.awards.specific),
    ...Object.entries(selected.publishers.specific),
  ]
    .filter(([, value]) => value)
    .forEach(([key]) => selectedValues.push(key));

  return (
    <Radiogroup
      header="Reasons for inclusion"
      id="inclusion-reason-select"
      type="checkbox"
      options={inclusionReasonOptions}
      selected={selectedValues}
      onChange={(value) => {
        const newSelected = structuredClone(selected);

        if (value === poetLaureateValue) {
          newSelected.poetLaureates = !newSelected.poetLaureates;
        } else if (value === publisherValue) {
          newSelected.publishers.checked = !newSelected.publishers.checked;

          Object.values(ClassicPublisher).forEach(
            (value) =>
              (newSelected.publishers.specific[value] =
                newSelected.publishers.checked),
          );
        } else if (value === awardValue) {
          newSelected.awards.checked = !newSelected.awards.checked;

          Object.values(AmericanLiteraryAward).forEach(
            (value) =>
              (newSelected.awards.specific[value] = newSelected.awards.checked),
          );
        } else if (value === personalValue) {
          newSelected.personal = !newSelected.personal;
        } else if (Object.values(ClassicPublisher).includes(value as any)) {
          const publisherValue = value as ClassicPublisher;
          newSelected.publishers.specific[publisherValue] =
            !newSelected.publishers.specific[publisherValue];
        } else if (
          Object.values(AmericanLiteraryAward).includes(value as any)
        ) {
          const awardValue = value as AmericanLiteraryAward;
          newSelected.awards.specific[awardValue] =
            !newSelected.awards.specific[awardValue];
        }

        onSelectedChange(newSelected);
      }}
    />
  );
}

export function convertValuesToFilters(
  values: InclusionReasonValues,
): Array<InclusionReasonFilter> {
  const result: Array<InclusionReasonFilter> = [];

  if (values.awards.checked) {
    Object.entries(values.awards.specific)
      .filter(([, value]) => value)
      .forEach(([key]) =>
        result.push({
          type: 'award',
          award: key as AmericanLiteraryAward,
        }),
      );
  }

  if (values.personal) {
    result.push('Because I said so; source: me');
  }

  if (values.poetLaureates) {
    result.push('Poet Laureate');
  }

  if (values.publishers.checked) {
    result.push({
      type: 'Published as classical literature',
      publishers: Object.entries(values.publishers.specific)
        .filter(([, value]) => value)
        .map(([key]) => key as ClassicPublisher),
    });
  }

  return result;
}

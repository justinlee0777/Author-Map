import { JSX, ReactNode, useState } from 'react';
import { MdArrowDropDown, MdArrowDropUp } from 'react-icons/md';

interface Props {
  initialOpened: boolean;

  children?: ReactNode;
  header?: ReactNode;
}

export function CollapsibleSection({
  initialOpened,
  children,
  header,
}: Props): JSX.Element {
  const [opened, setOpened] = useState(initialOpened);

  return (
    <div className="collapsibleSection">
      <button
        className="button collapsibleSectionHeader"
        onClick={() => setOpened((value) => !value)}
      >
        {header}

        <span className="collapsibleSectionHeaderIcon">
          {opened ? <MdArrowDropUp /> : <MdArrowDropDown />}
        </span>
      </button>

      {opened && children}
    </div>
  );
}

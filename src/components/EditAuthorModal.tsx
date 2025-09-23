import styles from './EditAuthorModal.module.css';

import { JSX, useMemo, useState } from 'react';

import { Formik } from 'formik';
import Modal from 'react-modal';
import cloneDeep from 'lodash-es/cloneDeep';

import { Author } from '../models';

interface Props {
  appElement: HTMLElement;
  opened: boolean;

  onSubmit?: (author: Author) => void;
  initialAuthor?: Author;
}

export function EditAuthorModal({
  appElement,
  opened,
  onSubmit,
  initialAuthor,
}: Props): JSX.Element {
  const [editedAuthor, setEditedAuthor] = useState<Partial<Author>>(() => {
    return cloneDeep(initialAuthor) ?? {};
  });

  const [
    portraitId,
    authorFirstNameId,
    authorLastNameId,
    authorFullNameId,
    birthDateId,
    deathDateId,
    referenceUrlId,
  ] = useMemo(
    () => [
      'portraitInput',
      'authorFirstNameInput',
      'authorLastNameInput',
      'authorFullNameInput',
      'birthDateInput',
      'deathDateInput',
      'referenceUrlInput',
    ],
    [],
  );

  return (
    <Modal isOpen={opened} appElement={appElement}>
      <Formik<Partial<Author>>
        initialValues={editedAuthor}
        onSubmit={(finalAuthor) => {
          console.log('submitted', finalAuthor);
        }}
      >
        {({ handleSubmit, values, handleChange }) => {
          return (
            <form className={styles.editAuthorForm} onSubmit={handleSubmit}>
              <div className={styles.portraitRow}>
                <img src={values.portrait?.src} />
                <div className={styles.portraitDetails}>
                  <label htmlFor={portraitId}>Portrait</label>
                  <input
                    id={portraitId}
                    type="text"
                    name="portrait.src"
                    value={values.portrait?.src}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <label htmlFor={authorFirstNameId}>Author first name</label>
              <input
                id={authorFirstNameId}
                type="text"
                name="authorFirstName"
                value={values.authorFirstName}
                required
                onChange={handleChange}
              />

              <label htmlFor={authorLastNameId}>Author last name</label>
              <input
                id={authorLastNameId}
                type="text"
                name="authorLastName"
                value={values.authorLastName}
                required
                onChange={handleChange}
              />

              <label htmlFor={authorFullNameId}>Author full name</label>
              <input
                id={authorFullNameId}
                type="text"
                name="authorFullName"
                value={values.authorFullName}
                onChange={handleChange}
              />

              <label htmlFor={birthDateId}>Birth date</label>
              <input
                id={birthDateId}
                type="date"
                name="birthDate"
                required
                value={values.birthDate}
                onChange={handleChange}
              />

              <label htmlFor={deathDateId}>Death date</label>
              <input
                id={deathDateId}
                type="date"
                name="deathDate"
                value={values.deathDate}
                onChange={handleChange}
              />

              <label htmlFor={referenceUrlId}>Reference URL</label>
              <input
                id={referenceUrlId}
                type="text"
                name="link"
                value={values.link}
                onChange={handleChange}
              />

              <button type="submit">Submit</button>
            </form>
          );
        }}
      </Formik>
    </Modal>
  );
}

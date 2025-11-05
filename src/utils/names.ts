import { Author } from '../models';

export function getAuthorName(author: Author): string {
  return (
    author.authorDisplayName ||
    author.authorFullName ||
    `${author.authorFirstName} ${author.authorLastName}`
  );
}

import { AuthorLocation } from '../models';

export function getAddress(location: AuthorLocation): string {
  return [location.address, location.state].filter(Boolean).join(', ');
}

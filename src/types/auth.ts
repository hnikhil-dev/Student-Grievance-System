import { UserRole } from '../constants/roles';
import { ProfileRow } from './database';

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: UserRole;
  profile: ProfileRow;
}

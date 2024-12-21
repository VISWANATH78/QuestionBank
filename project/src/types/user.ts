export type UserRole = 'ADMIN' | 'VIEWER' | 'SELECTOR' | 'IMPORTER';

export interface User {
  email: string;
  username: string;
  role: UserRole;
  first_name?: string;
  last_name?: string;
}

export const USERS: User[] = [
  {
    email: 'admin@example.com',
    username: 'admin',
    role: 'ADMIN',
    first_name: 'Admin',
    last_name: 'User'
  },
  {
    email: 'viewer@example.com',
    username: 'viewer',
    role: 'VIEWER',
    first_name: 'Viewer',
    last_name: 'User'
  },
  {
    email: 'selector@example.com',
    username: 'selector',
    role: 'SELECTOR',
    first_name: 'Selector',
    last_name: 'User'
  },
  {
    email: 'importer@example.com',
    username: 'importer',
    role: 'IMPORTER',
    first_name: 'Importer',
    last_name: 'User'
  }
];
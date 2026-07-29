import { Client } from './client.model';

export interface Contact {
  id?: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  client: Client | { id: number };
}

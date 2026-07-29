import { Client } from './client.model';

export type StatutOpportunite = 'PROSPECTION' | 'NEGOCIATION' | 'GAGNEE' | 'PERDUE';

export interface Opportunite {
  id?: number;
  titre: string;
  montant: number;
  statut: StatutOpportunite;
  client: Client | { id: number };
}

import { Routes } from '@angular/router';
import { ClientList } from './components/client-list/client-list';
import { ClientForm } from './components/client-form/client-form';
import { ContactList } from './components/contact-list/contact-list';
import { ContactForm } from './components/contact-form/contact-form';
import { OpportuniteList } from './components/opportunite-list/opportunite-list';
import { OpportuniteForm } from './components/opportunite-form/opportunite-form';

export const routes: Routes = [
  { path: '', redirectTo: 'clients', pathMatch: 'full' },
  { path: 'clients', component: ClientList },
  { path: 'clients/new', component: ClientForm },
  { path: 'clients/:clientId/edit', component: ClientForm },
  { path: 'contacts', component: ContactList },
  { path: 'contacts/new', component: ContactForm },
  { path: 'contacts/:contactId/edit', component: ContactForm },
  { path: 'opportunites', component: OpportuniteList },
  { path: 'opportunites/new', component: OpportuniteForm },
  { path: 'opportunites/:opportuniteId/edit', component: OpportuniteForm },
];

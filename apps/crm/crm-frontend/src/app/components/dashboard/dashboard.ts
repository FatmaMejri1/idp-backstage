import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { forkJoin } from 'rxjs';
import { ClientService } from '../../services/client.service';
import { ContactService } from '../../services/contact.service';
import { OpportuniteService } from '../../services/opportunite.service';
import { Opportunite } from '../../models/opportunite.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit {
  loading = true;
  errorMessage = '';

  totalClients = 0;
  totalContacts = 0;
  totalOpportunites = 0;
  montantTotal = 0;
  opportunitesGagnees = 0;
  opportunitesEnCours = 0;

  constructor(
    private clientService: ClientService,
    private contactService: ContactService,
    private opportuniteService: OpportuniteService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    forkJoin({
      clients: this.clientService.getAllClients(),
      contacts: this.contactService.getAllContacts(),
      opportunites: this.opportuniteService.getAllOpportunites()
    }).subscribe({
      next: ({ clients, contacts, opportunites }) => {
        this.totalClients = clients.length;
        this.totalContacts = contacts.length;
        this.totalOpportunites = opportunites.length;

        this.montantTotal = opportunites.reduce(
          (sum: number, o: Opportunite) => sum + Number(o.montant), 0
        );

        this.opportunitesGagnees = opportunites.filter(
          (o: Opportunite) => o.statut === 'GAGNEE'
        ).length;

        this.opportunitesEnCours = opportunites.filter(
          (o: Opportunite) => o.statut === 'PROSPECTION' || o.statut === 'NEGOCIATION'
        ).length;

        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.errorMessage = 'Erreur lors du chargement du tableau de bord';
        this.loading = false;
        this.cdr.detectChanges();
        console.error(err);
      }
    });
  }
}

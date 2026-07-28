import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Client } from '../../models/client.model';
import { ClientService } from '../../services/client.service';

@Component({
  selector: 'app-client-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './client-list.html',
  styleUrl: './client-list.css'
})
export class ClientList implements OnInit {
  clients: Client[] = [];
  loading = true;
  errorMessage = '';

  constructor(private clientService: ClientService) {}

  ngOnInit(): void {
    this.clientService.getAllClients().subscribe({
      next: (data) => {
        this.clients = data;
        this.loading = false;
      },
      error: (err) => {
        this.errorMessage = 'Erreur lors du chargement des clients';
        this.loading = false;
        console.error(err);
      }
    });
  }

  deleteClient(id: number | undefined): void {
    if (id === undefined) return;
    if (!confirm('Supprimer ce client ?')) return;

    this.clientService.deleteClient(id).subscribe({
      next: () => {
        this.clients = this.clients.filter(c => c.id !== id);
      },
      error: (err) => console.error(err)
    });
  }
}

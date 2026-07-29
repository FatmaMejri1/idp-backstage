import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Opportunite } from '../../models/opportunite.model';
import { OpportuniteService } from '../../services/opportunite.service';

@Component({
  selector: 'app-opportunite-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './opportunite-list.html',
  styleUrl: './opportunite-list.css'
})
export class OpportuniteList implements OnInit {
  opportunites: Opportunite[] = [];
  loading = true;
  errorMessage = '';

  constructor(
    private opportuniteService: OpportuniteService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.opportuniteService.getAllOpportunites().subscribe({
      next: (data) => {
        this.opportunites = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.errorMessage = 'Erreur lors du chargement des opportunités';
        this.loading = false;
        this.cdr.detectChanges();
        console.error(err);
      }
    });
  }

  deleteOpportunite(id: number | undefined): void {
    if (id === undefined) return;
    if (!confirm('Supprimer cette opportunité ?')) return;

    this.opportuniteService.deleteOpportunite(id).subscribe({
      next: () => {
        this.opportunites = this.opportunites.filter(o => o.id !== id);
        this.cdr.detectChanges();
      },
      error: (err) => console.error(err)
    });
  }
}

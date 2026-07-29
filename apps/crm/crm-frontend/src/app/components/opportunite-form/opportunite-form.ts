import { Component, Input, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { OpportuniteService } from '../../services/opportunite.service';
import { ClientService } from '../../services/client.service';
import { Opportunite, StatutOpportunite } from '../../models/opportunite.model';
import { Client } from '../../models/client.model';

@Component({
  selector: 'app-opportunite-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './opportunite-form.html',
  styleUrl: './opportunite-form.css'
})
export class OpportuniteForm implements OnInit {
  @Input() opportuniteId?: number;
  opportuniteForm!: FormGroup;
  isEditMode = false;
  clients: Client[] = [];
  statuts: StatutOpportunite[] = ['PROSPECTION', 'NEGOCIATION', 'GAGNEE', 'PERDUE'];

  constructor(
    private fb: FormBuilder,
    private opportuniteService: OpportuniteService,
    private clientService: ClientService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.opportuniteForm = this.fb.group({
      titre: ['', [Validators.required]],
      montant: [null, [Validators.required, Validators.min(0)]],
      statut: ['PROSPECTION', [Validators.required]],
      clientId: [null, [Validators.required]]
    });

    this.clientService.getAllClients().subscribe({
      next: (data) => {
        this.clients = data;
        this.cdr.detectChanges();
      },
      error: (err) => console.error(err)
    });

    if (this.opportuniteId) {
      this.isEditMode = true;
      this.opportuniteService.getOpportuniteById(this.opportuniteId).subscribe((opp) => {
        this.opportuniteForm.patchValue({
          titre: opp.titre,
          montant: opp.montant,
          statut: opp.statut,
          clientId: opp.client?.id
        });
        this.cdr.detectChanges();
      });
    }
  }

  onSubmit(): void {
    if (this.opportuniteForm.invalid) {
      this.opportuniteForm.markAllAsTouched();
      return;
    }

    const formValue = this.opportuniteForm.value;
    const oppData: Opportunite = {
      titre: formValue.titre,
      montant: formValue.montant,
      statut: formValue.statut,
      client: { id: formValue.clientId }
    };

    if (this.isEditMode && this.opportuniteId) {
      this.opportuniteService.updateOpportunite(this.opportuniteId, oppData).subscribe(() => {
        this.router.navigate(['/opportunites']);
      });
    } else {
      this.opportuniteService.createOpportunite(oppData).subscribe(() => {
        this.router.navigate(['/opportunites']);
      });
    }
  }
}

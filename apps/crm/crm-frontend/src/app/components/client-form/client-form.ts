import { Component, Input, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ClientService } from '../../services/client.service';
import { Client } from '../../models/client.model';

@Component({
  selector: 'app-client-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './client-form.html',
  styleUrl: './client-form.css'
})
export class ClientForm implements OnInit {
  @Input() clientId?: number;
  clientForm!: FormGroup;
  isEditMode = false;

  constructor(
    private fb: FormBuilder,
    private clientService: ClientService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.clientForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      phone: ['', [Validators.required]],
      company: ['', [Validators.required]]
    });

    if (this.clientId) {
      this.isEditMode = true;
      this.clientService.getClientById(this.clientId).subscribe((client) => {
        this.clientForm.patchValue(client);
        this.cdr.detectChanges();
      });
    }
  }

  onSubmit(): void {
    if (this.clientForm.invalid) {
      this.clientForm.markAllAsTouched();
      return;
    }

    const clientData: Client = this.clientForm.value;

    if (this.isEditMode && this.clientId) {
      this.clientService.updateClient(this.clientId, clientData).subscribe(() => {
        this.router.navigate(['/clients']);
      });
    } else {
      this.clientService.createClient(clientData).subscribe(() => {
        this.router.navigate(['/clients']);
      });
    }
  }
}

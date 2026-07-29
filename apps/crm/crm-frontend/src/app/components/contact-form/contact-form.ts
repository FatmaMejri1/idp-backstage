import { Component, Input, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ContactService } from '../../services/contact.service';
import { ClientService } from '../../services/client.service';
import { Contact } from '../../models/contact.model';
import { Client } from '../../models/client.model';

@Component({
  selector: 'app-contact-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './contact-form.html',
  styleUrl: './contact-form.css'
})
export class ContactForm implements OnInit {
  @Input() contactId?: number;
  contactForm!: FormGroup;
  isEditMode = false;
  clients: Client[] = [];

  constructor(
    private fb: FormBuilder,
    private contactService: ContactService,
    private clientService: ClientService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.contactForm = this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required]],
      clientId: [null, [Validators.required]]
    });

    this.clientService.getAllClients().subscribe({
      next: (data) => {
        this.clients = data;
        this.cdr.detectChanges();
      },
      error: (err) => console.error(err)
    });

    if (this.contactId) {
      this.isEditMode = true;
      this.contactService.getContactById(this.contactId).subscribe((contact) => {
        this.contactForm.patchValue({
          firstName: contact.firstName,
          lastName: contact.lastName,
          email: contact.email,
          phone: contact.phone,
          clientId: contact.client?.id
        });
        this.cdr.detectChanges();
      });
    }
  }

  onSubmit(): void {
    if (this.contactForm.invalid) {
      this.contactForm.markAllAsTouched();
      return;
    }

    const formValue = this.contactForm.value;
    const contactData: Contact = {
      firstName: formValue.firstName,
      lastName: formValue.lastName,
      email: formValue.email,
      phone: formValue.phone,
      client: { id: formValue.clientId }
    };

    if (this.isEditMode && this.contactId) {
      this.contactService.updateContact(this.contactId, contactData).subscribe(() => {
        this.router.navigate(['/contacts']);
      });
    } else {
      this.contactService.createContact(contactData).subscribe(() => {
        this.router.navigate(['/contacts']);
      });
    }
  }
}

import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Contact } from '../../models/contact.model';
import { ContactService } from '../../services/contact.service';

@Component({
  selector: 'app-contact-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './contact-list.html',
  styleUrl: './contact-list.css'
})
export class ContactList implements OnInit {
  contacts: Contact[] = [];
  loading = true;
  errorMessage = '';

  constructor(
    private contactService: ContactService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.contactService.getAllContacts().subscribe({
      next: (data) => {
        this.contacts = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.errorMessage = 'Erreur lors du chargement des contacts';
        this.loading = false;
        this.cdr.detectChanges();
        console.error(err);
      }
    });
  }

  deleteContact(id: number | undefined): void {
    if (id === undefined) return;
    if (!confirm('Supprimer ce contact ?')) return;

    this.contactService.deleteContact(id).subscribe({
      next: () => {
        this.contacts = this.contacts.filter(c => c.id !== id);
        this.cdr.detectChanges();
      },
      error: (err) => console.error(err)
    });
  }
}

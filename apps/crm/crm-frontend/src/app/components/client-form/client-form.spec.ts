import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { ClientForm } from './client-form';

describe('ClientForm', () => {
  let component: ClientForm;
  let fixture: ComponentFixture<ClientForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClientForm],
      providers: [provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(ClientForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { OpportuniteForm } from './opportunite-form';

describe('OpportuniteForm', () => {
  let component: OpportuniteForm;
  let fixture: ComponentFixture<OpportuniteForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OpportuniteForm],
      providers: [provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(OpportuniteForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

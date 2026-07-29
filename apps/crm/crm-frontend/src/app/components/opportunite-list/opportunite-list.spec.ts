import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OpportuniteList } from './opportunite-list';

describe('OpportuniteList', () => {
  let component: OpportuniteList;
  let fixture: ComponentFixture<OpportuniteList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OpportuniteList],
    }).compileComponents();

    fixture = TestBed.createComponent(OpportuniteList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

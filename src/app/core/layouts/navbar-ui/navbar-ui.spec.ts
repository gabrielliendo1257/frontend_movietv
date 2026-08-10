import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NavbarUi } from './navbar-ui';

describe('NavbarUi', () => {
  let component: NavbarUi;
  let fixture: ComponentFixture<NavbarUi>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NavbarUi]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NavbarUi);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

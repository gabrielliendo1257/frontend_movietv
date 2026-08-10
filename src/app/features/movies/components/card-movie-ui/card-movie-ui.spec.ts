import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardMovieUi } from './card-movie-ui';

describe('CardMovieUi', () => {
  let component: CardMovieUi;
  let fixture: ComponentFixture<CardMovieUi>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardMovieUi]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CardMovieUi);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

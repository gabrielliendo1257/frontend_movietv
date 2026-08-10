import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardMovieSkeleton } from './card-movie-skeleton';

describe('CardMovieSkeleton', () => {
  let component: CardMovieSkeleton;
  let fixture: ComponentFixture<CardMovieSkeleton>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardMovieSkeleton]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CardMovieSkeleton);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

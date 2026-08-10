import {Component, input} from '@angular/core';

@Component({
  selector: 'app-card-movie-ui',
  imports: [],
  templateUrl: './card-movie-ui.html',
  styleUrl: './card-movie-ui.css',
})
export class CardMovieUi {
    posterUrl = input<string>('');
    title = input.required<string>();
    subtitle = input<string>('');
}

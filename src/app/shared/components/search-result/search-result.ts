import { Component } from '@angular/core';

@Component({
  selector: 'app-search-result',
  imports: [],
  templateUrl: './search-result.html',
  styleUrl: './search-result.css',
})
export class SearchResult {

    state: 'idle' | 'loading' | 'success' | 'empty' = 'idle';

    movies: any[] = [];

    searchMovies(query: string) {
        if (!query.trim()) return;

        this.state = 'loading';

        // 🔥 Simulamos API
        setTimeout(() => {
            // DEMO: vamos a simular resultados
            const mock = [
                { title: 'Star Wars', poster: 'assets/posters/sw1.jpg' },
                { title: 'The Empire Strikes Back', poster: 'assets/posters/sw5.jpg' }
            ];

            const found = mock.filter(m =>
                m.title.toLowerCase().includes(query.toLowerCase())
            );

            if (found.length > 0) {
                this.movies = found;
                this.state = 'success';
            } else {
                this.movies = [];
                this.state = 'empty';
            }

        }, 1500);
    }
}

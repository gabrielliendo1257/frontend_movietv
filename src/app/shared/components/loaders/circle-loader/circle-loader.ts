import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-circle-loader',
    imports: [
    ],
  templateUrl: './circle-loader.html',
  styleUrl: './circle-loader.css',
})
export class CircleLoader<T> implements OnInit {

    state: 'idle' | 'loading' | 'success' | 'empty' = 'idle';

    @Input() messageIdle = 'Search for a movie...';
    @Input() messageLoading = 'Searching movies...';
    @Input() messageEmpty = 'No movies found.';

    ngOnInit() {
        console.log('Current State: ', this.state);
    }

    async initLoader(query: string, task: () => Promise<T>) {
        this.state = 'loading';
        console.log('Data query: ', query);
        return task()
            .then(result => {
                console.log("Result loader: ",result);
                this.state = 'success';
                return result;
            })
            .catch(err => {
                this.state = 'empty'
                console.log("Result loader: ",err);
            })
    }
}

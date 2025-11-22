import {Component, EventEmitter, Output} from '@angular/core';
import {FormsModule} from '@angular/forms';

@Component({
    selector: 'app-input-search',
    imports: [
        FormsModule
    ],
    templateUrl: './input-search.html',
    styleUrl: './input-search.css',
})
export class InputSearch {

    querySearch: string = '';

    @Output() queryChange = new EventEmitter<string>();

    onSearchChange() {
        this.queryChange.emit(this.querySearch);
    }

    clearSearch() {
        this.querySearch = '';
        this.queryChange.emit(this.querySearch);
    }

    onEnter() {
        this.queryChange.emit(this.querySearch);

        this.querySearch = '';
    }
}

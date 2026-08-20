import { Component, model, output } from '@angular/core';

export type AddMediaSource = 'upload' | 'local' | 's3';

@Component({
    selector: 'app-add-media-modal',
    imports: [],
    templateUrl: './add-media-modal.html',
    styleUrl: './add-media-modal.css',
})
export class AddMediaModal {
    readonly isOpen = model(false);
    readonly sourceSelected = output<AddMediaSource>();

    choose(source: AddMediaSource): void {
        this.isOpen.set(false);
        this.sourceSelected.emit(source);
    }

    close(): void {
        this.isOpen.set(false);
    }
}

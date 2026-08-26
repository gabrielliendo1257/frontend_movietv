import { Component, model, output } from '@angular/core';
import { ScrollLock } from '@shared/scroll-lock';

export type AddMediaSource = 'upload' | 'local' | 's3';

@Component({
    selector: 'app-add-media-modal',
    imports: [ ScrollLock,],
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

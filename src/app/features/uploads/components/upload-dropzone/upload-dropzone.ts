import {Component, EventEmitter, Output, signal} from '@angular/core';

@Component({
    selector: 'app-upload-dropzone',
    imports: [],
    templateUrl: './upload-dropzone.html',
    styleUrl: './upload-dropzone.css',
})
export class UploadDropzone {
    @Output() fileDropped = new EventEmitter<File>();

    readonly isDragOver = signal(false);
    readonly file = signal<File | null>(null);

    onDrop(event: DragEvent) {
        event.preventDefault();
        this.isDragOver.set(false);

        if (event.dataTransfer?.files.length) {
            let fileInputDropped: File = event.dataTransfer.files[0];
            console.log("Drop file: ", fileInputDropped);

            this.file.set(fileInputDropped);
            this.fileDropped.emit(fileInputDropped);
        }
    }

    onDragOver(event: DragEvent): void {
        event.preventDefault();
        this.isDragOver.set(true);
    }

    onDragLeave(event: DragEvent): void {
        event.preventDefault();
        this.isDragOver.set(false);
    }

    onFileSelected(event: Event): void {
        event.preventDefault();
        const input = event.target as HTMLInputElement;
        const selectedFile = input.files?.[0];

        if (selectedFile) {
            this.file.set(selectedFile);
            this.fileDropped.emit(selectedFile);
        }
    }
}

import {Component, ElementRef, EventEmitter, Input, Output, ViewChild} from '@angular/core';

@Component({
    selector: 'app-input-file',
    imports: [],
    templateUrl: './input-file.html',
    styleUrl: './input-file.css',
})
export class InputFile {

    @Output() filenameEmit = new EventEmitter<File>();

    file: File | null = null;
    isDragOver = false;

    @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

    onFileSelected(event: Event) {
        const input = event.target as HTMLInputElement;

        if (!input.files || input.files.length === 0) return;

        const file: File = input.files[0];

        // Todo OK ✔
        let fileResult = this.validationFile(file);

        if (fileResult !== undefined) {
            this.file = fileResult;
            console.log("Emmitted file: ", this.file);
            this.filenameEmit.emit(this.file);
        }
    }

    onDragOver(event: DragEvent) {
        event.preventDefault();
        this.isDragOver = true;
    }

    onDragLeave(event: DragEvent) {
        event.preventDefault();
        this.isDragOver = false;
    }

    onFileDrop(event: DragEvent) {
        event.preventDefault();
        this.isDragOver = false;

        if (event.dataTransfer?.files.length) {
            let file: File = event.dataTransfer.files[0];
            console.log("File Dropped: ", file);

            let fileResult = this.validationFile(file)
            console.log("File result: ", fileResult);

            if (fileResult !== undefined) {
                this.file = fileResult;
                this.filenameEmit.emit(this.file);
            }
        }
    }

    private validationFile(file: File): File | undefined {
        // Validar tipo MIME
        if (file.type !== 'video/mp4') {
            alert('Solo se permiten archivos MP4');
            return;
        }

        // Validar extensión
        const ext = file.name.split('.').pop()?.toLowerCase();
        if (ext !== 'mp4') {
            alert('Extensión inválida. Debe ser .mp4');
            return;
        }

        console.log("Filename accept: ", file.name);

        return file;
    }

    clear() {
        this.file = null;
        this.fileInput.nativeElement.value = '';
    }
}

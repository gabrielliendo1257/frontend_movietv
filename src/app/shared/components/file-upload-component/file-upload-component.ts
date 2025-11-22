import {Component, Input} from '@angular/core';
import {Movie} from '@features/movies/models/movie-models';

@Component({
  selector: 'app-file-upload-component',
  imports: [],
  templateUrl: './file-upload-component.html',
  styleUrl: './file-upload-component.css',
})
export class FileUploadComponent {

    @Input() state!: UploadState;
    @Input() movie!: Movie;
}

export type UploadState = 'uploading' | 'complete' | 'error'

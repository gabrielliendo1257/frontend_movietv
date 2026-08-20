import { Component, inject, signal } from '@angular/core';
import { UploadFacade } from '@features/uploads/services/upload-facade';

interface JobEntry {
    id: string;
    text: string;
    state: 'RUNNING' | 'COMPLETED' | 'FAILED';
    progress?: number;
}

@Component({
    selector: 'app-activity-page',
    imports: [],
    templateUrl: './activity-page.html',
    styleUrl: './activity-page.css',
})
export class ActivityPage {
    private readonly uploadFacade = inject(UploadFacade);

    readonly uploads = this.uploadFacade.tasks;

    readonly mockJobs = signal<JobEntry[]>([
        { id: 'j1', text: 'Library scan', state: 'COMPLETED' },
        { id: 'j2', text: 'TMDB enrichment', state: 'FAILED' },
        { id: 'j3', text: 'Identifying 12 assets', state: 'RUNNING', progress: 68 },
    ]);

    uploadLabel(state: string): string {
        if (state === 'completed') return 'COMPLETED';
        if (state === 'error') return 'FAILED';
        if (state === 'cancelled') return 'CANCELLED';
        return 'RUNNING';
    }
}

import { Component, computed, input } from '@angular/core';
import { CatalogJob } from '@features/catalog/models/catalog';

/** Barra de progreso reutilizable para trabajos con avance (done/total/failed). */
@Component({
    selector: 'app-job-progress',
    imports: [],
    templateUrl: './job-progress.html',
    styleUrl: './job-progress.css',
})
export class JobProgress {
    readonly job = input.required<CatalogJob>();

    readonly percent = computed(() => {
        const job = this.job();
        if (!job.total) return 0;
        return Math.round(((job.done + job.failed) / job.total) * 100);
    });

    readonly isRunning = computed(() => this.job().status === 'RUNNING');
}

import { Component, HostListener, inject, model } from '@angular/core';
import { ACTIVE_UPLOAD_STATES, UploadTask, UploadState } from '@features/uploads/models/upload-task';
import { UploadFacade } from '@features/uploads/services/upload-facade';

const STATE_LABELS: Record<UploadState, string> = {
    starting: 'Preparing',
    uploading: 'Uploading',
    verifying: 'Verifying',
    completed: 'Completed',
    failed: 'Failed',
    cancelled: 'Cancelled',
};

@Component({
    selector: 'app-upload-drawer',
    imports: [],
    templateUrl: './upload-drawer.html',
    styleUrl: './upload-drawer.css',
})
export class UploadDrawer {
    readonly facade = inject(UploadFacade);

    readonly isOpen = model(false);

    @HostListener('document:keydown.escape')
    onEscape(): void {
        this.isOpen.set(false);
    }

    close(): void {
        this.isOpen.set(false);
    }

    isActive(state: UploadState): boolean {
        return ACTIVE_UPLOAD_STATES.has(state);
    }

    stateLabel(state: UploadState): string {
        return STATE_LABELS[state];
    }

    retry(task: UploadTask): void {
        this.facade.retry(task.uploadId);
    }

    cancel(task: UploadTask): void {
        this.facade.cancel(task.uploadId);
    }

    remove(task: UploadTask): void {
        this.facade.remove(task.uploadId);
    }
}

import { Component, inject } from '@angular/core';
import { ToastService } from '@core/services/toast.service';

@Component({
    selector: 'app-toast-container',
    imports: [],
    templateUrl: './toast-container.html',
    styleUrl: './toast-container.css',
})
export class ToastContainer {
    private readonly toastService = inject(ToastService);

    readonly toasts = this.toastService.activeToasts;

    dismiss(id: number): void {
        this.toastService.dismiss(id);
    }
}
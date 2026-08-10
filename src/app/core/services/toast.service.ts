import { Injectable, signal } from '@angular/core';
import { Toast, ToastType } from '@core/models/toast';

@Injectable({
    providedIn: 'root',
})
export class ToastService {
    private readonly toasts = signal<Toast[]>([]);
    private readonly durationMs = 4000;
    private nextId = 0;

    readonly activeToasts = this.toasts.asReadonly();

    success(message: string): void {
        this.push('success', message);
    }

    error(message: string): void {
        this.push('error', message);
    }

    info(message: string): void {
        this.push('info', message);
    }

    warning(message: string): void {
        this.push('warning', message);
    }

    dismiss(id: number): void {
        this.toasts.update((current) => current.filter((toast) => toast.id !== id));
    }

    private push(type: ToastType, message: string): void {
        const toast: Toast = { id: ++this.nextId, type, message };

        this.toasts.update((current) => [...current, toast]);
        setTimeout(() => this.dismiss(toast.id), this.durationMs);
    }
}
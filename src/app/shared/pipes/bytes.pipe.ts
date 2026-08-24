import { Pipe, PipeTransform } from '@angular/core';

const KB = 1024;
const MB = 1024 * KB;
const GB = 1024 * MB;

/** Formatea bytes en una unidad legible: {{ value | bytes }} → "12.3 MB". */
@Pipe({
    name: 'bytes',
})
export class BytesPipe implements PipeTransform {
    transform(bytes: number | null | undefined): string {
        if (bytes == null || Number.isNaN(bytes)) return '—';

        if (bytes >= GB) return `${(bytes / GB).toFixed(2)} GB`;
        if (bytes >= MB) return `${(bytes / MB).toFixed(1)} MB`;
        if (bytes >= KB) return `${Math.round(bytes / KB)} KB`;
        return `${bytes} B`;
    }
}

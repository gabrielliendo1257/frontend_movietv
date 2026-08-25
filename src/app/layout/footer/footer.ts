import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

/** Pie del shell: identidad mínima y destinos globales. */
@Component({
    selector: 'app-footer',
    imports: [RouterLink],
    templateUrl: './footer.html',
    styleUrl: './footer.css',
})
export class Footer {
    readonly year = new Date().getFullYear();
}

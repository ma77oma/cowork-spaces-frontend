import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ErrorPanelComponent } from './shared/ui/error-panel.component';
import { UiFeedbackService } from './core/services/ui-feedback.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ErrorPanelComponent],
  template: `
    @if (feedback.message(); as message) {
      <div class="global-feedback">
        <app-error-panel
          [message]="message.text"
          [variant]="message.kind"
          [dismissible]="true"
          (closed)="feedback.clear()"
        />
      </div>
    }

    <router-outlet />
  `,
  styles: [
    `
      :host {
        display: block;
      }

      .global-feedback {
        position: fixed;
        top: 1rem;
        right: 1rem;
        z-index: 1200;
        width: min(28rem, calc(100vw - 2rem));
      }
    `
  ]
})
export class AppComponent {
  protected readonly feedback = inject(UiFeedbackService);
}

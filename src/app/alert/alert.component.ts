import {Component, inject} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {NaturalAlertService} from '@ecodev/natural';

@Component({
    selector: 'app-panels',
    imports: [MatButtonModule],
    templateUrl: './alert.component.html',
})
export class AlertComponent {
    private readonly alertService = inject(NaturalAlertService);

    public confirm(): void {
        this.alertService
            .confirm('Confirm example', 'Are you sure ?', 'Do it !')
            .subscribe(result => console.log('confirmation result:', result));
    }

    public error(): void {
        this.alertService.error('Something bad happened');
    }

    public info(): void {
        this.alertService.info('Useful information');
    }
}

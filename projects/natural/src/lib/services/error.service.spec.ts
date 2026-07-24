import {TestBed} from '@angular/core/testing';
import {ErrorService} from './error.service';
import {provideRouter} from '@angular/router';
import {NaturalAvatarComponent} from '@ecodev/natural';

describe('ErrorService', () => {
    let service: ErrorService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                provideRouter([
                    {
                        path: 'error',
                        component: NaturalAvatarComponent, // Fake component
                    },
                ]),
            ],
        });

        service = TestBed.inject(ErrorService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});

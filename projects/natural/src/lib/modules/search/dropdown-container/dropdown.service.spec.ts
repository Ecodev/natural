import {TestBed} from '@angular/core/testing';
import {NaturalDropdownService} from './dropdown.service';
import {testImports} from '../../../../../../../src/app/shared/testing/module';

describe('DropdownService', () => {
    let service: NaturalDropdownService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [...testImports],
        });
        service = TestBed.inject(NaturalDropdownService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});

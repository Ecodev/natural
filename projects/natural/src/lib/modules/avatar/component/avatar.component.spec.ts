import {ComponentFixture, TestBed} from '@angular/core/testing';
import {NaturalAvatarComponent} from './avatar.component';
import {AvatarService} from '../service/avatar.service';
import {By} from '@angular/platform-browser';
import {Gravatar} from '../sources/gravatar';

function delay(milliseconds: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, milliseconds));
}

describe('NaturalAvatarComponent', () => {
    let component: NaturalAvatarComponent;
    let fixture: ComponentFixture<NaturalAvatarComponent>;
    let avatarService: AvatarService;

    beforeEach(() => {
        fixture = TestBed.createComponent(NaturalAvatarComponent);
        component = fixture.componentInstance;
        avatarService = TestBed.inject(AvatarService);
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should display the initials of the given value', async () => {
        fixture.componentRef.setInput('initials', 'John Doe');

        fixture.detectChanges();

        // Time for the template to react to changes
        await delay(5);
        fixture.detectChanges();

        // const avatarTextEl = fixture.debugElement.query(By.css('.avatar-container > div'));
        const avatarTextEl = fixture.debugElement.query(By.css('.avatar-container > div'));
        expect(avatarTextEl.nativeElement.textContent.trim()).toBe('JD');
    });

    it('should display nothing at all if image fails, and initials is empty', () => {
        fixture.componentRef.setInput('image', 'https://totaly-non-existing-domain-with-404-image.com/impossible.jpg');
        fixture.componentRef.setInput('initials', '');

        // Simulate the image failing to load, because in our test the image will never
        // attempt to load because of the `loading="lazy"` attribute
        component.tryNextSource();

        fixture.detectChanges();

        const avatarTextEl = fixture.debugElement.query(By.css('.avatar-container'));
        expect(avatarTextEl.nativeElement.innerHTML).toBe('<!--container--><!--container-->');
    });

    it('should not try again failed sources', async () => {
        // Pretend that this avatar already failed before
        avatarService.markSourceAsFailed(new Gravatar('invalid@example.com'));

        fixture.componentRef.setInput('gravatar', 'invalid@example.com');
        fixture.componentRef.setInput('initials', 'John Doe');

        fixture.detectChanges();

        // Time for the template to react to changes
        await delay(5);
        fixture.detectChanges();

        const avatarTextEl = fixture.debugElement.query(By.css('.avatar-container > div'));
        expect(avatarTextEl.nativeElement.textContent.trim()).toBe('JD');
    });
});

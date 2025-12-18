import {ChangeDetectionStrategy, Component, DOCUMENT, effect, inject, model} from '@angular/core';
import {MatIcon} from '@angular/material/icon';
import {MatButton, MatFabButton, MatIconButton, MatMiniFabButton} from '@angular/material/button';
import {FormsModule} from '@angular/forms';
import {MatAutocomplete, MatAutocompleteTrigger, MatOption} from '@angular/material/autocomplete';
import {MatFormField, MatInput, MatLabel} from '@angular/material/input';
import {MatButtonToggle, MatButtonToggleGroup} from '@angular/material/button-toggle';
import {MatCheckbox} from '@angular/material/checkbox';
import {MatChip, MatChipSet} from '@angular/material/chips';
import {MatDivider, MatList, MatListItem} from '@angular/material/list';
import {
    MatExpansionPanel,
    MatExpansionPanelDescription,
    MatExpansionPanelHeader,
    MatExpansionPanelTitle,
} from '@angular/material/expansion';
import {MatSelect} from '@angular/material/select';
import {MatMenu, MatMenuItem, MatMenuTrigger} from '@angular/material/menu';
import {MatPaginator} from '@angular/material/paginator';
import {MatProgressBar} from '@angular/material/progress-bar';
import {MatProgressSpinner} from '@angular/material/progress-spinner';
import {MatRadioButton, MatRadioGroup} from '@angular/material/radio';
import {MatSlideToggle} from '@angular/material/slide-toggle';
import {MatSlider, MatSliderThumb} from '@angular/material/slider';
import {MatSort, MatSortHeader} from '@angular/material/sort';
import {MatTab, MatTabGroup} from '@angular/material/tabs';
import {MatToolbar} from '@angular/material/toolbar';

@Component({
    selector: 'app-material-fixes',
    imports: [
        FormsModule,
        MatAutocomplete,
        MatAutocompleteTrigger,
        MatButton,
        MatButtonToggle,
        MatButtonToggleGroup,
        MatCheckbox,
        MatChip,
        MatChipSet,
        MatDivider,
        MatExpansionPanel,
        MatExpansionPanelDescription,
        MatExpansionPanelHeader,
        MatExpansionPanelTitle,
        MatFabButton,
        MatFormField,
        MatIcon,
        MatIconButton,
        MatInput,
        MatLabel,
        MatList,
        MatListItem,
        MatMenu,
        MatMenuItem,
        MatMenuTrigger,
        MatMiniFabButton,
        MatOption,
        MatPaginator,
        MatProgressBar,
        MatProgressSpinner,
        MatRadioButton,
        MatRadioGroup,
        MatSelect,
        MatSlideToggle,
        MatSlider,
        MatSliderThumb,
        MatSort,
        MatSortHeader,
        MatTab,
        MatTabGroup,
        MatToolbar,
    ],
    templateUrl: './material-fixes.component.html',
    styleUrl: './material-fixes.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        '[class.showContainer]': 'showContainer',
        '[class.showTouchTarget]': 'showTouchTarget',
        '[class.showRipple]': 'showRipple',
        '[class.showElement]': 'showElement',
    },
})
export class MaterialFixesComponent {
    protected readonly document = inject(DOCUMENT);
    protected showContainer = false;
    protected showTouchTarget = false;
    protected showRipple = false;
    protected showElement = false;
    protected readonly applyFixes = model(true);
    protected readonly options = ['first', 'second', 'third'];

    public constructor() {
        const classList = this.document.documentElement.classList;
        const klass = 'disable-material-fixes';

        effect(() => {
            if (this.applyFixes()) {
                classList.remove(klass);
            } else {
                classList.add(klass);
            }
        });
    }
}

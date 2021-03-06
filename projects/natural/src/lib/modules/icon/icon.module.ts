import {CommonModule} from '@angular/common';
import {ModuleWithProviders, NgModule} from '@angular/core';
import {MatIconModule} from '@angular/material/icon';
import {IconsConfigService, NaturalIconComponent, NaturalIconsConfig} from './icon.component';

@NgModule({
    declarations: [NaturalIconComponent],
    imports: [CommonModule, MatIconModule],
    exports: [NaturalIconComponent],
})
export class NaturalIconModule {
    public static forRoot(config: NaturalIconsConfig): ModuleWithProviders<NaturalIconModule> {
        return {
            ngModule: NaturalIconModule,
            providers: [
                {
                    provide: IconsConfigService,
                    useValue: config,
                },
            ],
        };
    }
}

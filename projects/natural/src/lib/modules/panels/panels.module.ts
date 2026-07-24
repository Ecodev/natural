import type {Provider} from '@angular/core';
import type {NaturalPanelsHooksConfig} from './types';
import { PanelsHooksConfig} from './types';

export function providePanels(hooks: NaturalPanelsHooksConfig): Provider[] {
    return [
        {
            provide: PanelsHooksConfig,
            useValue: hooks,
        },
    ];
}

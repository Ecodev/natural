import {JsonPipe} from '@angular/common';
import {Component, input, ChangeDetectionStrategy} from '@angular/core';
import {type AbstractControl} from '@angular/forms';

@Component({
    selector: 'app-debug-control',
    imports: [JsonPipe],
    template: `<pre class="debug">
touched: {{ control().touched | json }}
dirty: {{ control().dirty | json }}
status: {{ control().status | json }}
errors: {{ control().errors | json }}
value: {{ control().value | json }}
</pre>`,
    changeDetection: ChangeDetectionStrategy.Eager,
})
export class DebugControlComponent {
    public readonly control = input.required<AbstractControl<unknown>>();
}

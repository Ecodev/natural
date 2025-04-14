import {JsonPipe} from '@angular/common';
import {Component, input} from '@angular/core';
import {AbstractControl} from '@angular/forms';

@Component({
    selector: 'app-debug-control',
    template: `<pre class="debug">
touched: {{ control().touched | json }}
dirty: {{ control().dirty | json }}
status: {{ control().status | json }}
errors: {{ control().errors | json }}
value: {{ control().value | json }}
</pre>`,
    imports: [JsonPipe],
})
export class DebugControlComponent {
    public readonly control = input.required<AbstractControl<unknown>>();
}

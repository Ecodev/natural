import {JsonPipe} from '@angular/common';
import {HttpClient} from '@angular/common/http';
import {Component, inject, OnInit} from '@angular/core';
import {FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatButton} from '@angular/material/button';
import {MatRipple} from '@angular/material/core';
import {MatDatepickerToggle} from '@angular/material/datepicker';
import {MatFormField, MatLabel, MatPrefix, MatSuffix} from '@angular/material/form-field';
import {MatIcon} from '@angular/material/icon';
import {MatInput} from '@angular/material/input';
import {MatMenu, MatMenuItem, MatMenuTrigger} from '@angular/material/menu';
import {Params, QueryParamsHandling, RouterLink, RouterOutlet} from '@angular/router';
import {NatPalette} from '@ecodev/natural';
import {NaturalHttpPrefixDirective} from '../../../projects/natural/src/lib/directives/http-prefix.directive';
import {NaturalIconDirective} from '../../../projects/natural/src/lib/modules/icon/icon.directive';
import {NaturalTableButtonComponent} from '../../../projects/natural/src/lib/modules/table-button/table-button.component';

type TableButtonConfiguration = {
    label?: string | null;
    icon?: string | null;
    href?: string | null;
    navigate: RouterLink['routerLink'];
    queryParams: Params;
    queryParamsHandling: QueryParamsHandling;
    fragment?: string | undefined;
    preserveFragment: boolean;
    color: NatPalette;
};

@Component({
    selector: 'app-other',
    imports: [
        JsonPipe,
        NaturalTableButtonComponent,
        MatFormField,
        MatLabel,
        MatPrefix,
        MatSuffix,
        MatInput,
        FormsModule,
        NaturalHttpPrefixDirective,
        ReactiveFormsModule,
        MatIcon,
        NaturalIconDirective,
        MatButton,
        MatMenu,
        MatMenuItem,
        MatMenuTrigger,
        MatDatepickerToggle,
        RouterLink,
        MatRipple,
        RouterOutlet,
    ],
    templateUrl: './other.component.html',
    styleUrl: './other.component.scss',
})
export class OtherComponent implements OnInit {
    private httpClient = inject(HttpClient);

    /**
     * Single control
     */
    public readonly httpPrefixControl = new FormControl('', [Validators.required]);
    public readonly configurations: TableButtonConfiguration[] = [
        {
            label: 'my label without any link',
            icon: undefined,
            href: undefined,
            navigate: [],
            queryParams: {},
            queryParamsHandling: '',
            fragment: undefined,
            preserveFragment: false,
            color: undefined,
        },
        {
            label: undefined,
            icon: 'home',
            href: undefined,
            navigate: [],
            queryParams: {},
            queryParamsHandling: '',
            fragment: undefined,
            preserveFragment: false,
            color: undefined,
        },
        {
            label: 'my label without any link',
            icon: 'home',
            href: undefined,
            navigate: [],
            queryParams: {},
            queryParamsHandling: '',
            fragment: undefined,
            preserveFragment: false,
            color: undefined,
        },
        {
            label: 'my label with undefined navigate',
            icon: 'home',
            href: undefined,
            navigate: undefined,
            queryParams: {},
            queryParamsHandling: '',
            fragment: undefined,
            preserveFragment: false,
            color: undefined,
        },
        {
            label: 'my label with routerLink',
            icon: undefined,
            href: undefined,
            navigate: ['/search'],
            queryParams: {},
            queryParamsHandling: '',
            fragment: undefined,
            preserveFragment: false,
            color: undefined,
        },
        {
            label: 'my label with href',
            icon: undefined,
            href: '/search',
            navigate: [],
            queryParams: {},
            queryParamsHandling: '',
            fragment: undefined,
            preserveFragment: false,
            color: undefined,
        },
        {
            label: 'my label with queryParams but no routerLink',
            icon: undefined,
            href: undefined,
            navigate: [],
            queryParams: {foo: 'bar'},
            queryParamsHandling: '',
            fragment: undefined,
            preserveFragment: false,
            color: undefined,
        },
        {
            label: 'my label with queryParams and routerLink',
            icon: 'home',
            href: undefined,
            navigate: ['/search'],
            queryParams: {foo: 'bar'},
            queryParamsHandling: '',
            fragment: undefined,
            preserveFragment: false,
            color: undefined,
        },
        {
            label: 'with colors',
            icon: 'home',
            href: undefined,
            navigate: ['/search'],
            queryParams: {foo: 'bar'},
            queryParamsHandling: '',
            fragment: undefined,
            preserveFragment: false,
            color: 'primary',
        },
    ];

    public readonly configurationsWithClick: TableButtonConfiguration[] = [
        {
            label: 'my label with click',
            icon: undefined,
            href: undefined,
            navigate: [],
            queryParams: {},
            queryParamsHandling: '',
            fragment: undefined,
            preserveFragment: false,
            color: undefined,
        },
        {
            label: undefined,
            icon: 'home',
            href: undefined,
            navigate: [],
            queryParams: {},
            queryParamsHandling: '',
            fragment: undefined,
            preserveFragment: false,
            color: undefined,
        },
        {
            label: 'my label with click',
            icon: undefined,
            href: undefined,
            navigate: [],
            queryParams: {},
            queryParamsHandling: '',
            fragment: undefined,
            preserveFragment: false,
            color: undefined,
        },
        {
            label: undefined,
            icon: 'home',
            href: undefined,
            navigate: [],
            queryParams: {},
            queryParamsHandling: '',
            fragment: undefined,
            preserveFragment: false,
            color: undefined,
        },
    ];

    /**
     * Form group
     */
    public readonly httpPrefixGroup = new FormGroup({
        prefix: new FormControl('', [Validators.required]),
    });

    public ngOnInit(): void {
        this.httpPrefixControl.valueChanges.subscribe(value => {
            console.log('httpPrefixControl.valueChanges', value);
        });
        this.httpPrefixGroup.valueChanges.subscribe(value => {
            console.log('httpPrefixGroup.valueChanges', value);
        });
    }

    public error(): void {
        throw Error("I'm a natural error");
    }

    public error2(): void {
        this.httpClient.get('https://doesnotexist.youpi').subscribe();
    }

    public error3(): void {
        fetch('https://doesnotexist.youpi').then();
    }

    public log($event: MouseEvent): void {
        console.log('clicked', $event);
    }
}

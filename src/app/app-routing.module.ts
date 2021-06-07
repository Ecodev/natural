import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {HomepageComponent} from './homepage.component';
import {OtherComponent} from './other.component';
import {MenuComponent} from './menu.component';

const routes: Routes = [
    {
        path: '',
        component: MenuComponent,
        children: [
            {
                path: '',
                component: HomepageComponent,
            },
            {
                path: 'other',
                component: OtherComponent,
                data: {
                    title: 'Other tools',
                },
            },
        ],
    },
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule],
})
export class AppRoutingModule {}

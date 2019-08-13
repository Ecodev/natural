import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NaturalPanelsComponent, NaturalPanelsUrlMatcher } from '@ecodev/natural';
import { HomeComponent } from './home/home.component';
import { HomepageComponent } from './homepage/homepage.component';
import { ListComponent } from './list/list.component';
import { panelsRoutes } from './panels-routing';
import { PanelsComponent } from './panels/panels.component';
import { SearchComponent } from './search/search.component';
import { SelectComponent } from './select/select.component';

const routes: Routes = [
    {
        path: '',
        component: HomeComponent,
        children: [
            {
                path: '',
                component: HomepageComponent,
            },
            {
                path: 'search',
                component: SearchComponent,
            },
            {
                path: 'select',
                component: SelectComponent,
            },
            {
                path: 'panels',
                component: PanelsComponent,
                children: [
                    {
                        matcher: NaturalPanelsUrlMatcher,
                        component: NaturalPanelsComponent,
                        data: {
                            panelRoutes: panelsRoutes,
                        },
                    },
                ],
            },
            {
                path: 'list',
                component: ListComponent,
                data: {
                    title: 'Listing of something',
                    contextColumns: ['id', 'name'],
                },
            },
            {
                path: 'nested',
                children: [
                    {
                        path: 'list',
                        component: ListComponent,
                        data: {
                            title: 'Listing of something else',
                            contextColumns: ['name', 'tralala'],
                        },
                    },
                ],
            },
        ],
    },
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule],
})
export class AppRoutingModule {
}

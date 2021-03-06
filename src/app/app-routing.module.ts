import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {
    fallbackIfNoOpenedPanels,
    NaturalDialogTriggerComponent,
    NaturalDialogTriggerRoutingData,
    NaturalPanelsComponent,
    naturalPanelsUrlMatcher,
} from '@ecodev/natural';
import {AnyResolver} from '../../projects/natural/src/lib/testing/any.resolver';
import {EditableListComponent} from './editable-list/editable-list.component';
import {HierarchicComponent} from './hierarchic/hierarchic.component';
import {HomeComponent} from './home/home.component';
import {HomepageComponent} from './homepage/homepage.component';
import {ListComponent} from './list/list.component';
import {NavigableListComponent} from './navigable-list/navigable-list.component';
import {OtherComponent} from './other/other.component';
import {panelsRoutes} from './panels-routing';
import {PanelsComponent} from './panels/panels.component';
import {RelationsComponent} from './relations/relations.component';
import {SearchComponent} from './search/search.component';
import {SelectComponent} from './select/select.component';
import {AlertComponent} from './alert/alert.component';
import {DetailComponent} from './detail/detail.component';
import {SelectEnumComponent} from './select-enum/select-enum.component';
import {SelectHierarchicComponent} from './select-hierarchic/select-hierarchic.component';
import {FileComponent} from './file/file.component';
import {AvatarComponent} from './avatar/avatar.component';
import {DetailHeaderComponent} from './detail-header/detail-header.component';

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
                path: 'select-hierarchic',
                component: SelectHierarchicComponent,
            },
            {
                path: 'select-enum',
                component: SelectEnumComponent,
            },
            {
                path: 'hierarchic',
                component: HierarchicComponent,
            },
            {
                path: 'relation',
                component: RelationsComponent,
                resolve: {any: AnyResolver},
            },
            {
                path: 'panels',
                component: PanelsComponent,
                children: [
                    {
                        matcher: naturalPanelsUrlMatcher,
                        component: NaturalPanelsComponent,
                        data: {panelsRoutes: panelsRoutes},
                    },
                ],
            },
            {
                path: 'list',
                component: ListComponent,
                data: {
                    title: 'Listing of something',
                },
            },
            {
                path: 'alert-service',
                component: AlertComponent,
            },
            {
                path: 'nested/:listParamName',
                children: [
                    {
                        path: 'list',
                        component: ListComponent,
                        data: {
                            title: 'Listing of something else',
                            initialColumns: ['name', 'description', 'hidden'],
                        },
                    },
                ],
            },
            {
                path: 'editable-list',
                component: EditableListComponent,
                data: {
                    title: 'Listing of editable items',
                },
            },
            {
                path: 'navigable-list',
                component: NavigableListComponent,
                data: {
                    title: 'Listing of navigable items',
                },
            },
            {
                path: 'file',
                component: FileComponent,
                data: {
                    title: 'File upload',
                },
            },
            {
                path: 'detail/:id',
                component: DetailComponent,
                resolve: {any: AnyResolver},
                data: {
                    title: 'Detail page',
                },
                children: [
                    {
                        matcher: naturalPanelsUrlMatcher,
                        component: NaturalPanelsComponent,
                        data: {panelsRoutes: panelsRoutes},
                    },
                ],
            },
            {
                path: 'detail-header',
                component: DetailHeaderComponent,
                resolve: {any: AnyResolver},
                data: {
                    title: 'Detail header',
                },
            },
            {
                path: 'other',
                component: OtherComponent,
                data: {
                    title: 'Other tools',
                },
                children: [
                    {
                        path: 'dialog',
                        component: NaturalDialogTriggerComponent,
                        data: {
                            trigger: {
                                component: HomepageComponent,
                                dialogConfig: {
                                    width: '600px',
                                    maxWidth: '95vw',
                                    maxHeight: '97vh',
                                    data: {cancelText: 'asdfasfd', confirmText: 'asdfasdf'},
                                },
                            } as NaturalDialogTriggerRoutingData,
                        },
                    },
                ],
            },
            {
                path: 'avatar',
                component: AvatarComponent,
                data: {
                    title: 'Avatar',
                },
            },
        ],
    },
    {
        // 404 redirects to home
        matcher: fallbackIfNoOpenedPanels,
        redirectTo: '',
    },
];

@NgModule({
    imports: [
        RouterModule.forRoot(routes, {
            paramsInheritanceStrategy: 'always',
        }),
    ],
    exports: [RouterModule],
})
export class AppRoutingModule {}

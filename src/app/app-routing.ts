import {Routes} from '@angular/router';
import {
    fallbackIfNoOpenedPanels,
    NaturalDialogTriggerComponent,
    NaturalDialogTriggerRoutingData,
    NaturalPanelsComponent,
    naturalPanelsUrlMatcher,
    NaturalSeo,
} from '@ecodev/natural';
import {resolveHardcodedItem, resolveItem} from '../../projects/natural/src/lib/testing/item.resolver';
import {AlertComponent} from './alert/alert.component';
import {AvatarComponent} from './avatar/avatar.component';
import {DetailHeaderComponent} from './detail-header/detail-header.component';
import {DetailComponent} from './detail/detail.component';
import {EditableListComponent} from './editable-list/editable-list.component';
import {EditorComponent} from './editor/editor.component';
import {FileComponent} from './file/file.component';
import {HierarchicComponent} from './hierarchic/hierarchic.component';
import {HomeComponent} from './home/home.component';
import {HomepageComponent} from './homepage/homepage.component';
import {ListComponent} from './list/list.component';
import {ModalPlaceholderComponent} from './modal-placeholder/modal-placeholder.component';
import {NavigableListComponent} from './navigable-list/navigable-list.component';
import {OtherComponent} from './other/other.component';
import {panelsRoutes} from './panels-routing';
import {PanelsComponent} from './panels/panels.component';
import {RelationsComponent} from './relations/relations.component';
import {SearchComponent} from './search/search.component';
import {SelectEnumComponent} from './select-enum/select-enum.component';
import {SelectHierarchicComponent} from './select-hierarchic/select-hierarchic.component';
import {SelectComponent} from './select/select.component';
import {TableStyleComponent} from './table-style/table-style.component';
import {ThemeMergerComponent} from './theme-merger/theme-merger.component';
import {TypographyComponent} from './typography/typography.component';

export const routes: Routes = [
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
                data: {
                    seo: {
                        title: 'Search',
                        canonicalQueryParamsWhitelist: ['search'],
                    } satisfies NaturalSeo,
                },
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
                resolve: {model: resolveHardcodedItem},
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
                    seo: {title: 'Listing of something'} satisfies NaturalSeo,
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
                            seo: {title: 'Listing of something else'} satisfies NaturalSeo,
                            selectedColumns: ['name', 'description', 'hidden'],
                        },
                    },
                ],
            },
            {
                path: 'editable-list',
                component: EditableListComponent,
                data: {
                    seo: {title: 'Listing of editable items'} satisfies NaturalSeo,
                },
            },
            {
                path: 'table-style',
                component: TableStyleComponent,
                data: {
                    seo: {title: 'CSS style for MatTable'} satisfies NaturalSeo,
                },
            },
            {
                path: 'navigable-list',
                component: NavigableListComponent,
                data: {
                    seo: {title: 'Listing of navigable items'} satisfies NaturalSeo,
                },
            },
            {
                path: 'file',
                component: FileComponent,
                data: {
                    seo: {title: 'File upload'} satisfies NaturalSeo,
                },
            },
            {
                path: 'detail/:id',
                component: DetailComponent,
                resolve: {model: resolveItem},
                data: {
                    seo: {resolve: true} satisfies NaturalSeo,
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
                resolve: {model: resolveHardcodedItem},
                data: {
                    seo: {title: 'Detail header'} satisfies NaturalSeo,
                },
            },
            {
                path: 'editor',
                component: EditorComponent,
                data: {
                    seo: {title: 'Editor'} satisfies NaturalSeo,
                },
            },
            {
                path: 'theme-merger',
                component: ThemeMergerComponent,
                data: {
                    seo: {title: 'Theme merger'} satisfies NaturalSeo,
                },
            },
            {
                path: 'typography',
                component: TypographyComponent,
                data: {
                    seo: {title: 'Typography'} satisfies NaturalSeo,
                },
            },
            {
                path: 'other',
                component: OtherComponent,
                data: {
                    seo: {title: 'Other tools'} satisfies NaturalSeo,
                },
                children: [
                    {
                        path: 'dialog',
                        component: NaturalDialogTriggerComponent,
                        data: {
                            trigger: {
                                component: ModalPlaceholderComponent,
                                dialogConfig: {
                                    width: '600px',
                                    maxWidth: '95vw',
                                    maxHeight: '97vh',
                                    data: {cancelText: 'asdfasfd', confirmText: 'asdfasdf'},
                                },
                            } satisfies NaturalDialogTriggerRoutingData<
                                ModalPlaceholderComponent,
                                {cancelText: string; confirmText: string}
                            >,
                        },
                    },
                ],
            },
            {
                path: 'avatar',
                component: AvatarComponent,
                data: {
                    seo: {title: 'Avatar'} satisfies NaturalSeo,
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

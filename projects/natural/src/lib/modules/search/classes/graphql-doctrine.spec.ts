import {formatIsoDate, NaturalSearchFacets, toGraphQLDoctrineFilter, TypeDateComponent} from '@ecodev/natural';
import {NaturalSearchSelection, NaturalSearchSelections} from '../types/values';
import {Filter, LogicalOperator} from './graphql-doctrine.types';

function yearToJulian(year: number, endOfYear: boolean): number {
    return endOfYear ? 2451909 : 2415020;
}

describe('toGraphQLDoctrineFilter', () => {
    const facets: NaturalSearchFacets = [
        {
            display: 'Datation',
            field: 'datings.julianDay',
            component: null as any,
            transform: (s: NaturalSearchSelection): NaturalSearchSelection => {
                if (s.condition.between) {
                    s.condition.between.from = yearToJulian(s.condition.between.from as number, false);
                    s.condition.between.to = yearToJulian(s.condition.between.to as number, true);
                }

                return s;
            },
        },
        {
            display: 'Name',
            field: 'name',
            component: null as any,
            transform: (s: NaturalSearchSelection): NaturalSearchSelection => {
                if (s.condition.like) {
                    s.condition.like.value = '%' + s.condition.like.value + '%';
                }

                return s;
            },
        },
    ];

    const flagFacets: NaturalSearchFacets = [
        {
            display: 'Normal flag',
            field: 'field1',
            condition: {equal: {value: 'normal value'}},
        },
        {
            display: 'Not inversed flag',
            field: 'field2',
            inversed: false,
            condition: {equal: {value: 'not inversed value'}},
        },
        {
            display: 'Inversed flag',
            field: 'field3',
            inversed: true,
            condition: {equal: {value: 'inversed value'}},
            transform: (s: NaturalSearchSelection): NaturalSearchSelection => {
                if (s.condition.equal) {
                    s.condition.equal.value += ' foo';
                }

                return s;
            },
        },
    ];

    it('should return empty output for null', () => {
        expect(toGraphQLDoctrineFilter(facets, null)).toEqual({});
    });

    it('should return empty output for empty selection', () => {
        expect(toGraphQLDoctrineFilter(facets, [])).toEqual({});
    });

    it('should return empty output for empty group', () => {
        expect(toGraphQLDoctrineFilter(facets, [[]])).toEqual({});
    });

    it('should do simple thing', () => {
        const input: NaturalSearchSelections = [
            [
                {
                    field: 'visibility',
                    condition: {
                        in: {
                            values: ['private', 'member'],
                        },
                    },
                },
            ],
        ];

        const expected: Filter = {
            groups: [
                {
                    conditions: [
                        {
                            visibility: {in: {values: ['private', 'member']}},
                        },
                    ],
                },
            ],
        };

        expect(toGraphQLDoctrineFilter(facets, input)).toEqual(expected);
    });

    it('should transform value', () => {
        const input: NaturalSearchSelections = [
            [
                {
                    field: 'name',
                    condition: {
                        like: {
                            value: 'foo',
                        },
                    },
                },
            ],
        ];

        const expected: Filter = {
            groups: [
                {
                    conditions: [
                        {
                            name: {like: {value: '%foo%'}},
                        },
                    ],
                },
            ],
        };

        expect(toGraphQLDoctrineFilter(facets, input)).toEqual(expected);

        // Original value must not have been touched
        expect((input as any)[0][0].condition.like.value).toEqual('foo');
    });

    it('should handle search with custom operator', () => {
        const input: NaturalSearchSelections = [
            [
                {
                    field: 'search',
                    condition: {
                        like: {
                            value: 'foo',
                        },
                    },
                },
            ],
        ];

        const expected: Filter = {
            groups: [
                {
                    conditions: [
                        {
                            custom: {search: {value: 'foo'}} as any,
                        },
                    ],
                },
            ],
        };

        expect(toGraphQLDoctrineFilter(facets, input)).toEqual(expected);
    });

    it('should join a relation', () => {
        const input: NaturalSearchSelections = [
            [
                {
                    field: 'artists.name',
                    condition: {
                        like: {
                            value: 'bar',
                        },
                    },
                },
            ],
        ];

        const expected: Filter = {
            groups: [
                {
                    joins: {
                        artists: {
                            conditions: [
                                {
                                    name: {like: {value: 'bar'}},
                                },
                            ],
                        },
                    },
                },
            ],
        };

        expect(toGraphQLDoctrineFilter(facets, input)).toEqual(expected);
    });

    it('should use `between` without transform', () => {
        const input: NaturalSearchSelections = [
            [
                {
                    field: 'year',
                    condition: {
                        between: {
                            from: 1900,
                            to: 2000,
                        },
                    },
                },
            ],
        ];

        const expected: Filter = {
            groups: [
                {
                    conditions: [
                        {
                            year: {between: {from: 1900, to: 2000}},
                        },
                    ],
                },
            ],
        };

        expect(toGraphQLDoctrineFilter(facets, input)).toEqual(expected);
    });

    it('should use `between` with transform', () => {
        const input: NaturalSearchSelections = [
            [
                {
                    field: 'datings.julianDay',
                    condition: {
                        between: {
                            from: 1900,
                            to: 2000,
                        },
                    },
                },
            ],
        ];

        const expected: Filter = {
            groups: [
                {
                    joins: {
                        datings: {
                            conditions: [
                                {
                                    julianDay: {between: {from: 2415020, to: 2451909}},
                                },
                            ],
                        },
                    },
                },
            ],
        };

        expect(toGraphQLDoctrineFilter(facets, input)).toEqual(expected);
    });

    it('should concat same field in the same array of fields', () => {
        const input: NaturalSearchSelections = [
            [
                {
                    field: 'name',
                    condition: {like: {value: 'foo'}},
                },
                {
                    field: 'name',
                    condition: {like: {value: 'bar'}},
                },
            ],
        ];

        const expected: Filter = {
            groups: [
                {
                    conditions: [{name: {like: {value: '%foo%'}}}, {name: {like: {value: '%bar%'}}}],
                },
            ],
        };

        expect(toGraphQLDoctrineFilter(facets, input)).toEqual(expected);
    });

    it('should merge unique joins', () => {
        const input: NaturalSearchSelections = [
            [
                {
                    field: 'artists.name',
                    condition: {like: {value: 'John'}},
                },
                {
                    field: 'artists.name',
                    condition: {like: {value: 'Jane'}},
                },
            ],
            [
                {
                    field: 'artists.name',
                    condition: {like: {value: 'Jake'}},
                },
                {
                    field: 'city.name',
                    condition: {like: {value: 'New York'}},
                },
                {
                    field: 'name',
                    condition: {like: {value: 'foo'}},
                },
                {
                    field: 'name',
                    condition: {like: {value: 'bar'}},
                },
            ],
        ];

        const expected = {
            groups: [
                {
                    joins: {
                        artists: {
                            conditions: [{name: {like: {value: 'John'}}}, {name: {like: {value: 'Jane'}}}],
                        },
                    },
                },
                {
                    groupLogic: LogicalOperator.OR,
                    joins: {
                        artists: {
                            conditions: [{name: {like: {value: 'Jake'}}}],
                        },
                        city: {
                            conditions: [{name: {like: {value: 'New York'}}}],
                        },
                    },
                    conditions: [{name: {like: {value: '%foo%'}}}, {name: {like: {value: '%bar%'}}}],
                },
            ],
        };

        expect(toGraphQLDoctrineFilter(facets, input)).toEqual(expected as Filter);
    });

    it('should group with OR', () => {
        const input: NaturalSearchSelections = [
            [
                {
                    field: 'name',
                    condition: {like: {value: 'foo'}},
                },
            ],
            [
                {
                    field: 'name',
                    condition: {like: {value: 'bar'}},
                },
            ],
        ];

        const expected: Filter = {
            groups: [
                {
                    conditions: [{name: {like: {value: '%foo%'}}}],
                },
                {
                    groupLogic: LogicalOperator.OR,
                    conditions: [{name: {like: {value: '%bar%'}}}],
                },
            ],
        };

        expect(toGraphQLDoctrineFilter(facets, input)).toEqual(expected);
    });

    it('should get non-selected inversed flag', () => {
        const expected: Filter = {
            groups: [
                {
                    conditions: [{field3: {equal: {value: 'inversed value foo'}}}],
                },
            ],
        };

        expect(toGraphQLDoctrineFilter(flagFacets, null)).toEqual(expected);
        expect(toGraphQLDoctrineFilter(flagFacets, [])).toEqual(expected);
        expect(toGraphQLDoctrineFilter(flagFacets, [[]])).toEqual(expected);
    });

    it('should get non-selected inversed flag in all groups', () => {
        const input: NaturalSearchSelections = [[], [], []];

        const expected: Filter = {
            groups: [
                {
                    conditions: [{field3: {equal: {value: 'inversed value foo'}}}],
                },
                {
                    groupLogic: LogicalOperator.OR,
                    conditions: [{field3: {equal: {value: 'inversed value foo'}}}],
                },
                {
                    groupLogic: LogicalOperator.OR,
                    conditions: [{field3: {equal: {value: 'inversed value foo'}}}],
                },
            ],
        };

        expect(toGraphQLDoctrineFilter(flagFacets, input)).toEqual(expected);
    });

    it('should not get selected inversed flag', () => {
        const input: NaturalSearchSelections = [
            [
                {
                    field: 'field3',
                    condition: {equal: {value: 'inversed value'}},
                },
            ],
        ];

        const expected: Filter = {};

        expect(toGraphQLDoctrineFilter(flagFacets, input)).toEqual(expected);
    });

    it('should handle `TypeDateComponent` with special "today" value', () => {
        const facetWithDate: NaturalSearchFacets = [
            {
                display: 'Creation date',
                field: 'creationDate',
                component: TypeDateComponent,
            },
        ];

        const input: NaturalSearchSelections = [
            [
                {
                    field: 'creationDate',
                    condition: {
                        less: {
                            value: 'today',
                        },
                    },
                },
            ],
        ];

        const expected: Filter = {
            groups: [
                {
                    conditions: [
                        {
                            creationDate: {less: {value: formatIsoDate(new Date())}} as any,
                        },
                    ],
                },
            ],
        };

        expect(toGraphQLDoctrineFilter(facetWithDate, input)).toEqual(expected);
    });
});

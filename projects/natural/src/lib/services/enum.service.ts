import {Apollo, gql} from 'apollo-angular';
import {inject, Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';

const enumTypeQuery = gql`
    query EnumType($name: String!) {
        __type(name: $name) {
            __typename
            enumValues {
                name
                description
            }
        }
    }
`;

type EnumType = {
    __type: null | {
        __typename: string;
        enumValues:
            | null
            | {
                  name: string;
                  description: null | string;
              }[];
    };
};

export type IEnum = {
    value: string;
    name: string;
};

@Injectable({
    providedIn: 'root',
})
export class NaturalEnumService {
    private readonly apollo = inject(Apollo);

    /**
     * Return a list of observable enumerables considering the given name
     */
    public get(name: string): Observable<IEnum[]> {
        // Load possible action statuses
        return this.apollo
            .query<EnumType>({
                query: enumTypeQuery,
                variables: {name: name},
                fetchPolicy: 'cache-first',
            })
            .pipe(
                map(result => {
                    const values: IEnum[] = [];
                    if (result.data.__type?.enumValues) {
                        for (const enumValue of result.data.__type.enumValues) {
                            values.push({
                                value: enumValue.name,
                                name: enumValue.description || '',
                            });
                        }
                    }

                    return values;
                }),
            );
    }

    /**
     * Returns the enum user-friendly name, instead of its value.
     */
    public getValueName(value: string, enumName: string): Observable<string> {
        return this.get(enumName).pipe(
            map(values => {
                for (const v of values) {
                    if (v.value === value) {
                        return v.name;
                    }
                }

                return '';
            }),
        );
    }
}

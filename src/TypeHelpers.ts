import {} from './Imports'


export type TuplesToObject<T extends [string, any][]> = {
    [K in T[number][0]]: Extract<T[number], [K, any]>[1]
  };

// credits goes to https://stackoverflow.com/a/50375286
export type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (
    k: infer I
) => void
    ? I
    : never;
type UnionToOvlds<U> = UnionToIntersection<
    U extends any ? (f: U) => void : never
>;

export type PopUnion<U> = UnionToOvlds<U> extends (a: infer A) => void ? A : never;

export type IsUnion<T> = [T] extends [UnionToIntersection<T>] ? false : true;

export type UnionToArray<T, A extends unknown[] = []> = IsUnion<T> extends true
    ? UnionToArray<Exclude<T, PopUnion<T>>, [PopUnion<T>, ...A]>
    : [T, ...A];
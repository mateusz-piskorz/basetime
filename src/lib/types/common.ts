export type Nullable<T> = T | null | undefined;

// works similar to FieldPath<FieldValues> but You can restrain a field to specific type e.g. Boolean|String|Date
export type TypedFieldPath<T, Type, Prefix extends string = ''> = {
    [K in keyof T]: T[K] extends ReadonlyArray<infer U> // If T[K] is an array of objects, add ${number} to the path and recurse
        ? U extends object
            ? TypedFieldPath<U, Type, `${Prefix}${K & string}.${number}.`>
            : never
        : // If T[K] matches Type, include the key (with prefix)
          T[K] extends Type
          ? `${Prefix}${K & string}`
          : // If T[K] is an object, recurse (add prefix)
            T[K] extends object
            ? TypedFieldPath<T[K], Type, `${Prefix}${K & string}.`>
            : never;
}[keyof T];

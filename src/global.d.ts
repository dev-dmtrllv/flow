declare type Callback<Returns = any, Args extends any[] = any> = (...args: Args) => Returns;

declare type Constructor<T, Args extends any[]> = new (...args: Args) => T;

declare type ConstructorArgs<T> = T extends Constructor<any, infer Args> ? Args : T extends { new(...args: infer Args): any } ? Args : never;

interface Error
{
	cause?: unknown;
	code?: string | undefined | number;
}
declare type Callback<Returns = any, Args extends [] = []> = (...args: Args) => Returns;

declare type Constructor<T, Args extends []> = new (...args: Args) => T;

interface Error
{
	cause?: unknown;
	code?: string | undefined | number;
}
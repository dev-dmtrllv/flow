type DisposableClass = Constructor<Disposable, any>;
type DisposableInstance = InstanceType<DisposableClass>;

const DISPOSED_FLAG = Symbol("DISPOSED_FLAG");

const proxyHandlers: ProxyHandler<DisposableInstance> = {
	get: (target, p: keyof DisposableInstance) =>
	{
		if (target[DISPOSED_FLAG])
			throw new DisposableError(target);
		return target[p];
	}
};

const classProxyHandlers: ProxyHandler<DisposableClass> = {
	construct: (target, argArray) => new Proxy(new target(...argArray), proxyHandlers)
};

export const disposable = <T extends DisposableClass>(ctor: T) => new Proxy(ctor, classProxyHandlers) as T;

export class DisposableError extends Error 
{
	public readonly target: Disposable;

	public constructor(target: Disposable)
	{
		super(`Cannot access ${target.constructor.name} after disposing!`);
		this.target = target;
	}
}

export abstract class Disposable
{
	private [DISPOSED_FLAG]: boolean = false;

	public readonly dispose = async () =>
	{
		if (this[DISPOSED_FLAG])
			throw new DisposableError(this);
		this[DISPOSED_FLAG] = true;
		await this.onDispose();
	}

	protected abstract onDispose(): Promise<void> | void;
}
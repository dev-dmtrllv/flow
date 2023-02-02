const registry = new FinalizationRegistry((dtor: Callback) => dtor());

export const destructable = <T extends Constructor<any, any>>(dtor: Callback) =>
{
	return (ctor: T) =>
	{
		const Class = ctor as Constructor<any, any>;

		return class extends Class
		{
			constructor(...args: any[])
			{
				super(...args);
				registry.register(this, dtor);
			}
		} as T;
	};
};
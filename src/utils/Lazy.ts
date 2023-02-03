export class Lazy<T>
{	
	private data_: T|undefined;

	public get: Callback<T, any>;

	public constructor(value: T);
	public constructor(initializer: Callback<T, any>);
	public constructor(arg: any)
	{
		if(typeof arg === "function")
		{
			this.get = (() => 
			{
				this.data_ = arg();
				this.get = () => this.data_ as any;
				return this.data_;
			}) as any;
		}
		else
		{
			this.data_ = arg;
			this.get = () => this.data_ as any;
		}
	}
}
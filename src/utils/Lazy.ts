export class Lazy<T>
{
	private getter_: Callback<T, any>;
	
	private data_: T|undefined;

	public get() { return this.getter_(); }

	public constructor(value: T);
	public constructor(initializer: Callback<T, any>);
	public constructor(arg: any)
	{
		if(typeof arg === "function")
		{
			this.getter_ = (() => 
			{
				this.data_ = arg();
				this.getter_ = () => this.data_ as any;
				return this.data_;
			}) as any;
		}
		else
		{
			this.data_ = arg;
			this.getter_ = () => this.data_ as any;
		}
	}
}
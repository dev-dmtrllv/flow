export abstract class Command<Options = any>
{
	private static readonly aliases: { [key: string]: Constructor<Command, any> } = {};

	public static readonly fromAlias = (alias: string) => Command.aliases[alias] || null;

	public static readonly getCommandNames = () => Object.keys(this.aliases);

	private static readonly alias = <T extends Command>(aliases: string[]) => (ctor: Constructor<T, any>) =>
	{
		aliases.forEach(alias => 
		{
			alias = alias.trim().toLowerCase();

			const cmd = Command.fromAlias(alias);
			if (cmd)
				throw new Error(`Duplicate alias for ${alias}!`);

			Command.aliases[alias] = instance;
		});
	}

	public abstract get description(): string;

	public abstract run(options: Options): any;
}
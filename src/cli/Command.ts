export abstract class Command<Options = any>
{
	private static readonly aliases: { [key: string]: Command } = {};

	public static readonly fromAlias = (alias: string) => Command.aliases[alias] || null;

	public static readonly getCommandNames = () => Object.keys(this.aliases);

	private static readonly addCommandInstance = (aliases: string[], instance: Command) =>
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

	public static readonly registerShellCommand = (aliases: string[], command: Callback) =>
	{
		this.addCommandInstance(aliases, new ShellCommand(command));
	}

	public static readonly shell = (...aliases: string[]) =>
	{
		return (constructor: Function) =>
		{
			const ctor = constructor as Constructor<Command, []>;
			const instance = new ctor();
			this.addCommandInstance(aliases, instance);
		}
	}

	public abstract run(options: Options): any;
}

export class ShellCommand extends Command
{
	public readonly command: any;
	public constructor(command: Callback)
	{
		super();
		this.command = command;
	}

	public override async run(options: any)
	{
		await this.command(options);
	}
}
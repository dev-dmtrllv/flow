import { Project } from "../Project";

export abstract class Command<Options = any>
{
	public static readonly getAliases = (ctor: Constructor<Command, any>): string[] => (ctor as any)["aliases"] || [];

	public static readonly alias = (...aliases: string[]) => (ctor: Constructor<Command, any>) =>
	{
		(ctor as any)["aliases"] = aliases;
	}

	public static readonly run = async <T extends Command<any>, Args extends any[]>(ctor: Constructor<T, Args>, ctorArgs: Args, optionArgs: string[]) =>
	{
		const instance = new (ctor as any)(...ctorArgs);
		
		await instance.run({});
	}

	public readonly project: Project;

	public abstract get description(): string;

	public constructor(project: Project)
	{
		this.project = project;
	}

	public abstract run(options: Options): any;
}
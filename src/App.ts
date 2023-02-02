
import { Project } from "./Project";
import { Shell } from "./cli/Shell";

export class App
{
	private static instance: App | null = null;

	public static readonly get = (): App => 
	{
		if (!this.instance)
			throw new Error("App is not initialized yet!");
		return this.instance;
	};

	public static readonly main = async (argv: string[]) =>
	{
		if (this.instance)
			throw new Error("App's entry has already been called!");

		this.instance = new App();

		const [,,command = "", ...args] = argv;

		try
		{
			if (command.length === 0)
			{
				await this.instance.startInteractive();
			}
			else
			{
				await this.instance.runCommand(command, args);
			}
		}
		catch (e: any)
		{
			if (e instanceof Error && e.code === "MODULE_NOT_FOUND")
			{
				console.error(`"${command}" is not a valid command`);
				await this.instance.runCommand("help");
			}
			else
			{
				console.error(e);
			}
		}
	}

	public readonly project: Project;

	private constructor()
	{
		this.project = Project.get();
	}

	private readonly runCommand = async (command: string = "", args: string[] = []) =>
	{
		const module = require(`./commands/${command}`);
		if ("default" in module)
		{
			const handler = new module.default();
			await handler.run();
		}
		else
		{
			throw new Error(`"${command}" has no default exports!`);
		}
	}

	private readonly startInteractive = async () =>
	{
		this.project.startWatcher();
		const shell = new Shell();
		await shell.start();
	}
}
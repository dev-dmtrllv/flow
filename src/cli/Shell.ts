import { stdin, stdout } from "process";
import * as readline from "readline/promises";
import readlineSync from "readline";
import { Disposable, disposable } from "../utils/disposable";
import { Command, ShellCommand } from "./Command";

@disposable
export class Shell extends Disposable
{
	public readonly completer = (line: string) =>
	{
		const commands = [...Command.getCommandNames(), ...Object.keys(this.shellCommands)];
		const last = line.split(" ").slice(-1)[0] || "";
		const hits = commands.filter((c) => c.startsWith(last));
		return [last.length === 0 ? commands.sort() : hits.sort(), line];
	}

	private readonly shellCommands: { [key: string]: ShellCommand } = {};
	private readonly rl: readline.Interface = readline.createInterface({ input: stdin, output: stdout, completer: this.completer, terminal: true });
	private didQuit: boolean = false;

	public constructor()
	{
		super();

		this.rl.setPrompt("> ");

		this.registerCommand(["clear", "cls"], () => console.clear());

		this.registerCommand(["quit", "q"], async () =>
		{
			const response = (await this.rl.question("Are you sure you want to quit? [Y/n] ")).trim().toLowerCase();
			this.didQuit = response === "y" || response === "";
		});
	}

	private readonly registerCommand = (aliases: string[], callback: Callback) =>
	{
		const instance = new ShellCommand(callback);
		aliases.forEach(alias => 
		{
			alias = alias.trim().toLowerCase();

			const cmd = Command.fromAlias(alias);
			if (cmd)
				throw new Error(`Duplicate alias for ${alias}!`);

			this.shellCommands[alias] = instance;
		});
	}

	public async start()
	{
		this.rl.prompt();
		this.rl.on("line", async (data) =>
		{
			data = data.trim().toLowerCase();

			const cmd = Command.fromAlias(data) || this.shellCommands[data];

			if (!cmd)
			{
				console.error(`"${data}" is not a valid command`);
			}
			else
			{
				await cmd.run({});
				if (this.didQuit)
				{
					this.dispose();
					return;
				}
			}

			this.rl.prompt();
		});
	}

	public write(...msgs: any)
	{
		if (!this.didQuit)
		{
			readlineSync.clearLine(stdout, -1);
			readlineSync.cursorTo(stdout, 0);
			console.log(...msgs);
			this.rl.prompt();
		}
		else
		{
			console.log(...msgs);
		}
	}

	protected override onDispose(): void | Promise<void>
	{
		this.rl.close();
	}
}
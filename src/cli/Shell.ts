import { stdin, stdout } from "process";
import * as readline from "readline/promises";
import readlineSync from "readline";
import { Disposable, disposable } from "../utils/disposable";
import { Command } from "./Command";
import { CommandRegistry } from "./CommandRegistry";
import { App } from "../App";
import { Project } from "../Project";

@disposable
export class Shell extends Disposable
{
	public readonly completer = (line: string) =>
	{
		const commands = CommandRegistry.getCommandNames();
		const last = line.split(" ").slice(-1)[0] || "";
		const hits = commands.filter((c) => c.startsWith(last));
		return [last.length === 0 ? commands.sort() : hits.sort(), line];
	}

	public readonly app: App;
	public readonly project: Project;
	public readonly rl: readline.Interface = readline.createInterface({ input: stdin, output: stdout, completer: this.completer, terminal: true });

	private didQuit: boolean = false;

	private readonly consoleMap: Console = (() => 
	{
		const map: any = {};
		for (const key in console)
			map[key] = (console as any)[key];
		return map;
	})();

	public constructor(app: App, project: Project)
	{
		super();
		this.app = app;
		this.project = project;
	}

	public async run()
	{
		this.patchConsole();
		this.project.startWatcher();

		while (!this.didQuit)
		{
			const response = (await this.rl.question("> ")).trim().toLowerCase();

			const [cmd, ...args] = response.split(" ");

			const ctor = CommandRegistry.get(cmd);

			if (!ctor)
			{
				console.log(`${cmd} not found!`);
			}
			else
			{
				await Command.run(ctor, [this.project, this], args);
			}
		}

		this.resetConsole();
		this.project.stopWatchers();
	}

	private readonly porpagateConsoleOutput = <K extends keyof Console>(target: K, args: Console[K] extends (...args: infer Args) => any ? Args : []) =>
	{
		if (!this.didQuit)
		{
			readlineSync.clearLine(stdout, -1);
			readlineSync.cursorTo(stdout, 0);
			(this.consoleMap as any)[target](...args);
			this.rl.prompt();
		}
		else
		{
			(this.consoleMap as any)[target](...args);
		}
	}

	public readonly log = (...msgs: any) => this.porpagateConsoleOutput("log", msgs);
	public readonly warn = (...msgs: any) => this.porpagateConsoleOutput("warn", msgs);
	public readonly error = (...msgs: any) => this.porpagateConsoleOutput("error", msgs);

	public readonly question = async <K extends string[]>(question: string, options: K, defaultValue: K[number] = "") =>
	{
		options = options.map(o => o.toLowerCase()) as K;
		defaultValue = defaultValue?.toLowerCase();

		const optionString = options.map(o => o.toLowerCase() === defaultValue ? o.toUpperCase() : o).join("/");

		const msg = `${question}? [${optionString}] `;

		let response = "";

		if (!this.didQuit)
		{
			readlineSync.clearLine(stdout, -1);
			readlineSync.cursorTo(stdout, 0);

			while (!options.includes(response))
				response = (await this.rl.question(msg)).toLowerCase();

			if (!this.didQuit)
				this.rl.prompt();
		}
		else
		{
			while (!options.includes(response))
				response = (await this.rl.question(msg)).toLowerCase();
		}

		return response;
	}

	protected override onDispose(): void | Promise<void>
	{
		this.rl.close();
	}

	public readonly stop = () =>
	{
		readlineSync.clearLine(stdout, -1);
		readlineSync.cursorTo(stdout, 0);
		this.rl.removeAllListeners("line");
		this.rl.close();
		this.didQuit = true;
	}

	private readonly patchConsole = () =>
	{
		console.log = this.log;
		console.warn = this.warn;
		console.error = this.error;
	}

	private readonly resetConsole = () =>
	{
		for (const key in console)
			(console as any)[key] = (this.consoleMap as any)[key];
	}
}
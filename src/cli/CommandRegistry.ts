import fs from "fs/promises";
import path from "path";
import { Command } from "./Command";
import { ShellCommand } from "./ShellCommand";

type CommandClass = Constructor<Command, any>;
type ShellCommandClass = Constructor<ShellCommand, any>;

export namespace CommandRegistry
{
	const commands: { [key: string]: CommandClass } = {};
	const shellCommands: { [key: string]: ShellCommandClass } = {};

	const aliasList: string[] = [];

	export const getCommandNames = (): string[] => [...aliasList];

	const loadCommandsFromDir = async (dir: string): Promise<Constructor<Command, any>[]> =>
	{
		const paths = await Promise.all((await fs.readdir(dir)).map(async p => 
		{
			const filePath = path.resolve(dir, p);
			if ((await fs.stat(filePath)).isFile())
			{
				const module = require(filePath);
				if ("default" in module)
					return module.default as Constructor<Command, any>;

				console.warn(`${filePath} does not has a default export!`);
			}

			return null;
		}));

		return paths.filter(module => !!module) as Constructor<Command, any>[];
	}

	const mapCommandClasses = (classes: Constructor<Command, any>[], target: { [key: string]: CommandClass; }) =>
	{
		classes.forEach((ctor) => 
		{
			const aliases = Command.getAliases(ctor);
			aliasList.push(...aliases);
			aliases.forEach((alias) => target[alias] = ctor);
			target[ctor.name.toLowerCase()] = ctor;
		});
	}

	export const get = (command: string): CommandClass | null =>
	{
		return commands[command] || shellCommands[command] || null;
	}

	export const initialize = async () =>
	{
		const loadedCommands = await Promise.all([
			loadCommandsFromDir(path.resolve(__dirname, "../commands")),
			loadCommandsFromDir(path.resolve(__dirname, "../commands/shell"))
		]);

		mapCommandClasses(loadedCommands[0], commands);
		mapCommandClasses(loadedCommands[1], shellCommands);
	}
}
import { Command } from "../cli/Command";

type CommandClass = Constructor<Command, any>;

export namespace CommandRegistry
{
	const commands: { [key: string]: Command } = {};

	export const register = (aliases: string[], commandClass: CommandClass) =>
	{
		aliases.forEach();
	}
}
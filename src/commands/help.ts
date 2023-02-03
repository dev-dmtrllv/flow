import { Command } from "../cli/Command";

@Command.alias("-h")
export default class Help extends Command
{
	public override get description(): string
	{
		throw new Error("Method not implemented.");
	}
	
	public override run(options: any)
	{
		console.log("help :D");
	}
}
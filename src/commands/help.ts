import { Command } from "../cli/Command";

@Command.shell("help", "-h")
export default class Help extends Command
{
	public override run(options: any)
	{
		console.log("help :D");
	}
}
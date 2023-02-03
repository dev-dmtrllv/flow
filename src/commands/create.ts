import { Command } from "../cli/Command";

@Command.alias("create", "-c")
export default class Create extends Command
{
	public override get description(): string
	{
		throw new Error("Method not implemented.");
	}

	public override run(options: any)
	{
		require("asd");
		console.log("hii");
	}
}
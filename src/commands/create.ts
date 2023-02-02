import { Command } from "../cli/Command";

export default class Create extends Command
{
	public override run(options: any)
	{
		require("asd");
		console.log("hii");
	}
}
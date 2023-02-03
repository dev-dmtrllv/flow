import { ShellCommand } from "../../cli/ShellCommand";

export default class Quit extends ShellCommand
{
	public override get description(): string
	{
		throw new Error("Method not implemented.");
	}

	public override async run(options: any)
	{
		const response = await this.shell.question("Are you sure you want to quit", ["y", "n"], "y");
		if(response.trim().toLowerCase() === "y")
			this.shell.stop();
	}
}
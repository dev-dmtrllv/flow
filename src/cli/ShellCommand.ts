import { Project } from "../Project";
import { Command } from "./Command";
import { Shell } from "./Shell";

export abstract class ShellCommand extends Command
{
	public readonly shell: Shell;

	public constructor(project: Project, shell: Shell)
	{
		super(project);
		this.shell = shell;
	}
}

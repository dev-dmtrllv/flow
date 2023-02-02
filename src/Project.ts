import fs from "fs";
import path from "path";
import { getFilesRecursive } from "./utils/filesystem";

export type ProjectConfiguration = {
	includes: string,
	src: string
};

type ConfigKey = keyof ProjectConfiguration;

export class Config
{
	public static readonly default: ProjectConfiguration = {
		includes: "include",
		src: "src"
	};

	private readonly config: ProjectConfiguration;

	public constructor(config: ProjectConfiguration | null)
	{
		this.config = config ?? Config.default;
	}

	public readonly get = <K extends ConfigKey>(key: K): ProjectConfiguration[K] => this.config[key];
}

export class Project
{
	private static instance: Project | null = null;

	public static readonly get = () =>
	{
		if (!this.instance)
		{
			const projectPath = process.cwd();
			const configPath = path.resolve(projectPath, "flow.json");
			const config = fs.existsSync(configPath) ? require(configPath) : null;
			this.instance = new Project(projectPath, config);
		}
		return this.instance;
	}

	public readonly dir: string;
	public readonly config: Config;

	private readonly files: { [key: string]: Date; } = {};

	public constructor(dir: string, config: ProjectConfiguration | null)
	{
		this.dir = dir;
		this.config = new Config(config);
		this.checkPaths();
	}

	private readonly checkConfigPath = <K extends ConfigKey>(key: K) =>
	{
		const dir = path.resolve(this.dir, this.config.get(key));
		if (!fs.existsSync(dir))
			fs.mkdirSync(dir, { recursive: true });
	}

	private readonly checkPaths = () =>
	{
		this.checkConfigPath("includes");
		this.checkConfigPath("src");
	}

	private readonly onFileChange = (a: any, b: any) =>
	{
		console.log(a, b);
	}

	private readonly watchDir = (path: string) =>
	{
		getFilesRecursive(path).forEach(path => 
		{
			console.log(fs.statSync(path));
		});

		fs.watch(path, this.onFileChange);
	}

	public readonly startWatcher = () =>
	{
		this.watchDir(this.config.get("src"));
		this.watchDir(this.config.get("includes"));
	}
}
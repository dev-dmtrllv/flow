import fs, { FSWatcher, WatchEventType } from "fs";
import path from "path";
import { Disposable, FS, disposable } from ".";

@disposable
export class RecursiveWatcher extends Disposable
{
	public readonly root: string;
	public readonly handler: WatchHandler;

	private readonly abortController = new AbortController();

	private readonly watchers: { [key: string]: FSWatcher } = {};

	public constructor(root: string, handler: WatchHandler)
	{
		super();
		this.root = root;
		this.handler = handler;
	}

	private readonly fsListener = (base: string) => async (type: WatchEventType, file: string) =>
	{
		const filePath = path.resolve(base, file);
		
		if(type === "rename")
		{
			if(!await FS.exists(filePath))
				this.handler("remove", filePath);
			else
				this.handler("change", filePath);
		}
		else
		{
			this.handler("change", filePath);
		}
	}

	public readonly watch = (dir: string) =>
	{
		dir = path.isAbsolute(dir) ? dir : path.resolve(this.root, dir);
		console.log(`Watching ${dir}...`);
		this.watchers[dir] = fs.watch(dir, {
			encoding: "utf-8",
			persistent: true,
			recursive: true,
			signal: this.abortController.signal
		}, this.fsListener(dir));
	}

	protected override onDispose(): void | Promise<void>
	{
		for(const key in this.watchers)
		{
			this.watchers[key].close();
			delete this.watchers[key];
		}
	}
}

export type WatchEvent = "new" | "change" | "remove";

export type WatchHandler = (type: WatchEvent, path: string) => void;
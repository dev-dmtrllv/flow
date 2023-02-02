import fs from "fs";
import path from "path";

const getFilesRecursive_ = (dir: string, paths: string[] = []) =>
{
	fs.readdirSync(dir).forEach(p => 
	{
		p = path.resolve(dir, p);
		if (fs.statSync(p).isDirectory())
			getFilesRecursive_(p, paths);
		else
			paths.push(p);
	});
	return paths;
}

export const getFilesRecursive = (dir: string) => getFilesRecursive_(dir, []);
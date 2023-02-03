import fs from "fs";
import fsAsync from "fs/promises";
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

export const exists = async (filePath: string) =>
{
	try
	{
		await fsAsync.access(filePath);
		return true;
	}
	catch (err: any)
	{
		if (err.code === "ENOENT")
			return false;

		throw err;
	}
}
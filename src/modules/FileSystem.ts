import fs from 'fs';
import path from 'path';
class FileSystem
{
    public static async RemoveFolder(folderPath: string)
    {
        if(!fs.existsSync(folderPath)) return;

        if (fs.existsSync(folderPath))
        {
            var paths = fs.readdirSync(folderPath);

            for(let i = 0; i < paths.length; i++)
            {
                const curPath = path.join(folderPath, paths[i]);

                if (fs.lstatSync(curPath).isDirectory())
                {
                    this.RemoveFolder(curPath);
                }
                else
                {
                    fs.unlinkSync(curPath);
                }
            }

            fs.rmdirSync(folderPath);
        }
    }

    public static async CopyInto(srcFolder: string, destFolder: string)
    {
        if(!fs.existsSync(srcFolder)) return;

        if(fs.existsSync(destFolder)) this.RemoveFolder(destFolder);
        fs.renameSync(srcFolder, destFolder);
    }
}

export {FileSystem};
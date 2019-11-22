import fs from 'fs';
import path from 'path';

const logFolder = path.join(__dirname + "../../..", "logs");

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
                    this.RemoveFile(curPath);
                }
            }

            fs.rmdirSync(folderPath);
        }
    }

    public static async RemoveFile(filePath: string)
    {
        if(fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    public static async ReadFile(filePath: string) : Promise<string>
    {
        return fs.readFileSync(filePath).toString();
    }

    public static async WriteFile(filePath: string, data: string)
    {
        fs.writeFileSync(filePath,data);
    }

    public static async MoveInto(srcFolder: string, destFolder: string)
    {
        if(!fs.existsSync(srcFolder)) return;

        if(fs.existsSync(destFolder)) this.RemoveFolder(destFolder);
        fs.renameSync(srcFolder, destFolder);
    }

    public static async CopyInto(srcFolder: string, destFolder: string)
    {
        if(!fs.existsSync(srcFolder)) return;

        await this.RemoveFolder(destFolder);
        fs.mkdirSync(destFolder);

        let files = fs.readdirSync(srcFolder);

        for(let i = 0; i < files.length; i++)
        {
            const file = files[i];
            const absPath = path.join(srcFolder, file);

            if(fs.statSync(absPath).isDirectory())
            {
                await this.CopyInto(absPath, path.join(destFolder,file));
            }
            else
            {
                fs.copyFileSync(absPath, path.join(destFolder,file));
            }
        }

    }

    public static async CopyFile(srcFile: string, destFile: string)
    {
        if(!fs.existsSync(srcFile)) return;
        
        await this.RemoveFile(destFile);

        fs.copyFileSync(srcFile, destFile);
    }

    public static MakeFolder(folderPath: string)
    {
        if(!fs.existsSync(folderPath)) fs.mkdirSync(folderPath);
    }

    public static MakeLogFile(time: string) : string
    {
        this.MakeFolder(logFolder);
        time = time.substr(1, time.length - 3);
        time = this.GetFileSafeName(time);

        var p = path.join(logFolder, time + ".log");

        
        fs.writeFileSync(p, time + ".log\n");

        return p;
    }

    public static async WriteLineToFile(filePath: string, data: string)
    {
        if(!fs.existsSync(filePath)) return;

        fs.appendFileSync(filePath,data + "\n");
    }

    public static GetFileSafeName(fileName: string)
    {
        fileName = fileName.replace(new RegExp("/", 'g'), "-");
        fileName = fileName.replace(new RegExp(" ", 'g'), "_");
        fileName = fileName.replace(new RegExp(":", 'g'), "_");

        return fileName;
    }
}

export {FileSystem};
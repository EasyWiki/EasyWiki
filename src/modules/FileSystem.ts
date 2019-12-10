import fs from 'fs';
import path from 'path';
import NodeCahce from 'node-cache'
import { Config } from './Config';

const logFolder = path.join(__dirname + "../../..", "logs");

class FileSystem
{
    public static cacheStore : NodeCahce = new NodeCahce({
        stdTTL: 120,
        checkperiod: 120,
    });

    /**
     * Remove a folder recursiveley
     * @param folderPath The path to the folder to remove
     */
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

    /**
     * Remove a file
     * @param filePath The file to remove
     */
    public static async RemoveFile(filePath: string)
    {
        if(fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    /**
     * Read a text file
     * @param filePath The path to the file to read
     * @returns The UTF-8 encoded text or if file does not exists an empty string
     */
    public static async ReadFile(filePath: string) : Promise<string>
    {
        if(!fs.existsSync(filePath)) return "";

        return fs.readFileSync(filePath).toString();
    }

    public static ReadFileSync(filePath: string)
    {
        if(!fs.existsSync(filePath)) return "";

        return fs.readFileSync(filePath).toString();
    }

    /**
     * Read a file from the filesystem and cache it.
     * If the file is already in the chache read it from the chache.
     * @param filePath The path to the file
     */
    public static async ReadFileCached(filePath: string) : Promise<string>
    {
        var value = this.cacheStore.get(filePath);

        if(value && !Config.Config.Get("Web.disableCache"))
        {
            return value as string;
        }
        else
        {
            var content = await this.ReadFile(filePath);
            this.cacheStore.set(filePath, content, Config.Config.Get("Web.cacheTTL"));
            return content;
        }
    }

    /**
     * Write a string to a file.
     * @param filePath The path to the file to write to
     * @param data The string data to write to the file
     */
    public static async WriteFile(filePath: string, data: string)
    {
        fs.writeFileSync(filePath,data);
    }

    /**
     * Move a folder
     * @param srcFolder The folder to move
     * @param destFolder The destination for the folder
     */
    public static async MoveInto(srcFolder: string, destFolder: string)
    {
        if(!fs.existsSync(srcFolder)) return;

        if(fs.existsSync(destFolder)) this.RemoveFolder(destFolder);
        fs.renameSync(srcFolder, destFolder);
    }

    /**
     * Copy all files and sub folders from a source folder to the destination folder.
     * @param srcFolder The source folder
     * @param destFolder The destination folder
     */
    public static async CopyInto(srcFolder: string, destFolder: string)
    {
        if(!fs.existsSync(srcFolder)) return;

        await this.RemoveFolder(destFolder);
        fs.mkdirSync(destFolder.toLowerCase());

        let files = fs.readdirSync(srcFolder);

        for(let i = 0; i < files.length; i++)
        {
            const file = files[i];
            const absPath = path.join(srcFolder, file);

            if(fs.statSync(absPath).isDirectory())
            {
                await this.CopyInto(absPath, path.join(destFolder,file.toLowerCase()));
            }
            else
            {
                fs.copyFileSync(absPath, path.join(destFolder,file.toLowerCase()));
            }
        }

    }

    /**
     * Copy a file to a destination file
     * @param srcFile The source file
     * @param destFile The destination file
     */
    public static async CopyFile(srcFile: string, destFile: string)
    {
        if(!fs.existsSync(srcFile)) return;
        
        await this.RemoveFile(destFile);

        fs.copyFileSync(srcFile, destFile.toLowerCase());
    }

    /**
     * Create a folder
     * @param folderPath The path to the folder to create
     */
    public static MakeFolder(folderPath: string)
    {
        if(!fs.existsSync(folderPath)) fs.mkdirSync(folderPath);
    }

    /**
     * Create a logfile
     * @param time The current time
     */
    public static MakeLogFile(time: string) : string
    {
        this.MakeFolder(logFolder);
        time = time.substr(1, time.length - 3);
        time = this.GetFileSafeName(time);

        var p = path.join(logFolder, time + ".log");

        
        fs.writeFileSync(p, time + ".log\n");

        return p;
    }

    /**
     * Add a line to the end of the file
     * @param filePath The path to the file to write to
     * @param line The line to write into the file
     */
    public static async WriteLineToFile(filePath: string, line: string)
    {
        if(!fs.existsSync(filePath)) return;
        
        fs.appendFileSync(filePath,line + "\n");
    }
    
    public static LoopFolder(folderPath: string, relative: string = "/", callback: typeof LoopFolderCallback)
    {
        if(!fs.existsSync(folderPath)) return;

        const files = fs.readdirSync(folderPath);

        for(let i = 0; i < files.length; i++)
        {
            const file = files[i];
            const filePath = path.join(folderPath, file);
            const relPath = path.join(relative, path.basename(filePath));

            if(fs.statSync(filePath).isDirectory())
            {
                callback(file,filePath,relPath,true);
                this.LoopFolder(filePath,relPath,callback);
            }
            else
            {
                callback(file,filePath,relPath,false);
            }
        }
    }

    /**
     * Create a filename that is safe to store onto the filesystem
     * @param fileName The current filename
     * @returns A safe filename
     */
    public static GetFileSafeName(fileName: string) : string
    {
        fileName = fileName.replace(new RegExp("/", 'g'), "-");
        fileName = fileName.replace(new RegExp(" ", 'g'), "_");
        fileName = fileName.replace(new RegExp(":", 'g'), "_");

        return fileName;
    }


    /**
     * Clear all the stored cache
     */
    public static async ClearAllCache()
    {
        this.cacheStore.del(this.cacheStore.keys());
    }
}

export {FileSystem};

function LoopFolderCallback (file: string, absPath: string, relPath:string, isFolder: boolean) : void {};

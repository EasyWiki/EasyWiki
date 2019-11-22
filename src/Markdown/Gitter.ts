import path from 'path';
import { Config } from "../modules/Config";
import { FileSystem } from "../modules/FileSystem";
import { Logger } from "../modules/Logger";
import { MarkdownBuilder } from "./MarkdownBuilder";
import { execSync } from "child_process";

const dirPrefix = "../..";
const pageFolder = path.join(__dirname, dirPrefix, "pages");
const mediaFolder = path.join(__dirname, dirPrefix, "public", "media");
const tempFolder = path.join(__dirname, dirPrefix, "pages-temp");
const partialFolder = path.join(__dirname, dirPrefix, "partials");

class Gitter
{
    public static Gitter : Gitter;

    constructor()
    {
        Gitter.Gitter = this;
    }

    public async CloneRepo()
    {
        try
        {
            Logger.Log("Gitter", "Cloning repository...");

            if(MarkdownBuilder.MarkdownBuilder) MarkdownBuilder.MarkdownBuilder.UnwatchFolder();

            await FileSystem.RemoveFolder(tempFolder);

            execSync("git clone " + Config.Config.Get("Gitter.repo") + " " + tempFolder, {
                stdio: "ignore"
            });

            var p1 = FileSystem.CopyInto(path.join(tempFolder, "pages"), pageFolder);
            var p2 = FileSystem.CopyInto(path.join(tempFolder, "media"), mediaFolder);

            await p1;
            await p2;
            
            await FileSystem.CopyFile(path.join(tempFolder, "menu.md"), path.join(partialFolder, "menu.md"));
            
            FileSystem.RemoveFolder(tempFolder);
            
            if(MarkdownBuilder.MarkdownBuilder)
            {   
                MarkdownBuilder.MarkdownBuilder.BuildMenu();
                MarkdownBuilder.MarkdownBuilder.WatchFolder();
            }

            Logger.Log("Gitter", "Done cloning repository.");
        }
        catch(e)
        {
            Logger.Error("Gitter", "Cloning has failed!",e);
        }
    }
}

export {Gitter};
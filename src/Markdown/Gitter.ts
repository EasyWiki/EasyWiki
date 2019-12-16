import path from 'path';
import { Config } from "../modules/Config";
import { FileSystem } from "../modules/FileSystem";
import { Logger } from "../modules/Logger";
import { MarkdownBuilder } from "./MarkdownBuilder";
import { execSync } from "child_process";
import BreadcrumbBuilder from './BreadcrumbBuilder';


// Create constants to the special folders
const dirPrefix = "../..";
const pageFolder = path.join(__dirname, dirPrefix, "pages");
const mediaFolder = path.join(__dirname, dirPrefix, "public", "media");
const tempFolder = path.join(__dirname, dirPrefix, "pages-temp");
const partialFolder = path.join(__dirname, dirPrefix, "partials");
const builtFolder = path.join(__dirname, dirPrefix, "built-views");

class Gitter
{
    public static Gitter : Gitter;

    constructor()
    {
        Gitter.Gitter = this;
    }

    /**
     * Clone the repository and build the markdown files
     */
    public async CloneRepo()
    {
        try
        {
            Logger.Log("Gitter", "Cloning repository...");

            if(MarkdownBuilder.MarkdownBuilder) MarkdownBuilder.MarkdownBuilder.UnwatchFolder();

            await FileSystem.RemoveFolder(tempFolder);

            execSync("git clone \"" + Config.Config.Get("Gitter.repo") + "\" \"" + tempFolder + "\"", {
                stdio: "ignore"
            });

            // Copy all special files
            var p1 = FileSystem.CopyInto(path.join(tempFolder, "pages"), pageFolder);
            var p2 = FileSystem.CopyInto(path.join(tempFolder, "media"), mediaFolder);

            await p1;
            await p2;
            
            await FileSystem.CopyFile(path.join(tempFolder, "menu.md"), path.join(partialFolder, "menu.md"));
            await FileSystem.CopyFile(path.join(tempFolder, "navbar.md"), path.join(partialFolder, "navbar.md"));
            await FileSystem.CopyFile(path.join(tempFolder, "footer.md"), path.join(partialFolder, "footer.md"));
            await FileSystem.CopyFile(path.join(tempFolder, "footerLinks.md"), path.join(partialFolder, "footerLinks.md"));
            
            // Remove the temp folder
            FileSystem.RemoveFolder(tempFolder);
            
            // Build all markdown
            if(MarkdownBuilder.MarkdownBuilder)
            {   
                await MarkdownBuilder.MarkdownBuilder.BuildMenu();
                await MarkdownBuilder.MarkdownBuilder.BuildNavBar();
                await MarkdownBuilder.MarkdownBuilder.BuildFooter();
                await MarkdownBuilder.MarkdownBuilder.BuildAll(true);
                BreadcrumbBuilder.AddBreadcrumbsToFolder(builtFolder);
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
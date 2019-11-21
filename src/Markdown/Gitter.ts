import {Clone} from "nodegit";
import path from 'path';
import { Config } from "../modules/Config";
import { FileSystem } from "../modules/FileSystem";
import { Logger } from "../modules/Logger";
import { MarkdownBuilder } from "./MarkdownBuilder";

const dirPrefix = "../..";
const pageFolder = path.join(__dirname, dirPrefix, "pages");
const mediaFolder = path.join(__dirname, dirPrefix, "public", "media");
const tempFolder = path.join(__dirname, dirPrefix, "pages-temp");

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

            MarkdownBuilder.MarkdownBuilder.UnwatchFolder();

            await FileSystem.RemoveFolder(tempFolder);

            await Clone.clone(Config.Config.Get("Gitter.repo"), tempFolder);

            var p1 = FileSystem.CopyInto(path.join(tempFolder, "pages"), pageFolder);
            var p2 = FileSystem.CopyInto(path.join(tempFolder, "media"), mediaFolder);

            await p1;
            await p2;

            FileSystem.RemoveFolder(tempFolder);

            MarkdownBuilder.MarkdownBuilder.WatchFolder();

            Logger.Log("Gitter", "Done cloning repository.");
        }
        catch
        {
            Logger.Error("Gitter", "Cloning has failed!");
        }
    }
}

export {Gitter};
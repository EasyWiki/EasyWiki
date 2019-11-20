import {Clone} from "nodegit";
import path from 'path';
import { Config } from "../modules/Config";
import { FileSystem } from "../modules/FileSystem";
import { Logger } from "../modules/Logger";

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
        Logger.Log("Gitter", "Cloning repository...");

        await FileSystem.RemoveFolder(tempFolder);

        await Clone.clone(Config.Config.Get("Gitter.repo"), tempFolder);

        var p1 = FileSystem.CopyInto(path.join(tempFolder, "pages"), pageFolder);
        var p2 = FileSystem.CopyInto(path.join(tempFolder, "media"), mediaFolder);

        await p1;
        await p2;

        FileSystem.RemoveFolder(tempFolder);

        Logger.Log("Gitter", "Done cloning repository.");
    }
}

export {Gitter};
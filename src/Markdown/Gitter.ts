import {Clone} from "nodegit";
import path from 'path';
import { Config } from "../modules/Config";
import fs from 'fs';
import { FileSystem } from "../modules/FileSystem";

const dirPrefix = "../..";
const pageFolder = path.join(__dirname, dirPrefix, "pages");
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
        await FileSystem.RemoveFolder(tempFolder);

        let cloner = Clone.clone(Config.Config.Get("Gitter.repo"), tempFolder);
        let repo = await cloner;

        await FileSystem.CopyInto(path.join(tempFolder, "pages"), pageFolder);
        FileSystem.RemoveFolder(tempFolder);
    }
}

export {Gitter};
import fs from 'fs';
import path from 'path';
import { Logger } from '../modules/Logger';
import { MarkdownBuilder } from './MarkdownBuilder';

const dirPrefix = "../..";
const pageFolder = path.join(__dirname, dirPrefix, "pages");

class Searcher
{
    public static Searcher : Searcher;

    private _pagedata : PageData[];
    private _maxResults : number = 5;

    constructor()
    {
        Searcher.Searcher = this;

        this._pagedata = [];
    }

    public async Find(query: string) : Promise<PageData[]>
    {
        let data : PageData[] = [];

        if(query.length > 0)
        for(let i = 0; i < this._pagedata.length && data.length < this._maxResults; i++)
        {
            const page = this._pagedata[i];
            let outLine : string = "";

            if(page.data.toLowerCase().indexOf(query.toLowerCase()) != -1)
            {
                outLine = MarkdownBuilder.MarkdownBuilder.CleanString(page.data);
                outLine = outLine.substr(outLine.indexOf(query), 50);
                outLine = "**" + outLine;
                outLine = outLine.substr(0, query.length + 2) + "**" + outLine.substr(query.length + 2);
                outLine = MarkdownBuilder.MarkdownBuilder.BuildString(outLine);
                outLine = outLine.replace("*", "");
                outLine = outLine.replace("*", "");

                let newPage: PageData = {url: page.url, data: ""};
                data.push(newPage);
            }
        }

        return data;
    }

    public async IndexAll(clear: boolean = true)
    {
        try
        {
            Logger.Log("Search", "Indexing all files...");
        
            if(clear) this._pagedata = [];
            this.IndexFolder("/");

            Logger.Log("Search", "Done indexing.");
        }
        catch(e)
        {
            Logger.Error("Searcher", "Indexing failed", e);
        }
    }

    private IndexFolder(folderpath: string) : void
    {
        var self = this;

        const files = fs.readdirSync(path.join(pageFolder, folderpath));
        files.forEach(function(file)
        {
            let filePath = path.join(pageFolder, folderpath, file);
            
            if(fs.statSync(filePath).isDirectory())
            {
                self.IndexFolder(path.join(folderpath, file));
            }
            else
            {
                self.IndexFile(path.join(folderpath, file));
            }
        });
    }

    private IndexFile(filePath : string)
    {
        if(path.extname(filePath) != ".md") return;

        const url = filePath.substr(0, filePath.length - 3);
        const fullPath = path.join(pageFolder, filePath);
        const data = fs.readFileSync(fullPath).toString();

        this._pagedata.push({url: url, data: data});
    }
}

interface PageData
{
    url: string;
    data: string;
}

export {Searcher, PageData};

function spliceAdd(str: string, start:number, delCount:number, newSubStr:string)
{
    return str.slice(0, start) + newSubStr + str.slice(start + Math.abs(delCount));
}
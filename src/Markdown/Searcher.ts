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
    private _maxResults : number = 3;

    constructor()
    {
        Searcher.Searcher = this;

        this._pagedata = [];
    }

    public IndexAll(clear: boolean = true)
    {
        Logger.Log("Search", "Indexing all files...");
        
        if(clear) this._pagedata = [];
        this.IndexFolder("/");

        Logger.Log("Search", "Done indexing.");
    }

    public async Find(query: string) : Promise<PageData[]>
    {
        let data : PageData[] = [];

        for(let i = 0; i < this._pagedata.length && data.length < this._maxResults; i++)
        {
            const page = this._pagedata[i];

            if(page.url.indexOf(query) !== -1)
            {
                let builtLine = page.data.substring(0, 50);
                builtLine = MarkdownBuilder.MarkdownBuilder.BuildString(builtLine);

                let newPage: PageData = {url: page.url, data: builtLine};
                data.push(newPage);
            }
            else if(page.data.indexOf(query) !== -1)
            {
                let builtLine = page.data.substring(page.data.indexOf(query), 50);
                builtLine = MarkdownBuilder.MarkdownBuilder.BuildString(builtLine);

                let newPage: PageData = {url: page.url, data: builtLine};
                data.push(newPage);
            }
        }

        return data;
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
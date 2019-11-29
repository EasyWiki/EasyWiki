import fs from 'fs';
import path from 'path';
import { Logger } from '../modules/Logger';
import { RootNode } from './SearchTree';
import { FileSystem } from '../modules/FileSystem';
import { MarkdownBuilder } from './MarkdownBuilder';

const dirPrefix = "../..";
const pageFolder = path.join(__dirname, dirPrefix, "pages");
const searchFolder = path.join(__dirname, dirPrefix, "searchIndex");

class Searcher
{
    public static Searcher : Searcher;
    private _maxResults : number = 5;
    private _pageNodes : Map<string, RootNode>;

    constructor()
    {
        Searcher.Searcher = this;
        this._pageNodes = new Map<string, RootNode>()
    }

    public async Find(query: string)
    {
        const self = this;

        let scoreMap = new Map<string, number>();

        // Calculate search scores
        SplitInWords(query.toLowerCase()).forEach(function(str)
        {
            self._pageNodes.forEach(function(node, key)
            {
                const score =  node.CalculateScore(str.split(''));
                const prevScore = scoreMap.get(key);
                
                if(prevScore)
                    scoreMap.set(key, score + prevScore);
                else
                    scoreMap.set(key, score);
            });
        });

        let pageUrls : string[] = [];
        scoreMap.forEach((score, key) => pageUrls.push(key));
        pageUrls.sort((a,b) => (scoreMap.get(b) as number) - (scoreMap.get(a) as number));

        pageUrls.forEach((key) => console.log(key + ": " + scoreMap.get(key)));
    }

    public async IndexAll(clear: boolean = true)
    {
        try
        {
            Logger.Log("Search", "Indexing all files...");
            
            await FileSystem.RemoveFolder("searchIndex");
            await FileSystem.MakeFolder(searchFolder);

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
                const p = path.join(folderpath, file);
                if(path.extname(p) == ".md")
                {
                    self._pageNodes.set(p, self.IndexFile(p));
                }
            }
        });
    }

    private IndexFile(filePath : string) : RootNode
    {
        const node = new RootNode();

        const url = filePath.substr(0, filePath.length - 3);
        const fullPath = path.join(pageFolder, filePath);
        const data = MarkdownBuilder.MarkdownBuilder
            .CleanString(fs.readFileSync(fullPath).toString()).toLowerCase();
        
        SplitInWords(url).forEach(function(str)
        {
            node.Insert(str.split(''));
        });

        SplitInWords(data).forEach(function(str)
        {
            node.Insert(str.split(''));
        });

        return node;
    }
}

export {Searcher};

function SplitInWords(str: string) : string[]
{
    return str.split(/[ ,;.?!\(\)\{\}\[\]\"\'\\\/\n\r]+/);
}
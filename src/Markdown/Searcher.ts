import fs from 'fs';
import path from 'path';
import { Logger } from '../modules/Logger';
import { RootNode } from './SearchTree';
import { FileSystem } from '../modules/FileSystem';

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

        // Get max scoring pages
        scoreMap.forEach(function(score, key)
        {
            if(pageUrls.length == 0)
            {
                pageUrls.push(key);
            }
            else for(let i = pageUrls.length - 1; i >= 0; i--)
            {
                if(scoreMap.get(pageUrls[i]) as number >= score && pageUrls.length < self._maxResults)
                {
                    pageUrls.push(key);
                }
                else if(scoreMap.get(pageUrls[i]) as number > score)
                {
                    break;
                }
                else if(pageUrls.length < self._maxResults)
                {
                    pageUrls.push("");
                    
                    for(let j = pageUrls.length - 2; j >= i; j--)
                    {
                        pageUrls[j + 1] = pageUrls[j];
                    }

                    pageUrls[i] = key;
                }
                else
                {
                    for(let j = pageUrls.length - 2; j >= i; j--)
                    {
                        pageUrls[j + 1] = pageUrls[j];
                    }

                    pageUrls[i] = key;
                }
            }
        });

        console.log(pageUrls);
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
        const data = fs.readFileSync(fullPath).toString().toLowerCase();
        
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
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

    /**
     * Find the best page for a search query
     * @param query The search query
     */
    public async Find(query: string) : Promise<string[]>
    {
        const self = this;

        let scoreMap = new Map<string, number>();

        // Calculate search scores
        SplitInWords(query.toLowerCase()).forEach(function(str)
        {
            self._pageNodes.forEach(function(node, key)
            {
                const score = node.CalculateScore(str.split(''));
                const prevScore = scoreMap.get(key);
                
                if(prevScore)
                    scoreMap.set(key, score + prevScore);
                else
                    scoreMap.set(key, score);
            });
        });

        let pageUrls : string[] = [];
        scoreMap.forEach((score, key) => {
            if(score > 0) pageUrls.push(key)
        });
        pageUrls.sort((a,b) => (scoreMap.get(b) as number) - (scoreMap.get(a) as number));

        return pageUrls.splice(0, this._maxResults);
    }

    /**
     * Index all pages
     * @param clear If true will remove all previously create index files
     */
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

    /**
     * Index all files in this folder and subfolders
     * @param folderpath The path to the folder to index
     */
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
                    FileSystem.MakeFolder(path.join(searchFolder, folderpath));
                    self._pageNodes.set(p, self.IndexFile(p));
                }
            }
        });
    }

    /**
     * Index file
     * @param filePath The path to the file to index
     */
    private IndexFile(filePath : string) : RootNode
    {
        const node = new RootNode();

        const url = filePath.substr(0, filePath.length - 3);
        const fullPath = path.join(pageFolder, filePath);
        const data = MarkdownBuilder.MarkdownBuilder
            .CleanString(fs.readFileSync(fullPath).toString().toLowerCase());

        SplitInWords(url.toLowerCase()).forEach(function(str)
        {
            if(str.length == 0) return;

            node.Insert(str.split(''));
        });

        SplitInWords(data.toLowerCase()).forEach(function(str)
        {
            if(str.length == 0) return;
            
            node.Insert(str.split(''));
        });

        node.CalculateMaxScore();

        FileSystem.WriteFile(path.join(searchFolder, url + ".json"), JSON.stringify(node.ToJson()));

        return node;
    }

    public LoadIndexFiles()
    {
        Logger.Log("Searcher", "Loading index files.");
        FileSystem.LoopFolder(searchFolder,"/", (file, absPath, relPath, isFolder) =>
        {
            if(!isFolder)
            {
                let node = new RootNode();
                let jsonStr = FileSystem.ReadFileSync(absPath);
                node.FromJson(JSON.parse(jsonStr));
                
                this._pageNodes.set(relPath.substr(0, relPath.length - ".json".length), node);

            }
        });

        Logger.Log("Searcher", "Loaded index files.")
    }
}

export {Searcher};

/**
 * Split string into words
 * @param str String to split
 */
function SplitInWords(str: string) : string[]
{
    return str.split(/[ ,;.?!\(\)\{\}\[\]\"\'\\\/\n\r]+/);
}
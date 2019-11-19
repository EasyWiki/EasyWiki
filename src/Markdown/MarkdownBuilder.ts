import fs from 'fs';
import path from 'path';
import highlight from "highlight.js";
import { Logger } from '../modules/Logger';
import { Searcher } from './Searcher';

const kramed : any = require("kramed");

const dirPrefix = "../..";
const builtFolder = path.join(__dirname, dirPrefix, "built-views");
const pageFolder = path.join(__dirname, dirPrefix, "pages");

class MarkdownBuilder
{
    public static MarkdownBuilder : MarkdownBuilder;
    private _rederer : any

    constructor()
    {
        MarkdownBuilder.MarkdownBuilder = this;
        
        this._rederer = new kramed.Renderer();

        this.SetupRederer();
        this.SetupOptions();
    }

    private SetupOptions()
    {
        kramed.setOptions({
            highlight: function (code: string) {
                return highlight.highlightAuto(code).value;
            },
            renderer: this._rederer,
            breaks: true
        });
    }

    private SetupRederer()
    {
        this._rederer.heading = function(text: string, level: number, raw:string) : string
        {
            var id = text.toLowerCase().replace(/[^\w]+/g, '-');

            return "<h" + level + " id='" + id + "' class='title is-" + level + "'>" + text + "</h" + level + ">";
        }

        this._rederer.table = function(header:string, body:string) : string
        {
            return '<table class="table">' + body + "</table>";
        }
    }
    
    public BuildAll(reindex: boolean = true) : void
    {
        Logger.Log("Markdown", "Building all markdown.");
        this.RemoveFolder("/", false);
        this.BuildFolder("/");
        Logger.Log("Markdown", "Built all markdown.");

        if(reindex)
        {
            Logger.Log("Markdown", "Reindexing all files.");
            Searcher.Searcher.IndexAll(true);
        }
    }

    private RemoveFolder(folderpath: string, absolute: boolean = false) : void
    {
        if(!absolute) folderpath = path.join(builtFolder, folderpath);
        
        if (fs.existsSync(folderpath))
        {
            var paths = fs.readdirSync(folderpath);

            for(let i = 0; i < paths.length; i++)
            {
                const curPath = path.join(folderpath, paths[i]);

                if (fs.lstatSync(curPath).isDirectory())
                {
                    this.RemoveFolder(curPath,true);
                }
                else
                {
                    fs.unlinkSync(curPath);
                }
            }

            fs.rmdirSync(folderpath);
        }
    }

    public BuildFolder(folderpath: string) : void
    {
        var self = this;

        if(!fs.existsSync(path.join(builtFolder, folderpath)))
            fs.mkdirSync(path.join(builtFolder, folderpath));

        let files = fs.readdirSync(path.join(pageFolder, folderpath));

        files.forEach(function(file)
        {
            let filePath = path.join(pageFolder, folderpath, file);
            
            if(fs.statSync(filePath).isDirectory())
            {
                self.BuildFolder(path.join(folderpath, file));
            }
            else if(path.extname(filePath) == ".md")
            {
                self.BuildFile(path.join(folderpath, file));
            }
        });
    }

    private BuildFile(filePath: string) : void
    {
        let markdownText = fs.readFileSync(path.join(pageFolder, filePath)).toString();

        let compiled = kramed(markdownText, {});
        let newPath = path.join(__dirname, dirPrefix, "built-views", filePath.replace(".md",".html"));

        compiled = "<div class=\"container content is-size-4\">" + compiled +
                   "</div>";

        fs.writeFileSync(newPath, compiled);
    }

    public BuildString(str : string): string
    {
        return kramed(str,{});
    }
}

export {MarkdownBuilder};
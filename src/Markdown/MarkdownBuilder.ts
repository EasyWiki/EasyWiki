import fs from 'fs';
import path from 'path';
import highlight from "highlight.js";

const kramed : any = require("kramed");

const dirPrefix = "../..";

class MarkdownBuilder
{
    private _rederer : any

    constructor()
    {
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
            renderer: this._rederer
        });
    }

    private SetupRederer()
    {
        this._rederer.heading = function(text: string, level: number, raw:string) : string
        {
            return "<h" + level + " class='title is-" + level + "'>" + text + "</h" + level + ">";
        }

        this._rederer.table = function(header:string, body:string) : string
        {
            return '<table class="table">' + body + "</table>";
        }
    }

    public BuildAll() : void
    {
        this.BuildFolder("/");
    }

    public BuildFolder(folderpath: string) : void
    {
        var self = this;

        if(!fs.existsSync(path.join(__dirname, dirPrefix, "built-views", folderpath)))
            fs.mkdirSync(path.join(__dirname, dirPrefix, "built-views", folderpath));

        let files = fs.readdirSync(path.join(__dirname, dirPrefix, "pages", folderpath));

        files.forEach(function(file)
        {
            let filePath = path.join(__dirname, dirPrefix, "pages", folderpath, file);
            
            if(fs.statSync(filePath).isDirectory())
            {
                self.BuildFolder(path.join(folderpath, file));
            }
            else
            {
                self.BuildFile(path.join(folderpath, file));
            }
        });
    }

    public BuildFile(filePath: string) : void
    {
        let markdownText = fs.readFileSync(path.join(__dirname, dirPrefix, "pages", filePath)).toString();
        let compiled = kramed(markdownText, {});
        let newPath = path.join(__dirname, dirPrefix, "built-views", filePath.replace(".md",".html"));

        fs.writeFileSync(newPath, compiled);
    }
}

export {MarkdownBuilder};
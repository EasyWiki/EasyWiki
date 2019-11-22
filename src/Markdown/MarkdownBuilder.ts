import fs from 'fs';
import path from 'path';
import highlight from "highlight.js";
import { Logger } from '../modules/Logger';
import { Searcher } from './Searcher';
import { FileSystem } from '../modules/FileSystem';

const kramed : any = require("kramed");

const dirPrefix = "../..";
const builtFolder = path.join(__dirname, dirPrefix, "built-views");
const pageFolder = path.join(__dirname, dirPrefix, "pages");
const partialFolder = path.join(__dirname, dirPrefix, "partials");

class MarkdownBuilder
{
    public static MarkdownBuilder : MarkdownBuilder;
    private _renderer : any;
    private _menuRenderer : any;
    private _navRenderer : any;
    private _cleanRenderer : any;
    private _watcher : fs.FSWatcher | undefined;
    private _isBuilding : boolean;

    constructor()
    {
        MarkdownBuilder.MarkdownBuilder = this;
        
        this._isBuilding = false;
        this._renderer = new kramed.Renderer();
        this._menuRenderer = new kramed.Renderer();
        this._navRenderer = new kramed.Renderer();
        this._cleanRenderer = new kramed.Renderer();

        this.SetupRederer();
        this.SetupOptions();
    }

    private SetupOptions()
    {
        kramed.setOptions({
            highlight: function (code: string) {
                return highlight.highlightAuto(code).value;
            },
            renderer: this._renderer,
            breaks: false
        });
    }

    private SetupRederer()
    {
        this._renderer.heading = function(text: string, level: number, raw:string) : string
        {
            var id = text.toLowerCase().replace(/[^\w]+/g, '-');

            return "<h" + level + " id='" + id + "' class='title is-" + level + "'>" + text + "</h" + level + ">";
        }

        this._renderer.table = function(header:string, body:string) : string
        {
            return '<table class="table">' + body + "</table>";
        }

        this._menuRenderer.list = function(body: string, ordered: boolean)
        {
            return "<ul class='menu-list'>" + body + "</ul>";
        }

        this._menuRenderer.listitem = function(text: string)
        {
            return "<li>" + text + "</li>";
        }

        this._menuRenderer.paragraph = function(text: string)
        {
            return "<p class='menu-label'>" + text + "</p>";
        }

        this._menuRenderer.heading = function(text: string, level: number, raw:string) : string
        {
            return "<h1 class='title is-4'>" + text + "</h1>";
        }

        this._menuRenderer.br = Clean;

        this._navRenderer.link = function(href: string, title: number, text:string) : string
        {
            return "<a class='navbar-item' href='" + href + "'>" + text + "</a>";
        }

        this._navRenderer.paragraph = function(text: string)
        {
            return text;
        }

        this._navRenderer.br = Clean;

        this._cleanRenderer.code = Clean;
        this._cleanRenderer.blockquote = function(quote:string){return quote};
        this._cleanRenderer.html = Clean;
        this._cleanRenderer.heading = function(text: string, level: number, raw:string){return text};;
        this._cleanRenderer.hr = Clean;
        this._cleanRenderer.list = function(body: string, ordered: boolean){return body};
        this._cleanRenderer.listitem = function(txt:string){return txt};
        this._cleanRenderer.paragraph = function(txt:string){return txt + " "};
        this._cleanRenderer.table = function(txt:string,txt2:string){return txt2};
        this._cleanRenderer.tablerow = function(txt:string){return txt};
        this._cleanRenderer.tablecell = function(txt:string,flags:object){return txt};
        this._cleanRenderer.strong = function(txt:string){return txt};
        this._cleanRenderer.em = function(txt:string){return txt};
        this._cleanRenderer.codespan = function(txt:string){return txt};
        this._cleanRenderer.br = function(txt:string){return txt + " "};
        this._cleanRenderer.del = function(txt:string){return txt};
        this._cleanRenderer.link = function(txt:string,txt2:string,txt3:string){return txt3};
        this._cleanRenderer.image = Clean;

        function Clean(a:any = undefined,b:any = undefined,c:any = undefined)
        {
            return "";
        }
    }
    
    public WatchFolder()
    {
        this._watcher = fs.watch(pageFolder, {recursive: true, encoding: 'utf8', persistent: true});

        this._watcher.on("change", function(eventType, filename)
        {
            if(eventType != "change") return;
            
            MarkdownBuilder.MarkdownBuilder.BuildAll(true);
        });
    }

    public UnwatchFolder()
    {
        if(this._watcher == null) return;
        
        (this._watcher as fs.FSWatcher).close();
    }

    public async BuildAll(reindex: boolean = true)
    {
        try
        {
        this._isBuilding = true;

        Logger.Log("Markdown", "Building all markdown.");
        await this.RemoveFolder("/", false);
        this.BuildFolder("/");
        Logger.Log("Markdown", "Built all markdown.");

        if(reindex)
        {
            Searcher.Searcher.IndexAll(true);
        }

        this._isBuilding = false;
        }
        catch (e)
        {
            Logger.Error("Markdown", "Building markdown has failed.", e);
        }
    }

    public async BuildMenu()
    {
        await FileSystem.RemoveFile(path.join(partialFolder, "menu.html"));

        if(!fs.existsSync(path.join(partialFolder, "menu.md"))) return;
        

        var menuHtml = kramed(await FileSystem.ReadFile(path.join(partialFolder, "menu.md")), {
            renderer: this._menuRenderer,
            breaks: true
        });

        menuHtml = "<aside class='menu'>" + menuHtml + "</aside>";
        await FileSystem.WriteFile(path.join(partialFolder, "menu.html"), menuHtml);
    }

    public async BuildNavBar()
    {
        await FileSystem.RemoveFile(path.join(partialFolder, "navbar.html"));

        if(!fs.existsSync(path.join(partialFolder, "navbar.md"))) return;
        

        var navHtml = kramed(await FileSystem.ReadFile(path.join(partialFolder, "navbar.md")), {
            renderer: this._navRenderer,
            breaks: true
        });

        await FileSystem.WriteFile(path.join(partialFolder, "navbar.html"), navHtml);
    }

    public BuildString(str : string): string
    {
        return kramed(str,{});
    }

    public CleanString(str : string): string
    {
        return kramed(str,{renderer: this._cleanRenderer});
    }

    private async RemoveFolder(folderpath: string, absolute: boolean = false)
    {
        if(!absolute) folderpath = path.join(builtFolder, folderpath);
        await FileSystem.RemoveFolder(folderpath);
    }
    
    private BuildFolder(folderpath: string) : void
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
}

export {MarkdownBuilder};
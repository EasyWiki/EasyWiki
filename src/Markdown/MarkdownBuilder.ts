import fs, { linkSync } from 'fs';
import path from 'path';
import { Logger } from '../modules/Logger';
import { Searcher } from './Searcher';
import { FileSystem } from '../modules/FileSystem';
import IndexBuilder from './IndexBuilder';
import { JSDOM } from 'jsdom';

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

    /**
     * Setup all kramed options
     */
    private SetupOptions()
    {
        kramed.setOptions({
            renderer: this._renderer,
            breaks: false
        });
    }

    /**
     * Setup all kramed renderers
     */
    private SetupRederer()
    {
        this._renderer.heading = function(text: string, level: number, raw:string) : string
        {
            let id = text.toLowerCase().replace(/[^\w]+/g, '-');
            let size = level + 1;
            if(size >= 7) level = 6;
            
            return "<h" + level + " id='" + id + "' class='title is-" + size + "'>" + text + "</h" + level + ">";
        }

        this._renderer.table = function(header:string, body:string) : string
        {
            return '<div class="scrollbox no-y"><table class="table is-striped">' + header + body + "</table></div>";
        }
    
        this._renderer.code = function(code:string, lang:string)
        {
            code = code.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

            return "<pre class='line-numbers'><code class=' lang-" + lang + "'>" + code + "</code></pre>";
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

        this._cleanRenderer.code = function(code:string, lang:string){return code + " "};
        this._cleanRenderer.blockquote = function(quote:string){return quote + " "};
        this._cleanRenderer.html = Clean;
        this._cleanRenderer.heading = function(text: string, level: number, raw:string){return text + " "};
        this._cleanRenderer.hr = Clean;
        this._cleanRenderer.list = function(body: string, ordered: boolean){return body + " "};
        this._cleanRenderer.listitem = function(txt:string){return txt + " "};
        this._cleanRenderer.paragraph = function(txt:string){return txt + " "};
        this._cleanRenderer.table = function(txt:string,txt2:string){return txt2 + " "};
        this._cleanRenderer.tablerow = function(txt:string){return txt + " "};
        this._cleanRenderer.tablecell = function(txt:string,flags:object){return txt + " "};
        this._cleanRenderer.strong = function(txt:string){return txt + " "};
        this._cleanRenderer.em = function(txt:string){return txt + " "};
        this._cleanRenderer.codespan = function(txt:string){return txt + " "};
        this._cleanRenderer.br = function(txt:string){return txt + " "};
        this._cleanRenderer.del = function(txt:string){return txt + " "};
        this._cleanRenderer.link = function(txt:string,txt2:string,txt3:string){return txt3 + " "};
        this._cleanRenderer.image = Clean;

        function Clean(a:any = undefined,b:any = undefined,c:any = undefined)
        {
            return "";
        }
    }

    /**
     * Build all markdown files in the pages folder
     * @param reindex If true the searcher will reindex all files
     */
    public async BuildAll(reindex: boolean = true)
    {
        try
        {
            this._isBuilding = true;

            Logger.Log("Markdown", "Building all markdown.");

            await this.RemoveFolder("/", false);
            await this.BuildFolder("/");

            Logger.Log("Markdown", "Built all markdown.");

            if(reindex)
            {
                await Searcher.Searcher.IndexAll(true);
            }

            this._isBuilding = false;
        }
        catch (e)
        {
            Logger.Error("Markdown", "Building markdown has failed.", e);
        }
    }

    /**
     * Build the menu
     */
    public async BuildMenu()
    {
        await FileSystem.RemoveFile(path.join(partialFolder, "menu.html"));        

        var menuHtml = kramed(await FileSystem.ReadFile(path.join(partialFolder, "menu.md")), {
            renderer: this._menuRenderer,
            breaks: true
        });


        menuHtml = "<aside class='menu'><a class='button is-hidden-desktop'>{{translation.Show}}</a>" +
            "<div class='menu-body is-hidden-touch'>" + menuHtml + "</div></aside>";
        await FileSystem.WriteFile(path.join(partialFolder, "menu.html"), menuHtml);
    }

    /**
     * Build the navbar
     */
    public async BuildNavBar()
    {
        await FileSystem.RemoveFile(path.join(partialFolder, "navbar.html"));        

        var navHtml = kramed(await FileSystem.ReadFile(path.join(partialFolder, "navbar.md")), {
            renderer: this._navRenderer,
            breaks: true
        });

        await FileSystem.WriteFile(path.join(partialFolder, "navbar.html"), navHtml);
    }

    /**
     * Build the footer
     */
    public async BuildFooter()
    {
        await FileSystem.RemoveFile(path.join(partialFolder, "footer.html"));

        var footHtml = this.BuildString(await FileSystem.ReadFile(path.join(partialFolder, "footer.md")));
        footHtml = "</div></div></section><footer class='footer'>" +
        "<div class='content'>" + footHtml + "</div>{{{footerLinks}}} {{{sponsors}}}</footer>";

        await FileSystem.WriteFile(path.join(partialFolder, "footer.html"), footHtml);

        await FileSystem.RemoveFile(path.join(partialFolder, "footerLinks.html"));

        var linkHtml = this.BuildString(await FileSystem.ReadFile(path.join(partialFolder, "footerlinks.md")));
        linkHtml = "<section class='section'><h3 class='title is-5'>{{translation.Links}}:</h3><div class='links'>" + linkHtml;
        await FileSystem.WriteFile(path.join(partialFolder, "footerLinks.html"), linkHtml + "</div></section>");

    }

    /**
     * Build a given string
     * @param str The string to build
     */
    public BuildString(str : string): string
    {
        return kramed(str,{});
    }

    /**
     * Clean markdown tags from string
     * @param str The string to clean.
     */
    public CleanString(str : string): string
    {
        return kramed(str,{renderer: this._cleanRenderer});
    }

    /**
     * Remove a folder
     * @param folderpath The path to the folder to remove
     * @param absolute If the path is an absolute path
     */
    private async RemoveFolder(folderpath: string, absolute: boolean = false)
    {
        if(!absolute) folderpath = path.join(builtFolder, folderpath);
        await FileSystem.RemoveFolder(folderpath);
    }
    
    /**
     * Build all markdown files in folder or subfolders
     * @param folderpath The folder to build
     */
    private async BuildFolder(folderpath: string)
    {
        var self = this;
        
        if(!fs.existsSync(path.join(builtFolder, folderpath.toLowerCase())))
            fs.mkdirSync(path.join(builtFolder, folderpath.toLowerCase()));

        let files = fs.readdirSync(path.join(pageFolder, folderpath));

        for(let i = 0; i < files.length; i++)
        {
            const file = files[i];
            const filePath = path.join(pageFolder, folderpath, file);

            if(fs.statSync(filePath).isDirectory())
            {
                await self.BuildFolder(path.join(folderpath, file));
            }
            else if(path.extname(filePath) == ".md")
            {
                await self.BuildFile(path.join(folderpath, file), folderpath);
            }
        }
    }

    /**
     * Build a file
     * @param filePath The file to build
     */
    private async BuildFile(filePath: string, folderPath: string)
    {
        try
        {
            let markdownText = await FileSystem.ReadFile(path.join(pageFolder, filePath));
            const tags = this.GetTags(markdownText);

            let compiled = this.BuildString(markdownText);
            let newPath = path.join(builtFolder, filePath.replace(".md",".html").toLowerCase());

            const index = IndexBuilder.CreateIndex(compiled, tags["indexdepth"]);

            compiled = "<div class=\"container content is-size-5\">" + compiled + "</div>";
        
            try
            {

                const dom = new JSDOM(compiled);
                const document = dom.window.document;
                const title = document.getElementsByTagName("h1")[0];

                if(index != "" && !tags["noindex"])
                {
                    const $index = document.createElement('div');
                    $index.innerHTML = index;
                    $index.classList.add("index");

                    (title.parentNode as Node).insertBefore($index ,title.nextSibling);
                }

                fs.writeFileSync(newPath, document.documentElement.innerHTML);
            }
            catch(e)
            {
                Logger.Error("Mardown", `An error has occured while building ${filePath}. Using compiled html instead.`, e);
                fs.writeFileSync(newPath, compiled);
            }
        }
        catch(e)
        {
            Logger.Error("Mardown", `An error has occured while building ${filePath}`, e);
        }
    }

    private GetTags(fileText: string)
    {
        if(fileText.substr(0,"<!--".length) == "<!--")
        {
            let tagStr = fileText.substr("<!--".length).split("-->")[0];
            return JSON.parse(tagStr);
        }

        return {};
    }
}

export {MarkdownBuilder};
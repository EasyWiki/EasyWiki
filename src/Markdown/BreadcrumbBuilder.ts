import { FileSystem } from "../modules/FileSystem";
import path from 'path';
import { JSDOM } from "jsdom";
import { Logger } from "../modules/Logger";

export class BreadcrumbBuilder
{
    public static TitleMap : Map<string,string>;

    public static AddBreadcrumbsToFolder(folderPath: string)
    {
        Logger.Log("Crumbs", "Adding breadcrumbs.");

        this.TitleMap = new Map<string,string>();

        FileSystem.LoopFolder(folderPath, "/", (file, absPath, relPath, isFolder) =>
        {
            if(isFolder)
            {
                // Get Index title
                this.TitleMap.set(relPath, this.GetTitle(path.join(absPath,"index.html")));
            }
            else
            {   
                // Add breadcrumbs to the file
                try
                {
                    this.SetBreadcrumbs(absPath, this.GetTitle(absPath), relPath);
                }
                catch(e)
                {
                    Logger.Error("Crumbs", `Failed generating breadcrumbs for ${file}`, e);
                }
            }
        });

        Logger.Log("Crumbs", "Done adding breadcrumbs.");
    }

    private static GetTitle(filePath: string) : string
    {
        const html = FileSystem.ReadFileSync(filePath);
        const dom = new JSDOM(html);
        const document = dom.window.document;
        const $title = document.querySelector("h1");

        if($title) return $title.textContent as string;
        else return "";
    }

    private static SetBreadcrumbs(filePath:string, title:string, relPath:string)
    {
        // Ignore the home page
        if(relPath == path.join("/index.html")) return;

        // Create Dom objects
        const html = FileSystem.ReadFileSync(filePath);
        const dom = new JSDOM(html);
        const document = dom.window.document;
        const $title = document.querySelector("h1") as HTMLElement;

        // Create title array
        let titles = [];
        titles.push({path: relPath.substr(0, relPath.length - ".html".length), title: title});
        
        let curPath = "..";
        // If the file is an index.html make sure to leave the folder
        if(relPath.indexOf("index.html") !== -1) curPath += "/..";

        // Loop over all folders until the root folder
        while(path.join(relPath, curPath) != path.join("/"))
        {
            const sPath = path.join(relPath, curPath);
            titles.push({path:sPath,title:this.TitleMap.get(sPath) as string});

            curPath += "/..";
        }

        // Add the site title crumb
        titles.push({path:"/", title: "{{sitetitle}}"});

        // Generate the html
        let bcHtml = "<nav class='breadcrumb' aria-label='breadcrumbs'><ul>";
        titles.reverse().forEach((title) =>
        {
            if(title.path + ".html" != relPath)
                bcHtml += "<li><a href='" + title.path + "'>" + title.title + "</a></li>";
            else
                bcHtml += "<li class='is-active'><a href='" + title.path + "'>" + title.title + "</a></li>";
        });
        bcHtml += "</ul></nav>";

        // Add the html to the document
        const $crumbs = document.createElement('div');
        $crumbs.innerHTML = bcHtml;
        $crumbs.classList.add("breadcrumb-container");

        ($title.parentNode as Node).insertBefore($crumbs ,$title.nextSibling);

        // Save the document
        FileSystem.WriteFile(filePath, document.documentElement.innerHTML);
    }

}
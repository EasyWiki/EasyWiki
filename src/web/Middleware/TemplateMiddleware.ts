import fs from 'fs';
import path from 'path';

import express from 'express';
import mustache from 'mustache';
import { Theme } from '../../modules/Theme';
import { Config } from '../../modules/Config';
import { FileSystem } from '../../modules/FileSystem';

const dirPrefix = "../../..";

class TemplateMiddleware
{
    public static async AttachTemplate(req: express.Request, res: express.Response, next: express.NextFunction)
    {

        let folder = path.join(__dirname, dirPrefix, "partials");
        let body = await FileSystem.ReadFileCached(path.join(folder, "body.html"));
        let head = await FileSystem.ReadFileCached(path.join(folder, "head.html"));
        let header = await FileSystem.ReadFileCached(path.join(folder, "header.html"));
        let footer = await FileSystem.ReadFileCached(path.join(folder, "footer.html"));
        let menu = await FileSystem.ReadFileCached(path.join(folder, "menu.html"));
        let navbar = await FileSystem.ReadFileCached(path.join(folder, "navbar.html"));

        req.templateObject = new TemplateObject(body, head, header, footer, menu, navbar);

        next();
    }

    public static AttachTheme(req: express.Request, res: express.Response, next: express.NextFunction)
    {
        if(req.cookies.theme)
        {
            req.theme = Theme.GetTheme(req.cookies.theme);

            res.cookie("theme",req.cookies.theme, {secure: true, maxAge: Config.Config.Get("Style.maxAge")});
        }
        else
        {
            req.theme = Theme.GetTheme(Config.Config.Get("Style.theme"));
        }
        next();
    }
}

class TemplateObject
{
    private body : string;
    private head : string;
    private header : string;
    private footer : string;
    private menu : string;
    private navbar : string;

    constructor(body: string, head: string, header: string, footer: string, menu: string, navbar: string)
    {
        this.body = body;
        this.head = head;
        this.header = header;
        this.footer = footer;
        this.menu = menu;
        this.navbar = navbar;
    }

    public async RenderAndSend(req: express.Request, res: express.Response, view: string, params: any = {})
    {
        if(!params["theme"])
        {
            params["theme"] = req.theme.GetName();
            params["css"] = req.theme.GetCss();
        }

        // Add logo
        let logo = path.join(__dirname, dirPrefix, "public", Config.Config.Get("Style.logo"));
        if(fs.existsSync(logo))
            params["logo"] = "<img src='/" + Config.Config.Get("Style.logo") + "'>";
        else
            params["logo"] = "<h1 class='title is-3 has-text-white'>{{sitetitle}}</h1>";
        
        // Add favicon
        let favicon = path.join(__dirname, dirPrefix, "public", Config.Config.Get("Style.favicon"));
        if(fs.existsSync(favicon)) params["favicon"] = "<link rel='icon' type='image/png' href='/" + Config.Config.Get("Style.favicon") + "'>";

        params["sitetitle"] = Config.Config.Get("Style.title");

        let renderObj = this.GetRenderObject(params);
        
        renderObj = await this.RenderView(view, renderObj); 
        res.send(mustache.render(this.body, renderObj));
    }

    public GetRenderObject(params: any = {}): any
    {
        params["head"] = mustache.render(this.head, params);
        params["menu"] = mustache.render(this.menu, params);
        params["navbar"] = mustache.render(this.navbar, params);
        params["header"] = mustache.render(this.header, params);
        params["footer"] = mustache.render(this.footer, params);

        return params;
    }

    private async RenderView(view: string, renderObj: any)
    {
        view = view.toLowerCase();
        let viewPath = path.join(__dirname, dirPrefix, "views", view + ".html");
        let builtViewPath = path.join(__dirname, dirPrefix, "built-views", view + ".html");
        let builtViewFolderPath = path.join(__dirname, dirPrefix, "built-views", view);
        
        let html = "";

        if(fs.existsSync(builtViewPath))
        {
            html = await FileSystem.ReadFileCached(builtViewPath);
        }
        else if(fs.existsSync(builtViewFolderPath))
        {
            html = await FileSystem.ReadFileCached(path.join(builtViewFolderPath,"index.html"));
        }
        else
        {
            html = await FileSystem.ReadFileCached(viewPath);
        }

        renderObj["view"] = mustache.render(html, renderObj);

        return renderObj;
    }

    public ViewExists(view: string) : boolean
    {
        view = view.toLowerCase();
        let viewPath = path.join(__dirname, dirPrefix, "views", view + ".html");
        let builtViewPath = path.join(__dirname, dirPrefix, "built-views", view + ".html");
        let builtViewFolderPath = path.join(__dirname, dirPrefix, "built-views", view, "index.html");

        return fs.existsSync(builtViewPath) || fs.existsSync(builtViewFolderPath) ||
               fs.existsSync(viewPath)
    }

}

export {TemplateMiddleware, TemplateObject};
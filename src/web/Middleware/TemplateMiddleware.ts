import fs from 'fs';
import path from 'path';

import express from 'express';
import mustache from 'mustache';
import { Theme } from '../../modules/Theme';
import { Config } from '../../modules/Config';
import { FileSystem } from '../../modules/FileSystem';
import { JSDOM } from 'jsdom';

const dirPrefix = "../../..";

class TemplateMiddleware
{
    /**
     * Attach a template to the express request
     */
    public static async AttachTemplate(req: express.Request, res: express.Response, next: express.NextFunction)
    {
        let folder = path.join(__dirname, dirPrefix, "partials");
        let body = await FileSystem.ReadFileCached(path.join(folder, "body.html"));
        let head = await FileSystem.ReadFileCached(path.join(folder, "head.html"));
        let header = await FileSystem.ReadFileCached(path.join(folder, "header.html"));
        let imageViewer = await FileSystem.ReadFileCached(path.join(folder, "imageViewer.html"));
        let footer = await FileSystem.ReadFileCached(path.join(folder, "footer.html"));
        let menu = await FileSystem.ReadFileCached(path.join(folder, "menu.html"));
        let navbar = await FileSystem.ReadFileCached(path.join(folder, "navbar.html"));
        let footerNavbar = await FileSystem.ReadFileCached(path.join(folder, "footer-nav.html"));

        req.templateObject = new TemplateObject(body, head, header, imageViewer,
             footer, menu, navbar, footerNavbar);

        next();
    }

    /**
     * Attach a theme to the express request
     */
    public static AttachTheme(req: express.Request, res: express.Response, next: express.NextFunction)
    {
        if(req.cookies.theme)
        {
            req.theme = Theme.GetTheme(req.cookies.theme);

            res.cookie("theme", req.cookies.theme, {secure: true, maxAge: Config.Config.Get("Style.maxAge")});

            if(req.cookies.accent)
            {
                req.accent = req.cookies.accent;
                res.cookie("accent", req.cookies.accent, {secure: true, maxAge: Config.Config.Get("Style.maxAge")});
            }
            else
            {
                req.accent = req.theme.GetDefaultAccent();
            }

        }
        else
        {
            req.theme = Theme.GetTheme(Config.Config.Get("Style.theme"));
            req.accent = req.theme.GetDefaultAccent();
        }

        next();
    }
}

class TemplateObject
{
    private body : string;
    private head : string;
    private header : string;
    private imageViewer : string;
    private footer : string;
    private menu : string;
    private navbar : string;
    private footerNavbar : string;

    constructor(body: string, head: string, header: string, imageViewer: string,
        footer: string, menu: string, navbar: string, footerNavbar: string)
    {
        this.body = body;
        this.head = head;
        this.header = header;
        this.imageViewer = imageViewer;
        this.footer = footer;
        this.menu = menu;
        this.navbar = navbar;
        this.footerNavbar = footerNavbar;
    }

    public async Render(req: express.Request, view: string, params: any = {})
    {
        //Deep copy
        params = Object.create(params);

        params["path"] = req.url;
        params["sitetitle"] = Config.Config.Get("Style.title");

        params["translation"] = Config.Translation.GetJson();

        params["analytics"] = Config.Config.Get("Web.analytics");

        if(!params["theme"])
        {
            params["theme"] = req.theme.GetName();
            params["css"] = req.theme.GetCss(req.accent);
        }

        let titleText = mustache.render("<h1 class='title is-3 has-text-white'>{{sitetitle}}</h1>" ,params);

        // Add logo
        if(Config.Config.Get("Style.logo"))
        {
            let logo = path.join(__dirname, dirPrefix, "public", Config.Config.Get("Style.logo"));
            
            if(fs.existsSync(logo))
            {
                params["logo"] = "<img src='/" + Config.Config.Get("Style.logo") + "'>";
                params["logo"] += titleText;
            }
        }

        if(!params["logo"]) params["logo"] = titleText;
        
        // Add favicon
        let favicon = path.join(__dirname, dirPrefix, "public", Config.Config.Get("Style.favicon"));
        if(fs.existsSync(favicon)) params["favicon"] = "<link rel='icon' type='image/png' href='/" + Config.Config.Get("Style.favicon") + "'>";
        
        params = await this.RenderView(view, params); 
        return mustache.render(this.body, params);
    }

    public async RenderAndSend(req: express.Request, res: express.Response, view: string, params: any = {}, code = 200)
    {
        res.status(code).send(await this.Render(req,view,params));
    }

    public GetRenderObject(params: any = {}): any
    {
        params["head"] = mustache.render(this.head, params);
        params["menu"] = mustache.render(this.menu, params);
        params["navbar"] = mustache.render(this.navbar, params);
        params["header"] = mustache.render(this.header, params);
        params["image-viewer"] = mustache.render(this.imageViewer, params);
        //params["footerNavbar"] = mustache.render(this.footerNavbar, params);
        params["footer"] = mustache.render(this.footer, params);

        return params;
    }

    private async RenderView(view: string, params: any)
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

        if(!params["title"])
        {
            let doc = new JSDOM(html);
            let title = doc.window.document.querySelector(".title");

            if(title) params["title"] = title.textContent;
            else
            {
                let split = params["path"].split("/");
                params["title"] = split[split.length -1];
            }
        }

        let renderObj = this.GetRenderObject(params);
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
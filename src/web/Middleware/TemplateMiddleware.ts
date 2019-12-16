import fs from 'fs';
import path from 'path';

import express from 'express';
import mustache from 'mustache';
import { Theme } from '../../modules/Theme';
import { Config } from '../../modules/Config';
import { FileSystem } from '../../modules/FileSystem';
import { JSDOM } from 'jsdom';
import Sponsors from '../../modules/Sponsors';
import CookieMiddleware from './CookieMiddleware';

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
        let footerLinks = await FileSystem.ReadFileCached(path.join(folder, "footerLinks.html"));
        let menu = await FileSystem.ReadFileCached(path.join(folder, "menu.html"));
        let navbar = await FileSystem.ReadFileCached(path.join(folder, "navbar.html"));

        const params = {
            body: body,
            head: head,
            header: header,
            imageViewer: imageViewer,
            footer: footer,
            footerLinks: footerLinks,
            menu: menu,
            navbar: navbar 
        }

        req.templateObject = new TemplateObject(params);

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

            if(!req.theme)
            {
                req.theme = Theme.GetTheme(Config.Config.Get("Style.theme"));

                req.cookies.accent = req.theme.GetDefaultAccent();
                CookieMiddleware.SetCookie("accent", req.theme.GetDefaultAccent(), res);
            }

            CookieMiddleware.SetCookie("theme", req.theme.GetId(), res);

            if(req.cookies.accent)
            {
                req.accent = req.cookies.accent;

                if(req.theme.GetAccents().indexOf(req.accent) == -1)
                {
                    req.accent = req.theme.GetDefaultAccent();
                }
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
    private _params : any;

    constructor(params: any)
    {
        this._params = params;
    }

    public async Render(req: express.Request, view: string, params: any = {})
    {
        //Deep copy
        params = Object.create(params);

        params["meta"] = this.GenerateMeta();
        params["path"] = req.url;
        params["sitetitle"] = Config.Config.Get("Style.title");
        
        params["translation"] = Config.Translation.GetJson();

        params["sponsors"] = mustache.render(Sponsors.Sponsors.GetHtml(), params);
        
        params["analytics"] = this.GenerateAnalytics(req);

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
        return mustache.render(this._params["body"], params);
    }

    public async RenderAndSend(req: express.Request, res: express.Response, view: string, params: any = {}, code = 200)
    {
        res.status(code).send(await this.Render(req,view,params));
    }

    public GetRenderObject(params: any = {}): any
    {
        params["head"] = mustache.render(this._params["head"], params);
        params["menu"] = mustache.render(this._params["menu"], params);
        params["navbar"] = mustache.render(this._params["navbar"], params);
        params["header"] = mustache.render(this._params["header"], params);
        params["image-viewer"] = mustache.render(this._params["imageViewer"], params);
        params["footerLinks"] = mustache.render(this._params["footerLinks"], params);

        const currKeys = Object.keys(params);
        Object.keys(this._params).forEach((key) =>
        {
            if(currKeys.indexOf(key) == -1)
            {
                params[key] = this._params[key];
            }
        });

        params["footer"] = mustache.render(this._params["footer"], params);

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

    public GenerateMeta() : string
    {
        const cache = FileSystem.GetCache("meta");

        if(cache)
        {
            return cache as string;
        }

        const desc = Config.Meta.Get("description");
        const keywords = Config.Meta.Get("keywords");
        const copy = Config.Meta.Get("copyright");
        const language = Config.Meta.Get("language");
        const robots = Config.Meta.Get("robots");
        const rating = Config.Meta.Get("rating");

        return `<meta name="description" content="${desc}">` + 
                    `<meta name="copyright" content="${copy}">` + 
                    `<meta name="language" content="${language}">` + 
                    `<meta name="robots" content="${robots}">` + 
                    `<meta name="rating" content="${rating}">` + 
                    `<meta name="keywords" content="${keywords.join(",")}">`;
    }

    public GenerateAnalytics(req: express.Request) : string
    {
        const accepted = req.cookies["accepted"];

        if(accepted == "minimal")
        {
            return "";
        }
        else
        {
            return '<script async src="https://www.googletagmanager.com/gtag/js?id=' + 
                Config.Config.Get("Web.analytics") + '"></script>' + 
                "<script>window.dataLayer = window.dataLayer || [];" +
                "function gtag(){dataLayer.push(arguments);}gtag('js', new Date());gtag('config', '" +
                Config.Config.Get("Web.analytics") + "');</script>";
        }
    }
}

export {TemplateMiddleware, TemplateObject};
import fs from 'fs';
import path from 'path';

import express from 'express';
import mustache from 'mustache';
import { Theme } from '../../modules/Theme';
import { Config } from '../../modules/Config';

const dirPrefix = "../../..";

class TemplateMiddleware
{
    public static AttachTemplate(req: express.Request, res: express.Response, next: express.NextFunction)
    {

        let folder = path.join(__dirname, dirPrefix, "partials");
        let body = fs.readFileSync(path.join(folder, "body.html")).toString();
        let head = fs.readFileSync(path.join(folder, "head.html")).toString();
        let header = fs.readFileSync(path.join(folder, "header.html")).toString();
        let footer = fs.readFileSync(path.join(folder, "footer.html")).toString();

        req.templateObject = new TemplateObject(body, head, header, footer);

        next();
    }

    public static AttachTheme(req: express.Request, res: express.Response, next: express.NextFunction)
    {
        req.theme = Theme.GetTheme(Config.Config.Get("Style.theme"));
        next();
    }
}

class TemplateObject
{
    private body: string;
    private head: string;
    private header: string;
    private footer: string;

    constructor(body: string, head: string, header: string, footer: string)
    {
        this.body = body;
        this.head = head;
        this.header = header;
        this.footer = footer;
    }

    public RenderAndSend(req: express.Request, res: express.Response, view: string, params: any = {})
    {
        if(!params["theme"])
        {
            params["theme"] = req.theme.GetName();
            params["syntax"] = req.theme.IsLightmode() ? "syntax-light.css" : "syntax-dark.css";
            params["css"] = req.theme.GetCss();
        }

        params["sitetitle"] = Config.Config.Get("Style.title");

        let renderObj = this.GetRenderObject(params);
        
        renderObj = this.RenderView(view, renderObj); 
        res.send(mustache.render(this.body, renderObj));
    }

    public GetRenderObject(params: any = {}): any
    {
        params["head"] = mustache.render(this.head,params);
        params["header"] = mustache.render(this.header,params);
        params["footer"] = mustache.render(this.footer,params);

        return params;
    }

    private RenderView(view: string, renderObj: any)
    {
        let viewPath = path.join(__dirname, dirPrefix, "views", view + ".html");
        let builtViewPath = path.join(__dirname, dirPrefix, "built-views", view + ".html");
        let builtViewFolderPath = path.join(__dirname, dirPrefix, "built-views", view);
        
        let html = "";

        if(fs.existsSync(builtViewPath))
        {
            html = fs.readFileSync(builtViewPath).toString();
        }
        else if(fs.existsSync(builtViewFolderPath))
        {
            html = fs.readFileSync(path.join(builtViewFolderPath,"index.html")).toString();
        }
        else
        {
            html = fs.readFileSync(viewPath).toString();
        }

        renderObj["view"] = mustache.render(html, renderObj);

        return renderObj;
    }

    public ViewExists(view: string) : boolean
    {
        let viewPath = path.join(__dirname, dirPrefix, "views", view + ".html");
        let builtViewPath = path.join(__dirname, dirPrefix, "built-views", view + ".html");
        let builtViewFolderPath = path.join(__dirname, dirPrefix, "built-views", view, "index.html");

        return fs.existsSync(builtViewPath) || fs.existsSync(builtViewFolderPath) ||
               fs.existsSync(viewPath)
    }

}

export {TemplateMiddleware, TemplateObject};
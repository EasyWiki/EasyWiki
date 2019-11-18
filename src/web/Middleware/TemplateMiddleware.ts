import fs from 'fs';
import path from 'path';

import express from 'express';
import mustache from 'mustache';

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
        req.theme = "light";
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
            params["theme"] = req.theme;

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
        let html = fs.readFileSync(path.join(__dirname, dirPrefix, "views", view + ".html")).toString();
        renderObj["view"] = mustache.render(html, renderObj);

        return renderObj;
    }

}

export {TemplateMiddleware, TemplateObject};
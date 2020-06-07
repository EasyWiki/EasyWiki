import express from 'express';
import { Config } from '../../modules/Config';

class RedirectMiddleware
{
    public static async Redirect(req: express.Request, res: express.Response, next: express.NextFunction)
    {
        const forceurl = Config.Get("config").Web.forceurl;

        if(req.hostname != forceurl && (forceurl != "" && forceurl))
        {
            res.redirect("https://" + forceurl + req.path);
            res.end();
        }
        else
        {
            next();
        }
    }
}

export = RedirectMiddleware;
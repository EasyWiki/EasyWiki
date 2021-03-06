import express from 'express';
import { Config } from '../../modules/Config';

export class CookieMiddleWare
{
    public static RefreshCookies(req: express.Request, res: express.Response, next: express.NextFunction)
    {
        const date = new Date();
        date.setDate(date.getDate() + Config.Get("config").Web.cookieTTL);

        Object.keys(req.cookies).forEach((key) =>
        {
            CookieMiddleWare.SetCookie(key, req.cookies[key], res, date);
        });

        next();
    }

    public static SetCookie(key: string, value: string, res: express.Response, date: Date | undefined = undefined)
    {
        if(!date)
        {
            date = new Date();
            date.setDate(date.getDate() + Config.Get("config").Web.cookieTTL);
        }

        res.cookie(key, value, {
            sameSite: "strict",
            expires: date,
            secure: true
        });
    }
}
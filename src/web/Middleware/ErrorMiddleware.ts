import express from 'express';
import { Logger } from '../../modules/Logger';

class ErrorMiddleware
{
    public static HandleError(err: Error, req: express.Request, res: express.Response, next: express.NextFunction)
    {
        Logger.Error("web",err.message,err);

        req.templateObject.RenderAndSend(req, res.status(500), "error",{
            title: "Error",
            "description": "An error has occured!",
            "subtext": "If this error keeps happening, contact an admin."
        });

        next();   
    }
}

export {ErrorMiddleware};
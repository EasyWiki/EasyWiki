import express from 'express';
import { Logger } from '../../modules/Logger';
import { Config } from '../../modules/Config';

class ErrorMiddleware
{
    public static HandleError(err: Error, req: express.Request, res: express.Response, next: express.NextFunction)
    {
        Logger.Error("web",err.message,err);

        req.templateObject.RenderAndSend(req, res, "error",
                    Config.GetProperty("translation", "ErrorPages.500"), 500);
            
        next();   
    }
}

export {ErrorMiddleware};
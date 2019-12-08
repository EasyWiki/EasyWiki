import {Logger} from "../../modules/Logger";
import express from 'express';

class LoggerMiddleware
{
    public static LogRoute(req: express.Request, res: express.Response, next: express.NextFunction)
    {
        Logger.Log("Web",req.ip + " -> " + req.path);
        next();   
    }

    public static LogBody(req: express.Request, res: express.Response, next: express.NextFunction)
    {
        if(Object.keys(req.body).length > 0)
            Logger.Log("Web", "Body: " + JSON.stringify(req.body));
        next();   
    }
}

export {LoggerMiddleware};
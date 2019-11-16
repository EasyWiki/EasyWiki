import {Logger} from "../../modules/Logger";
import express from 'express';

class LoggerMiddleware
{
    public static LogRoute(req: express.Request, res: express.Response, next: express.NextFunction)
    {
        Logger.Log("Web",req.ip + " -> " + req.path);
        next();   
    }
}

export {LoggerMiddleware};
import express from 'express';
import basicAuth from 'express-basic-auth';
import { Config } from '../../modules/Config';
import { Logger } from '../../modules/Logger';

class AuthenticationMiddleware
{
    public static async Authenticate(req: express.Request, res: express.Response, next: express.NextFunction)
    {
        if(req.path == "/refresh")
        {
            basicAuth({
                users: Config.Config.Get("Web.users"),
                challenge: true
            })(req,res,next);
        }
        else
        {
            next();
        }
    }

    public static Create401Error(req: express.Request)
    {
        Logger.Error("Auth", req.ip +  " tried to login!");

        return  "";
    }
}

export = AuthenticationMiddleware;
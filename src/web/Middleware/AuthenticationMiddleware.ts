import express from 'express';
import basicAuth from 'express-basic-auth';
import { Config } from '../../modules/Config';
import { Logger } from '../../modules/Logger';

class AuthenticationMiddleware
{
    public static async Authenticate(req: express.Request, res: express.Response, next: express.NextFunction)
    {
        if(req.path == "/refresh" || req.path == "/version")
        {
            basicAuth({
                users: Config.Get("config").Web.users,
                challenge: true,
                unauthorizedResponse: await AuthenticationMiddleware.Create401Error(req)
            })(req,res,next);
        }
        else
        {
            next();
        }
    }

    private static async Create401Error(req: express.Request)
    {
        Logger.Error("Auth", req.ip +  " tried to login and failed!");

        return req.templateObject.Render(req, "error", {description: "401: Unauthorized", 
            subtitle: "You made a failed login attempt!", text: "This event will be reported!"})
    }
}

export = AuthenticationMiddleware;
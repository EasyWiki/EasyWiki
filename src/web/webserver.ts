import fs from 'fs';
import path from 'path';
import express from "express";
import https from "https";
import cookieParser from "cookie-parser";
import createError from 'http-errors';
import mustacheExpress from 'mustache-express';
import mustache from 'mustache';

import { LoggerMiddleware } from './Middleware/LoggerMiddleware';

import {Config} from "../modules/Config";

class Web
{
    private _app : express.Application;
    private _server : https.Server;
    private _config : Config;

    constructor(config : Config)
    {
        this._config = config;

        this._app = express();
        this._server = https.createServer(this.GetSslCertificate(), 
            this._app).listen(config.Get("Web.port"));

        this.RegisterMiddleware();
        this.RegisterRoutes();
    }

    /**
     * Register all express middleware
     */
    private RegisterMiddleware()
    {
        // Setup Render engine
        this._app.engine('html', mustacheExpress());
        this._app.set('view engine', 'html');
        this._app.set('views', path.join(__dirname, '../..', 'views'));
        
        // Set up middleware
        this._app.use(LoggerMiddleware.LogRoute);
        
        this._app.use(express.json());
        this._app.use(express.urlencoded({extended: false}));

        this._app.use(cookieParser(this._config.Get("Web.cookieSecret")));
        
        //this._app.use(DarkModeMiddleware.SetStyle);
        
        this._app.use(express.static(path.join(__dirname, "../..", 'public')));
    }

    /**
     * Register all express routes
     */
    private RegisterRoutes() : void
    {
        var self = this;

        this._app.all("/",function(req,res)
        {
            res.render("index",self.GetDefaultRenderOptions(req));
        });

        /*this._app.all("/dark", DarkModeMiddleware.SwitchDark);
        this._app.all("/light", DarkModeMiddleware.SwitchLight);*/
        this._app.all("/clock", function(req, res)
        {
            res.render("clock", self.GetDefaultRenderOptions(req));
        });

        this._app.all("/settings", function(req, res)
        {
            res.render("settings", self.GetDefaultRenderOptions(req));
        });

        this._app.use(function(req, res, next)
        {
            next(createError(404));
        });
    }

    /**
     * Generate the default options.
     * @param obj A default options object.
     */
    private GetDefaultRenderOptions(req : express.Request, obj : any = {})
    {
        /*obj["style"] = req.style;
        obj["styleMode"] = req.styleMode;
        obj["altStyleMode"] = req.altStyleMode;*/

        var folder = path.join(__dirname, "../..", "partials");
        var head = fs.readFileSync(path.join(folder, "head.html")).toString();
        var header = fs.readFileSync(path.join(folder, "header.html")).toString();
        var footer = fs.readFileSync(path.join(folder, "footer.html")).toString();

        obj["head"] = mustache.render(head,obj);
        obj["header"] = mustache.render(header,obj);
        obj["footer"] = mustache.render(footer,obj);

        return obj;
    }

    private GetSslCertificate() : https.ServerOptions
    {
        var cert = fs.readFileSync(path.join(__dirname , "../.." , this._config.Get("Web.ssl.cert")));
        var key = fs.readFileSync(path.join(__dirname ,  "../../" , this._config.Get("Web.ssl.key")));

        var options : https.ServerOptions = {key:key.toString(),cert:cert.toString(),"passphrase": ""};

        return options;
    }
}

export {Web};
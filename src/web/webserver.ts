import fs from 'fs';
import path from 'path';
import express from "express";
import https from "https";
import cookieParser from "cookie-parser";
import createError from 'http-errors';

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
            req.templateObject.RenderAndSend(res, "index", {title: "EasyWiki"});
        });

        this._app.use(function(req, res, next)
        {
            next(createError(404));
        });
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
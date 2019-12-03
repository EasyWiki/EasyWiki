import fs from 'fs';
import path from 'path';
import express from "express";
import socketio from "socket.io";
import https from "https";
import http from "http";
import cookieParser from "cookie-parser";

import { LoggerMiddleware } from './Middleware/LoggerMiddleware';

import {Config} from "../modules/Config";
import { TemplateMiddleware } from './Middleware/TemplateMiddleware';
import { Logger } from '../modules/Logger';
import { ErrorMiddleware } from './Middleware/ErrorMiddleware';
import { Gitter } from '../Markdown/Gitter';
import { Searcher } from '../Markdown/Searcher';
import { Theme } from '../modules/Theme';
import { FileSystem } from '../modules/FileSystem';
import AuthenticationMiddleware from './Middleware/AuthenticationMiddleware';

class Web
{
    private _app : express.Application;
    private _server : https.Server;
    private _http : http.Server;
    private _io : socketio.Server;

    constructor()
    {
        Logger.Log("Web", "Starting web server...");

        // Start the web server
        this._app = express();
        this._server = https.createServer(this.GetSslCertificate(), 
            this._app).listen(Config.Config.Get("Web.port"));
        
        // Start the socket server
        this._io = socketio(this._server);

        // Start the http redirect server
        this._http = http.createServer(function (req, res)
        {
            Logger.Log("Web",req.socket.remoteAddress + " -> https");
            res.writeHead(301, { "Location": "https://" + req.headers['host'] + req.url });
            res.end();
        }).listen(Config.Config.Get("Web.httpport"));

        // Register
        this.RegisterMiddleware();
        this.RegisterRoutes();
        this.RegisterSocketIO();

        Logger.Log("Web","The server started on port " + Config.Config.Get("Web.port") + ".");
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

        this._app.use(cookieParser(Config.Config.Get("Web.cookieSecret")));
        
        this._app.use(TemplateMiddleware.AttachTemplate);
        this._app.use(TemplateMiddleware.AttachTheme);
        
        this._app.use(AuthenticationMiddleware.Authenticate);
        
        this._app.use(express.static(path.join(__dirname, "../..", 'public')));
    }

    /**
     * Register all express routes
     */
    private RegisterRoutes() : void
    {
        var self = this;

        this._app.all("/", async function(req,res)
        {
            req.templateObject.RenderAndSend(req, res, "index", {title: "Home"});
        });

        this._app.get("/themes", async function(req, res)
        {
            const themes = Theme.themes;
            let html = '';

            for(let i = 0; i < themes.length; i++)
            {
                const theme = themes[i];

                html += '<div class="radio-control">';
                html += '<input class="is-checkradio is-medium" id="' + 
                    theme.GetId() + '" type="radio" name="theme" value="' + theme.GetId() + '" ';
                if(theme.GetId() == req.theme.GetId())
                    html += 'checked="checked"';
                html += '>'
                html += '<label for="' + theme.GetId() + '">';
                html += theme.GetName() + ' ';

                if(theme.IsLightmode())
                    html += '<span class="tag is-light">Light</span>';
                else
                    html += '<span class="tag is-dark">Dark</span>';

                html += '</label></div>';
            }

            req.templateObject.RenderAndSend(req, res, "themes", {title: "Theme", themes: html});
        });

        this._app.post("/themes", async function(req, res)
        {
            res.cookie("theme",req.body.theme,{secure: true, maxAge: Config.Config.Get("Style.maxAge")});
            res.redirect("/themes");
        });
        
        this._app.all("/refresh", async function(req,res)
        {
            await Gitter.Gitter.CloneRepo();
            FileSystem.ClearAllCache();
            res.redirect("/");
        });

        this._app.all("/(:view)*", async function(req,res)
        {
            var view = req.params.view + req.params["0"];
            if(req.templateObject.ViewExists(view))
            {
                req.templateObject.RenderAndSend(req, res, view, {});
            }
            else
            {
                req.templateObject.RenderAndSend(req,res.status(404),"error",
                    Config.Config.Get("Web.errorPages.404"));
            }
            
        });

        this._app.all("*", async function(req,res)
        {
            req.templateObject.RenderAndSend(req,res.status(404),"error",
                    Config.Config.Get("Web.errorPages.404"));
        });

        this._app.use(ErrorMiddleware.HandleError);
    }

    /**
     * Register all Socket io events
     */
    private RegisterSocketIO() : void
    {
        this._io.on("connect", async function(socket)
        {
            socket.on("search", async function(query)
            {
                const data = await Searcher.Searcher.Find(query);
                let html = "<table class='table is-striped is-hoverable is-fullwidth'>";
                
                for(let i = 0; i < data.length; i++)
                {
                    const page = data[i].split('.md')[0];

                    html += "<tr class='result'><td><a href='" + page + "'>";
                    html += "<p class='has-text-weight-bold is-size-5 search-title'>" + page + "</p>";
                    //html += "<p class='search-text'>" + page.data + "</p></a></td>";
                }

                socket.emit("search", html);
            });
        });
    }

    /**
     * Read the ssl certificates
     */
    private GetSslCertificate() : https.ServerOptions
    {
        var cert = fs.readFileSync(path.join(__dirname , "../.." , Config.Config.Get("Web.ssl.cert")));
        var key = fs.readFileSync(path.join(__dirname ,  "../../" , Config.Config.Get("Web.ssl.key")));

        var options : https.ServerOptions = {key:key.toString(),cert:cert.toString(),"passphrase": ""};

        return options;
    }
}

export {Web};
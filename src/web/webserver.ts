import fs from 'fs';
import path from 'path';
import express from "express";
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
import { AuthenticationMiddleware } from './Middleware/AuthenticationMiddleware';
import { RedirectMiddleware } from './Middleware/RedirectMiddleware';
import { CookieMiddleWare } from './Middleware/CookieMiddleware';

class Web
{
    private _app : express.Application;
    private _server : https.Server | http.Server;
    private _http : http.Server;

    constructor()
    {
        Logger.Log("Web", "Starting web server...");

        // Start the web server
        this._app = express();

        let port : number = Config.Get("config").Web.port;
        
        if(Config.Get("config").Web.ssl.use)
        {
            this._server = https.createServer(this.GetSslCertificate(), 
            this._app).listen(port);

            // Start the http redirect server
            this._http = http.createServer(function (req, res)
            {
                Logger.Log("Web",req.socket.remoteAddress + " -> https");
                res.writeHead(301, { "Location": "https://" + req.headers['host'] + req.url });
                res.end();
            }).listen(Config.Get("config").Web.httpport);
        }
        else
        {
            port = Config.Get("config").Web.httpport;
            this._server = http.createServer(this._app).listen(port);
            this._http = this._server;
        }

        // Register
        this.RegisterMiddleware();
        this.RegisterRoutes();

        Logger.Log("Web","The server started on port " + port + ".");

        // Send PM2 signal
        if(process.send)(process.send as Function)('ready'); 
    }

    public StopServer()
    {
        this._server.close();
        this._http.close();
    }

    /**
     * Register all express middleware
     */
    private RegisterMiddleware()
    {        
        // Set up middleware
        this._app.disable('x-powered-by');

        this._app.use(LoggerMiddleware.LogRoute);
        this._app.use(RedirectMiddleware.Redirect);
        
        this._app.use(express.json());
        this._app.use(express.urlencoded({extended: false}));

        this._app.use(LoggerMiddleware.LogBody);

        this._app.use(cookieParser(Config.Get("config").Web.cookieSecret));
        
        this._app.use(TemplateMiddleware.AttachTemplate);
        this._app.use(TemplateMiddleware.AttachTheme);
        
        this._app.use(AuthenticationMiddleware.Authenticate);
        
        this._app.use(express.static(path.join(__dirname, "../..", 'public')));
        
        this._app.use(CookieMiddleWare.RefreshCookies);
        this._app.use(ErrorMiddleware.HandleError);
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
            let themeHtml = '';

            for(let i = 0; i < themes.length; i++)
            {
                const theme = themes[i];

                themeHtml += '<div class="radio-control">';
                themeHtml += '<input class="is-checkradio is-medium" id="' + 
                    theme.GetId() + '" type="radio" name="theme" value="' + theme.GetId() + '" ';
                if(theme.GetId() == req.theme.GetId())
                    themeHtml += 'checked="checked"';
                themeHtml += '>'
                themeHtml += '<label for="' + theme.GetId() + '">';
                themeHtml += theme.GetName() + ' ';

                if(theme.IsLightmode())
                    themeHtml += '<span class="tag is-light">Light</span>';
                else
                    themeHtml += '<span class="tag is-dark">Dark</span>';

                themeHtml += '</label></div>';
            }

            let accents = req.theme.GetAccents();

            let accentHtml = "";
            for(let i = 0; i < accents.length; i++)
            {
                const accent = accents[i];

                accentHtml += '<div class="radio-control">';
                accentHtml += '<input class="is-checkradio is-medium" id="' + 
                    accent + '" type="radio" name="accent" value="' + accent + '" ';
                if(accent == req.accent)
                    accentHtml += 'checked="checked"';
                accentHtml += '>'
                accentHtml += '<label for="' + accent + '">';
                accentHtml += accent + ' ';

                accentHtml += '</label></div>';
            }

            req.templateObject.RenderAndSend(req, res, "themes", {title: "Theme", themes: themeHtml, accent: accentHtml});
        });

        this._app.post("/themes", async function(req, res)
        {
            CookieMiddleWare.SetCookie("theme",req.body.theme, res);
            CookieMiddleWare.SetCookie("accent",req.body.accent, res);

            res.redirect("/themes");
        });

        this._app.post("/themes/accents", async function(req, res)
        {
            const theme = Theme.GetTheme(req.body.theme);
            const accents = theme.GetAccents();

            if(accents.indexOf(req.accent) == -1) req.accent = theme.GetDefaultAccent();

            let accentHtml = "";
            for(let i = 0; i < accents.length; i++)
            {
                const accent = accents[i];

                accentHtml += '<div class="radio-control">';
                accentHtml += '<input class="is-checkradio is-medium" id="' + 
                    accent + '" type="radio" name="accent" value="' + accent + '" ';
                if(accent == req.accent)
                    accentHtml += 'checked="checked"';
                accentHtml += '>'
                accentHtml += '<label for="' + accent + '">';
                accentHtml += accent + ' ';

                accentHtml += '</label></div>';
            }

            res.send(accentHtml);
        });
        
        this._app.all("/refresh", async function(req,res)
        {
            await Gitter.Gitter.CloneRepo();
            FileSystem.ClearAllCache();
            res.redirect("/");
        });

        this._app.all("/version", async function(req, res)
        {
            const ver = JSON.parse(fs.readFileSync("package.json").toString()).version;
            req.templateObject.RenderAndSend(req, res, "version", {version: ver}, 200)
        });

        this._app.post("/search", async function(req, res)
        {
            const query = decodeURIComponent(req.body["query"]);

            const data = await Searcher.Searcher.Find(query);
            let html = "<table class='table is-striped is-hoverable is-fullwidth'>";
            
            for(let i = 0; i < data.length; i++)
            {
                const page = data[i].split('.md')[0];

                html += "<tr class='result'><td><a href='" + page + "'>";
                html += "<p class='has-text-weight-bold search-title'>" + page + "</p>";
            }
            res.send(html);
        });

        this._app.post("/translation", async function(req,res)
        {
            res.contentType("text").send(Config.GetProperty("translation", req.body.translation));
        });

        this._app.get("/error", async function(req, res)
        {
            req.templateObject.RenderAndSend(req, res, "error",
                    Config.GetProperty("translation", "ErrorPages.500"), 500);
        });

        this._app.all("/(:view)*", async function(req,res)
        {
            const view = req.params.view + req.params["0"];

            if(req.templateObject.ViewExists(view))
            {
                req.templateObject.RenderAndSend(req, res, view, {});
            }
            else
            {
                req.templateObject.RenderAndSend(req, res, "error",
                    Config.GetProperty("translation", "ErrorPages.404"),404);
            }
            
        });
    }

    /**
     * Read the ssl certificates
     */
    private GetSslCertificate() : https.ServerOptions
    {
        var cert = fs.readFileSync(Config.Get("config").Web.ssl.cert);
        var key = fs.readFileSync(Config.Get("config").Web.ssl.key);

        var options : https.ServerOptions = {key:key.toString(),cert:cert.toString(),"passphrase": ""};

        return options;
    }
}

export {Web};
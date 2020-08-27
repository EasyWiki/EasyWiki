import { Web } from "./web/webserver";
import { Config } from "./modules/Config";
import { MarkdownBuilder } from "./Markdown/MarkdownBuilder";
import { Theme } from "./modules/Theme";
import { Searcher } from "./Markdown/Searcher";
import { Gitter } from "./Markdown/Gitter";
import { Timer } from "./modules/Timer";
import { Logger } from "./modules/Logger";
import {Sponsors} from "./modules/Sponsors";

// Start the server asynchrously
StartServer();

/**
 * Async function that starts the server
 */
async function StartServer()
{
    // Create a log file for the logger
    Logger.CreateLogFile();

    Logger.Log("App", "Starting EasyWiki...");

    Sponsors.Load();

    // Create the searcher and markdownbuilder objects
    const search = new Searcher();
    const md = new MarkdownBuilder();

    // Clone everything from the git and build the markdown
    const gitter = new Gitter();
    if(Config.Get("config").Gitter.cloneOnStart) await gitter.CloneRepo();

    // Index all markdown files
    if(Config.Get("config").Gitter.cloneOnStart) await search.IndexAll();
    else search.LoadIndexFiles();

    // Create a timer to refresh the files from the git
    let gitTimer : Timer;
    if(Config.Get("config").Gitter.timeout)
    {
        gitTimer = new Timer(gitter.CloneRepo, Config.Get("config").Gitter.timeout);
        gitTimer.Start();
    }

    // Load all themes
    Theme.LoadThemes();

    // Create the webserver
    const web = new Web();

    process.on('SIGINT', function()
    {
        if(gitTimer) gitTimer.Stop();
        web.StopServer();
    });
}

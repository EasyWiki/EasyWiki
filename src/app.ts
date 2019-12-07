import { Web } from "./web/webserver";
import { Config } from "./modules/Config";
import { MarkdownBuilder } from "./Markdown/MarkdownBuilder";
import { Theme } from "./modules/Theme";
import { Searcher } from "./Markdown/Searcher";
import { Gitter } from "./Markdown/Gitter";
import { Timer } from "./modules/Timer";
import { Logger } from "./modules/Logger";

// Start the server asynchrously
StartServer();

/**
 * Async function that starts the server
 */
async function StartServer()
{
    // Create a log file for the logger
    Logger.CreateLogFile();
    
    // Load the config
    Config.LoadConfig();
    Config.LoadTranslation();

    // Create the searcher and markdownbuilder objects
    const search = new Searcher();
    const md = new MarkdownBuilder();

    // Clone everything from the git and build the markdown
    const gitter = new Gitter();
    await gitter.CloneRepo();
    // Index all markdown files
    await search.IndexAll();

    // Create a timer to refresh the files from the git
    const gitTimer = new Timer(gitter.CloneRepo, Config.Config.Get("Gitter.timeout"));
    gitTimer.Start();

    // Load all themes
    Theme.LoadThemes();

    // Create the webserber
    const web = new Web();
}
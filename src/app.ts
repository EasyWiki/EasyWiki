import { Web } from "./web/webserver";
import { Config } from "./modules/Config";
import { MarkdownBuilder } from "./Markdown/MarkdownBuilder";
import { Theme } from "./modules/Theme";
import { Searcher } from "./Markdown/Searcher";
import { Gitter } from "./Markdown/Gitter";
import { Timer } from "./modules/Timer";
import { Logger } from "./modules/Logger";

StartServer();

async function StartServer()
{
    Logger.CreateLogFile();
    
    const config = new Config();

    const search = new Searcher();
    const md = new MarkdownBuilder();

    const gitter = new Gitter();
    await gitter.CloneRepo();
    

    const gitTimer = new Timer(gitter.CloneRepo, Config.Config.Get("Gitter.timeout"));
    gitTimer.Start();

    Theme.LoadThemes();

    const web = new Web();
}
import { Web } from "./web/webserver";
import { Config } from "./modules/Config";
import { MarkdownBuilder } from "./Markdown/MarkdownBuilder";
import { Theme } from "./modules/Theme";
import { Searcher } from "./Markdown/Searcher";
import { Gitter } from "./Markdown/Gitter";
import { Timer } from "./modules/Timer";

StartServer();

async function StartServer()
{
    const config = new Config();

    const gitter = new Gitter();
    await gitter.CloneRepo();

    const md = new MarkdownBuilder();
    const search = new Searcher();
    
    md.BuildAll(false);
    search.IndexAll(true);

    const gitTimer = new Timer(gitter.CloneRepo, 1000 * 60);
    gitTimer.Start();

    Theme.LoadThemes();

    const web = new Web();
}
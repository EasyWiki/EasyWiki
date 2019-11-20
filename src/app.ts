import { Web } from "./web/webserver";
import { Config } from "./modules/Config";
import { MarkdownBuilder } from "./Markdown/MarkdownBuilder";
import { Theme } from "./modules/Theme";
import { Searcher } from "./Markdown/Searcher";
import { Gitter } from "./Markdown/Gitter";
import { Timer } from "./modules/Timer";

const config = new Config();

const md = new MarkdownBuilder();
md.BuildAll(false);

const search = new Searcher();
search.IndexAll(true);

const gitter = new Gitter();
gitter.CloneRepo();

const gitTimer = new Timer(gitter.CloneRepo, 1000 * 60);
gitTimer.Start();

Theme.LoadThemes();

const web = new Web();
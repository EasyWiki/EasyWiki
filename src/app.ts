import { Web } from "./web/webserver";
import { Config } from "./modules/Config";
import { MarkdownBuilder } from "./Markdown/MarkdownBuilder";
import { Theme } from "./modules/Theme";
import { Searcher } from "./Markdown/Searcher";

const config = new Config();

const md = new MarkdownBuilder();
md.BuildAll(false);

const search = new Searcher();
search.IndexAll(true);

Theme.LoadThemes();

const web = new Web();
import { Web } from "./web/webserver";
import { Config } from "./modules/Config";
import { MarkdownBuilder } from "./Markdown/MarkdownBuilder";
import { Theme } from "./modules/Theme";

var md = new MarkdownBuilder();
md.BuildAll();

Theme.LoadThemes();
var web = new Web(new Config());
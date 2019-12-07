import { MarkdownBuilder } from "./Markdown/MarkdownBuilder";
import { Gitter } from "./Markdown/Gitter";
import { Config } from "./modules/Config";

Config.LoadConfig();
Config.LoadTranslation();

var g = new Gitter();
g.CloneRepo();

/*var md = new MarkdownBuilder();
md.BuildAll();*/
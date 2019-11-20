import { MarkdownBuilder } from "./Markdown/MarkdownBuilder";
import { Gitter } from "./Markdown/Gitter";
import { Config } from "./modules/Config";

var c = new Config();
var g = new Gitter();
g.CloneRepo();

/*var md = new MarkdownBuilder();
md.BuildAll();*/
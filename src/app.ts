import { Web } from "./web/webserver";
import { Config } from "./modules/Config";
import { MarkdownBuilder } from "./Markdown/MarkdownBuilder";

var md = new MarkdownBuilder();
md.BuildAll();
var web = new Web(new Config());
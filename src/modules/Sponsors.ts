import { FileSystem } from "./FileSystem";
import { Logger } from "./Logger";
import { Config } from "./Config";

class Sponsors
{
    public static Sponsors : Sponsors;

    private _sponsors : any[];

    constructor()
    {
        Logger.Log("Sponsors", "Loading sponsors.");
        
        Sponsors.Sponsors = this;

        const json = FileSystem.ReadFileSync(Config.GetPath("sponsors.json"));
        const obj = JSON.parse(json);

        this._sponsors = (obj["sponsors"] as any[]).sort((a,b) =>
        {
            return a.priority - b.priority;
        });
    }

    public GetHtml() : string
    {
        const cache = FileSystem.GetCache("sponsors");

        if(cache)
        {
            return cache as string;
        }
        else
        {
            let html = "<section class='section sponsors'>";
            html += "<h3 class='title is-5'>{{translation.Sponsors}}:</h3>"
            
            this._sponsors.forEach((sponsor) =>
            {
                html += "<div class='sponsor";
                if(sponsor.background) html += " has-background"
                html += "'><a href='" + sponsor.url + "'>" +
                    "<img src='" + sponsor.img + "' alt='" + sponsor.name + "'></a></div>";
            });

            html += "</section>"

            FileSystem.AddCache("sponsors", html);

            return html;
        }
    }

    public static Load()
    {
        return new Sponsors();
    }
}

export = Sponsors;
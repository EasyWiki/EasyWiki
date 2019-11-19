import fs from 'fs';
import path from 'path';

const folderPath = path.join(__dirname, "../..", "themes");

class Theme
{
    private _themeObj : ITheme;

    public static themes : Theme[];

    constructor(json: string)
    {
        this._themeObj = JSON.parse(json);
    }

    public GetId() : string
    {
        return this._themeObj.id;
    }

    public GetName() : string
    {
        return this._themeObj.name;
    }

    public GetCss() : string
    {
        let html = "";

        for(let i = 0; i < this._themeObj.css.length; i++)
        {
            const cssFile = this._themeObj.css[i];

            html += "<link href='/css/" + cssFile +"' type='text/css' rel='Stylesheet'>";
        }

        return html;
    }

    public IsLightmode() : boolean
    {
        return this._themeObj.light;
    }

    public static LoadThemes()
    {
        this.themes = [];

        const files = fs.readdirSync(folderPath);

        for(let i = 0; i < files.length; i++)
        {
            const file = path.join(folderPath,files[i]);

            if(fs.statSync(file).isFile())
            {
                let theme = new Theme(fs.readFileSync(file).toString());
                this.themes.push(theme);
            }
        }
    }

    public static GetTheme(id : string) : Theme
    {
        for(let i = 0; i < this.themes.length; i++)
        {
            if(this.themes[i].GetId() == id)
            {
                return this.themes[i];
            }
        }

        return this.themes[0];
    }
}

interface ITheme
{
    id: string;
    name: string;
    light: boolean;
    css: string[];
}

export {Theme, ITheme};
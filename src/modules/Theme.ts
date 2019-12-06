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

    public GetCss(accent: string) : string
    {
        console.log(accent);
        let html = "";

        this._themeObj.defaults.css.forEach((file: string) =>
        {
            html += "<link href='/css/" + file +"' type='text/css' rel='Stylesheet'>";
        });

        this._themeObj.accents[accent].forEach( (file: string) =>
        {
            html += "<link href='/css/" + file +"' type='text/css' rel='Stylesheet'>";
        });

        return html;
    }

    public GetDefaultAccent()
    {
        return this._themeObj.defaults.accent;
    }

    public GetAccents()
    {
        return Object.keys(this._themeObj.accents);
    }

    public IsLightmode() : boolean
    {
        return this._themeObj.light;
    }

    /**
     * Load all themes
     */
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

    /**
     * Get a thme by its id 
     * @param id Theme id
     */
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
    defaults: {
        "accent": string,
        css: string[]
    };

    accents: any;
}

export {Theme, ITheme};
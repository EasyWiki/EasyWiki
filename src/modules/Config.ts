import fs from 'fs';
import path from 'path';

export class Config
{
    private static _configs = new Map<string, Config>();

    private _path: string;
    private _obj: any;

    constructor(config: string)
    {
        this._path = this.GetFullPath(config);
        this._obj = JSON.parse(fs.readFileSync(this._path).toString());
    }

    public Get()
    {
        return this._obj;
    }

    private GetFullPath(config: string)
    {
        config += ".json";

        return fs.existsSync("dev-config") ? path.join("dev-config", config) : path.join("config", config);
    }

    public static GetConfig(config: string) : Config
    {
        if(this._configs.has(config))
            return this._configs.get(config) as Config;

        let conf = new Config(config);
        this._configs.set(config, conf);
        return conf;
    }

    public static Get(config: string) : any
    {
        return this.GetConfig(config).Get();
    }

    public static GetProperty(config: string, path: string) : any
    {
        let value = this.Get(config);

        const pieces = path.split(".");
        for(let i in pieces)
        {
            const piece = pieces[i];

            if(Object.keys(value).indexOf(piece) !== -1)
            {
                value = value[piece];
            }
            else
            {
                return null;
            }
        }

        return value;

    }
}
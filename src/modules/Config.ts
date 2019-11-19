import fs from 'fs';
class Config
{
    public static Config : Config;

    private _config : any;

    constructor()
    {
        Config.Config = this;
        
        let configPath = "config.json";
        
        if(fs.existsSync("dev-config.json"))
            configPath = "dev-config.json";
        
        let json = fs.readFileSync(configPath).toString();
        this._config = JSON.parse(json);
    }

    public Get(path : string) : any
    {
        let pathArr = path.split('.');
        let currConf = this._config;

        for(let p in pathArr)
        {
            currConf = currConf[pathArr[p]];
        }

        return currConf;
    }
}

export {Config};
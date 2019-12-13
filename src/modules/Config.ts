import fs from 'fs';
import { Logger } from './Logger';
import path from 'path';

class Config
{
    public static Config : Config;
    public static Translation : Config;

    private _config : any;
    private _watcher : fs.FSWatcher;

    constructor(path: string)
    {
        
        let json = fs.readFileSync(path).toString();
        this._config = JSON.parse(json);

        this._watcher = fs.watch(path, {persistent: true, recursive: false});
        this.WatchFile();
    }

    /**
     * Get a config setting from a given path
     * @param path The config path
     */
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

    /**
     * Reload the config
     */
    public Reload()
    {
        Logger.Log("Config", "Reloading config.");
        Config.LoadConfig();
    }

    /**
     * Watch the file for changes
     */
    private WatchFile()
    {
        this._watcher.on("change", function(eventType, filename)
        {
            Config.Config.Reload();
        });

        this._watcher.on("error", function(err)
        {
            Logger.Error("Config","An error has occured while watching the config file.", err);
        });
    }

    public GetJson()
    {
        return this._config;
    }

    public static LoadConfig() : Config
    {
        Logger.Log("Config", "Loading config.");

        let configPath = "config/config.json";
        
        if(fs.existsSync("config/dev-config.json"))
            configPath = "config/dev-config.json";

        Config.Config = new Config(configPath);

        Logger.Log("Config", "Loaded config.");
        return Config.Config;
    }

    public static LoadTranslation() : Config
    {
        Logger.Log("Config", "Loading translations.");
        let configPath = "config/translation.json";
        
        if(fs.existsSync("config/dev-translation.json"))
            configPath = "config/dev-translation.json";

        Config.Translation = new Config(configPath);
        Logger.Log("Config", "Loaded translations.")
        return Config.Translation;
    }
}

export {Config};
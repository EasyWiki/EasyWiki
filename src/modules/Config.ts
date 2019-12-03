import fs from 'fs';
import { Logger } from './Logger';

class Config
{
    public static Config : Config;

    private _config : any;
    private _watcher : fs.FSWatcher;

    constructor()
    {
        Config.Config = this;
        
        let configPath = "config.json";
        
        if(fs.existsSync("dev-config.json"))
            configPath = "dev-config.json";
        
        let json = fs.readFileSync(configPath).toString();
        this._config = JSON.parse(json);

        this._watcher = fs.watch(configPath,{persistent: true, recursive: false});
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
        let configPath = "config.json";

        if(fs.existsSync("dev-config.json"))
            configPath = "dev-config.json";
        
        let json = fs.readFileSync(configPath).toString();
        this._config = JSON.parse(json);
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
}

export {Config};
import fs from 'fs';
import { Logger } from './Logger';

class Config
{
    public static Config : Config;
    public static Translation : Config;
    public static Meta : Config;

    private _config : any;
    private _watcher : fs.FSWatcher | undefined;
    private _path : string;

    constructor(path: string)
    {
        this._path = path;

        this.Load(false);

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
     * (Re)Load the config
     */
    public Load(reload: boolean = true)
    {
        try
        {
            let json = fs.readFileSync(this._path).toString();
            this._config = JSON.parse(json);
            
            if(reload) Logger.Log("Config", "Reloaded config file.");
        }
        catch(e)
        {
            Logger.Error("Config", "Failed loading config.", e);
        }
    }

    /**
     * Watch the file for changes
     */
    private WatchFile()
    {
        this._watcher = fs.watch(this._path, {persistent: true, recursive: false});

        const self = this;
        this._watcher.on("change", function(eventType, filename)
        {
            self.Load(true);
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

    public static GetPath(file: string)
    {
        let configPath = "config/" + file;
        
        if(fs.existsSync("dev-config/" + file))
            configPath = "dev-config/" + file;

        return configPath;
    }

    public static LoadConfig() : Config
    {
        Logger.Log("Config", "Loading config.");

        Config.Config = new Config(this.GetPath("config.json"));

        Logger.Log("Config", "Loaded config.");
        return Config.Config;
    }

    public static LoadTranslation() : Config
    {
        Logger.Log("Config", "Loading translations.");

        Config.Translation = new Config(this.GetPath("translation.json"));

        Logger.Log("Config", "Loaded translations.");
        
        return Config.Translation;
    }

    public static LoadMeta() : Config
    {
        Logger.Log("Config", "Loading meta.");

        Config.Meta = new Config(this.GetPath("meta.json"));

        Logger.Log("Config", "Loaded meta.")
        return Config.Meta;
    }
}

export {Config};
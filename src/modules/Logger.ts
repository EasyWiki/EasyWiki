import { FileSystem } from './FileSystem';
import path from 'path';
import { Config } from './Config';

class Logger
{
    private static _logFile : string;
    private static _logCount : number = 0;

    /**
     * Log a message
     * @param origin The origin the log comes from
     * @param message The log message
     */
    public static Log(origin : string, message: string)
    {
        this._logCount++;

        let colouredEntry = this.GetTime() + "\x1b[33m" + origin + "\x1b[0m: " + message;
        let entry = this.GetTime() + origin + ": " + message;

        console.log(colouredEntry);
        FileSystem.WriteLineToFile(this._logFile, entry);

        this.CheckLogCount();
    }

    /**
     * Log an error
     * @param origin The origin the log come from
     * @param message The error log message
     * @param error The error itself
     */
    public static Error(origin : string, message: string, error: Error|undefined = undefined)
    {
        this._logCount++;

        let colouredEntry = this.GetTime() + "\x1b[31m" + origin + "\x1b[0m: " + message;
        let entry = this.GetTime() + origin + ": " + message;

        console.log(colouredEntry);
        FileSystem.WriteLineToFile(this._logFile, entry);

        if(error)
        {   
            FileSystem.WriteLineToFile(this._logFile, error.stack as string);
        }

        this.CheckLogCount();
    }

    public static async CheckLogCount() : Promise<void>
    {
        if(Config.Config && this._logCount >= Config.Config.Get("Logger.max"))
        {
            this.CreateLogFile();
        }
    }
    
    /**
     * Get a time string
     * @returns A time string
     */
    public static GetTime() : string
    {
        let d : Date = new Date();
        let timeStr = this.AddLeadingZero(d.getHours()) + ":" +
                      this.AddLeadingZero(d.getMinutes()) + ":" +
                      this.AddLeadingZero(d.getSeconds());

        let dateStr = this.AddLeadingZero(d.getDay() + 1) + "/" +
                      this.AddLeadingZero(d.getMonth() + 1) + "/" +
                      this.AddLeadingZero(d.getFullYear());

        return "[" + dateStr + " " + timeStr + "] ";
    }

    /**
     * Add a leading zero to a number
     * @param i A number
     */
    public static AddLeadingZero(i : number) : string
    {
        if(i.toString().length < 2)
            return "0" + i.toString();
        else
            return i.toString();
    }

    /**
     * Create a log file
     */
    public static CreateLogFile()
    {
        this._logFile = FileSystem.MakeLogFile(this.GetTime());
    }
}

export {Logger};
import { FileSystem } from './FileSystem';
import path from 'path';

class Logger
{
    private static _logFile : string;

    public static Log(origin : string, message: string)
    {
        let colouredEntry = this.GetTime() + "\x1b[33m" + origin + "\x1b[0m: " + message;
        let entry = this.GetTime() + origin + ": " + message;

        console.log(colouredEntry);
        FileSystem.WriteLineToFile(this._logFile, entry);
    }

    public static Error(origin : string, message: string, error: Error|undefined = undefined)
    {
        let colouredEntry = this.GetTime() + "\x1b[31m" + origin + "\x1b[0m: " + message;
        let entry = this.GetTime() + origin + ": " + message;

        console.log(colouredEntry);
        FileSystem.WriteLineToFile(this._logFile, entry);

        if(error)
        {   
            FileSystem.WriteLineToFile(this._logFile, error.stack as string);
        }
    }
    
    public static GetTime() : string
    {
        let d : Date = new Date();
        let timeStr = this.AddLeadingZero(d.getHours()) + ":" +
                      this.AddLeadingZero(d.getMinutes()) + ":" +
                      this.AddLeadingZero(d.getSeconds());

        let dateStr = this.AddLeadingZero(d.getDay()) + "/" +
                      this.AddLeadingZero(d.getMonth()) + "/" +
                      this.AddLeadingZero(d.getFullYear());

        return "[" + dateStr + " " + timeStr + "] ";
    }

    public static AddLeadingZero(i : number) : string
    {
        if(i.toString().length < 2)
            return "0" + i.toString();
        else
            return i.toString();
    }

    public static CreateLogFile()
    {
        this._logFile = FileSystem.MakeLogFile(this.GetTime());
    }
}

export {Logger};
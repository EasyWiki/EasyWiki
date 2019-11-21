class Logger
{
    public static Log(origin : string, message: string)
    {
        console.log(this.GetTime() + origin + ": " + message);
    }

    public static Error(origin : string, message: string, error: Error|undefined = undefined)
    {
        if(error)
        {
            console.log(this.GetTime() + origin + ": " + message);
            console.log(error.stack);
        }
        else
        {
            console.log(this.GetTime() + origin + ": " + message);
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
}

export {Logger};
class Logger
{
    public static Log(origin : string, message: string)
    {
        console.log(origin + ": " + message);
    }

    public static Error(origin : string, message: string, error: Error|undefined)
    {
        if(error)
        {
            console.log(origin + ": " + message);
            console.log(error.stack);
        }
        else
        {
            console.log(origin + ": " + message);
        }
    }
}

export {Logger};
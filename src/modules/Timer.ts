import { Logger } from "./Logger";

class Timer
{
    private _action : Function;
    private _interval : number;
    private _handler : number; 

    /**
     * Create a timer
     * @param action The action that should be performed each interval
     * @param interval The interval time in miliseconds
     */
    constructor(action: Function, interval: number)
    {
        this._action = action;
        this._interval = interval;
        this._handler = -1;
    }

    /**
     * Start the timer
     */
    public Start()
    {
        Logger.Log("Timer", "Started a timer with interval " + this.GetIntervalString() + ".");
        this._handler = setInterval(this._action, this._interval);
    }

    /**
     * Stop the timer
     */
    public Stop()
    {
        if(this._handler == -1) return;

        clearInterval(this._handler);
        this._handler = -1;
    }
    
    public SetInterval(interval: number)
    {
        this._interval = interval;
    }

    /**
     * Get the interval in a human readable string
     * @return Human readable interval string
     */
    public GetIntervalString()
    {
        var ms = this._interval % 1000;
        var secs = ((this._interval - ms) % 60000)/1000;
        var mins = (this._interval - ms - secs)/60000;

        return mins + "m " + secs + "s " + ms + "ms";
    }
}

export {Timer};
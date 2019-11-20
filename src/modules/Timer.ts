class Timer
{
    private _action : Function;
    private _interval : number;
    private _handler : number; 

    constructor(action: Function, interval: number)
    {
        this._action = action;
        this._interval = interval;
        this._handler = -1;
    }

    public Start()
    {
        this._handler = setInterval(this._action, this._interval);
    }

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
}

export {Timer};
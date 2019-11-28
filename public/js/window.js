var callbacks = [];

window.onload = function()
{
    for(let i = 0; i < callbacks.length; i++)
    {
        callbacks[i]();
    }
}

function OnWindowLoad(callback)
{
    callbacks.push(callback);
}

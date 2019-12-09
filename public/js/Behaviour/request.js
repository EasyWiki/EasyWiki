function Request(url, params, callback)
{
    let xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);

    xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

    xhr.send(params);

    xhr.addEventListener("loadend",function(e)
    {
        callback(xhr.responseText);
    });
}

function Translate(path, callback)
{
    const url = "/translation";
    const params = "translation=" + encodeURIComponent(path);
    Request(url,params,callback);
}
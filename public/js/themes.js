OnWindowLoad(function()
{
    var radios = document.querySelectorAll('input[type=radio][name="theme"]');

    radios.forEach((el) =>
    {
        el.addEventListener("change",(e) =>
        {
            GetAccents(el.value, ChangeAccents);
        });
    });
});

function GetAccents(theme, callback)
{
    const url = "/themes/accents";
    const params = "theme=" + encodeURIComponent(theme);
    let xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);

    xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

    xhr.send(params);

    xhr.addEventListener("loadend",function(e)
    {
        callback(xhr.responseText);
    });
}

function ChangeAccents(html)
{
    document.getElementById("accents").innerHTML = html;
}
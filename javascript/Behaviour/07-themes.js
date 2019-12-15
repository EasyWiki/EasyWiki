OnWindowLoad(function()
{
    var radios = document.querySelectorAll('input[type=radio][name="theme"]');

    radios.forEach((el) =>
    {
        el.addEventListener("change",(e) =>
        {
            const url = "/themes/accents";
            const params = "theme=" + encodeURIComponent(el.value);
            Request(url,params,ChangeAccents);
        });
    });
});

function ChangeAccents(html)
{
    document.getElementById("accents").innerHTML = html;
}
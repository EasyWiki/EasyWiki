OnWindowLoad(function()
{
    const $cookieMessage = document.getElementById("cookie-message");
    const $accepted = $cookieMessage.querySelector("#accept");
    const $minimal = $cookieMessage.querySelector("#minimal");

    const cookie = GetCookie("accepted");

    if(cookie != "true" && cookie != "minimal")
    {
        $cookieMessage.classList.toggle("is-hidden", false);
    }
    else
    {
        SetCookie("accepted",cookie,30);
    }


    $accepted.addEventListener("click",function(e)
    {
        $cookieMessage.classList.toggle("is-hidden", true);
        SetCookie("accepted","true",30);
    });

    $minimal.addEventListener("click", function(e)
    {
        $cookieMessage.classList.toggle("is-hidden", true);
        SetCookie("accepted","minimal",30);

        window.location.reload();
    });
});

function SetCookie(cname, cvalue, exdays)
{
    var d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    var expires = "expires="+ d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function GetCookie(cname)
{
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');

    for(var i = 0; i <ca.length; i++)
    {
        var c = ca[i];
        while (c.charAt(0) == ' ')
        {
            c = c.substring(1);
        }

        if (c.indexOf(name) == 0)
        {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}
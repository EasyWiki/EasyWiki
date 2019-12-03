OnWindowLoad(function()
{
    $cookieMessage = document.getElementById("cookie-message");
    $accepted = $cookieMessage.querySelector("#accept");


    if(GetCookie("accepted") != "true")
    {
        $cookieMessage.classList.toggle("is-hidden", false);
    }
    else
    {
        SetCookie("accepted","true",30);
    }


    $accepted.addEventListener("click",function(e)
    {
        $cookieMessage.classList.toggle("is-hidden", true);
        SetCookie("accepted","true",30);
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
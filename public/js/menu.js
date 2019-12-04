var menuTop = 0;

OnWindowLoad(function()
{
    const $menu = document.getElementsByClassName("menu")[0];
    menuTop = $menu.scrollHeight;

    const $col = $menu.parentElement;
    $col.classList.toggle("menu-container", true);

    if(window.scrollY > menuTop)
        $col.classList.toggle("hide-menu", true);

    OnScroll(function(e)
    {
        let scroll = window.scrollY;

        if(scroll <= menuTop)
        {
            $col.classList.toggle("hide-menu", false);
        }
        else
        {
            $col.classList.toggle("hide-menu", true);
        }        
    });
});
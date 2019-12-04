let scrollActions = [];

function OnScroll(action)
{
    scrollActions.push(action);
}

window.onscroll = function()
{
    scrollActions.forEach((action)=>action());
}

OnWindowLoad(function()
{
    const scrollOffset = 500;
    const $backToTop = document.getElementsByClassName("back-to-top")[0];

    $backToTop.classList.toggle("hide", window.scrollY <= 0);

    OnScroll(function()
    {
        $backToTop.classList.toggle("hide", window.scrollY <= scrollOffset);
    });

    $backToTop.querySelector(".button").addEventListener("click", function(e)
    {
        document.body.scrollTop = 0;
        document.documentElement.scrollTop = 0;
    });
});
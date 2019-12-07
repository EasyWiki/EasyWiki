let scrollActions = [];
let $backToTop;
let prevTimeout;

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
    $backToTop = document.getElementsByClassName("back-to-top")[0];

    Hide(window.scrollY <= 0);

    OnScroll(function()
    {
        Hide(window.scrollY <= scrollOffset);
    });

    $backToTop.querySelector(".button").addEventListener("click", function(e)
    {
        document.body.scrollTop = 0;
        document.documentElement.scrollTop = 0;
    });
});

async function Hide(value)
{
    clearTimeout(prevTimeout);
    
    if(!value)
        $backToTop.classList.toggle("is-hidden", false);

    $backToTop.classList.toggle("hide", value);

    prevTimeout = setTimeout(() =>
    {
        $backToTop.classList.toggle("is-hidden", value);
    }, 1000);
}
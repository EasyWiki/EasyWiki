OnWindowLoad(function()
{
    const $menuButton = document.querySelector(".menu .button");
    const $menuBody = document.querySelector(".menu .menu-body");
    let hidden = true;

    $menuButton.addEventListener("click",() =>
    {
        if(hidden)
        {
            $menuBody.classList.toggle("is-hidden-touch", false);
            
            Translate("Hide", (res) =>
            {
                $menuButton.innerHTML = res;
            });
        }
        else
        {
            $menuBody.classList.toggle("is-hidden-touch", true);
            
            Translate("Show",(res) =>
            {
                $menuButton.innerHTML = res;
            });
        }

        hidden = !hidden;
    });
});
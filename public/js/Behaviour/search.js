OnWindowLoad(function()
{
    const $searchbar = Array.prototype.slice.call(document.querySelectorAll('.search-bar input'), 0);
    
    if ($searchbar.length > 0)
    {
        $searchbar.forEach(el => {
            el.addEventListener('input', (e) =>
            {
                DoSearch(el.value, (results) =>
                {
                    let elements = document.getElementsByClassName("search-results");

                    if(elements.length == 0) return;

                    const element = elements[0];
                    element.innerHTML = results;
                    element.classList.toggle("is-hidden",false);
                });
            });

            el.onkeypress = function(e)
            {
                if(e.charCode == 13)
                {
                    $link = document.querySelectorAll(".search-results td a")[0];

                    $link.click();
                }
            };

        });
    }
});

function DoSearch(query, callback)
{
    const url = "/search";
    const params = "query=" + encodeURIComponent(query);
    Response(url,params,callback);
}
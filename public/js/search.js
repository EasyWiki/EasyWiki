socket.on("search",function(results)
{
    var elements = document.getElementsByClassName("search-results");

    if(elements.length == 0) return;

    var element = elements[0];
    element.innerHTML = results;
    element.classList.toggle("is-hidden",false);
});

window.onload = function()
{
    const $searchbar = Array.prototype.slice.call(document.querySelectorAll('.search-bar input'), 0);
    if ($searchbar.length > 0)
    {
        $searchbar.forEach(el => {

            el.addEventListener('input', () =>
            {
                socket.emit("search", el.value);
            });

        });
    }
}
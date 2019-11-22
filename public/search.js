socket.on("/",function(results)
{
    var elements = document.getElementsByClassName("search-results");

    if(elements.length == 0) return;

    var element = elements[0];
    element.innerHTML = results;
});

document.onload = function()
{
    
}
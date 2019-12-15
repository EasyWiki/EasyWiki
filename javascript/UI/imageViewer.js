OnWindowLoad(function()
{
    let $imageModal = document.getElementById("image-viewer");
    $modalImg = $imageModal.getElementsByTagName("img")[0];

    let $closeModal = $imageModal.getElementsByClassName("modal-close")[0];
    let $modalBackground = $imageModal.getElementsByClassName("modal-background")[0];

    let $html = document.getElementsByTagName("html")[0];

    document.querySelectorAll("div.container.content img").forEach(($img) =>
    {
        $img.addEventListener("click",(e) =>
        {    
            $modalImg.src = $img.src;

            $imageModal.classList.toggle("is-active", true);
            $html.classList.toggle("is-clipped", true);
        });
    });

    $closeModal.addEventListener("click", CloseModal);
    $modalBackground.addEventListener("click", CloseModal);

    function CloseModal(e)
    {
        $imageModal.classList.toggle("is-active", false);
        $html.classList.toggle("is-clipped", false);
    }
});
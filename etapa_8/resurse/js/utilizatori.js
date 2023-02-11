window.addEventListener("load",  function(){
    const img = document.getElementsByTagName('img')[0];
    img.addEventListener('error', function handleError() {
        const defaultImage ='/poze_uploadate/default.png';
        img.src = defaultImage;
        alert(defaultImage);
        img.alt = 'default';
    });
});

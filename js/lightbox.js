// Lightbox functionality
function hideLightbox() {
    const lightbox = document.getElementById('lightbox-alert');
    lightbox.style.display = 'none';
    localStorage.setItem('lightboxHidden', 'true');
}

document.addEventListener('DOMContentLoaded', () => {
    if (localStorage.getItem('lightboxHidden') === 'true') {
        document.getElementById('lightbox-alert').style.display = 'none';
    }
});

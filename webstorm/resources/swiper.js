var swiper = new Swiper('.swiper-container-lovexx1', {
    pagination: '.swiper-pagination-lovexx1',
    paginationClickable: true,
    spaceBetween: 30,
});

var swiper = new Swiper('.swiper-container-lovexx2', {
    pagination: '.swiper-pagination-lovexx2',
    effect: 'coverflow',
    grabCursor: true,
    centeredSlides: true,
    slidesPerView: 'auto',
    coverflow: {
        rotate: 50,
        stretch: 0,
        depth: 100,
        modifier: 1,
        slideShadows: true
    }
});

var swiper = new Swiper('.swiper-container-lovexx3', {
    pagination: '.swiper-pagination-lovexx3',
    effect: 'flip',
    grabCursor: true,
    nextButton: '.swiper-button-next-lovexx3',
    prevButton: '.swiper-button-prev-lovexx3'
});
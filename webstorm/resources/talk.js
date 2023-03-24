/*
 * @Date: 2023-01-16 18:00:50
 * @LastEditors: liugw
 * @LastEditTime: 2023-01-19 23:01:19
 * @FilePath: \web\js\talk.js
 * @Version: 1.2
 */
new TypeIt("#test_bg", {
        loop: true,
        cursorSpeed: 1000,
        speed: 200
    })
    .type("CW Love FJ")
    .pause(2000)
    .delete(null, {
        delay: 500
    })
    .type("有你真好")
    .pause(3000)
    .go();

new TypeIt('#ToXX', {
    lifeLike: true,
    cursorSpeed: 1000,
    waitUntilVisible: true,
    speed: 100
}).go();

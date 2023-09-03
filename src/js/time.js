// Ref: http://yomotsu.net/blog/2013/01/05/fps.html
// noinspection JSUnresolvedVariable
const now = window.performance && (
    performance.now ||
    performance.mozNow ||
    performance.msNow ||
    performance.oNow ||
    performance.webkitNow
);

export const getTime = function () {
    return (now && now.call(performance)) || (new Date().getTime());
};

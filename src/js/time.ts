// Ref: http://yomotsu.net/blog/2013/01/05/fps.html
// noinspection JSUnresolvedVariable
const now = window.performance && (
    performance.now ||
    ('mozNow' in performance && performance.mozNow) ||
    ('msNow' in performance && performance.msNow) ||
    ('oNow' in performance && performance.oNow) ||
    ('webkitNow' in performance && performance.webkitNow)
) as () => number;

export const getTime = function () {
    return (now && now.call(performance)) || (new Date().getTime());
};

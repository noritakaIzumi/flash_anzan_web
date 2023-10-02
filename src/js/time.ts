// Ref: http://yomotsu.net/blog/2013/01/05/fps.html
/* eslint-disable @typescript-eslint/strict-boolean-expressions */
// eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
const now =
    window.performance &&
    ((performance.now ||
        ('mozNow' in performance && performance.mozNow) ||
        ('msNow' in performance && performance.msNow) ||
        ('oNow' in performance && performance.oNow) ||
        ('webkitNow' in performance && performance.webkitNow)) as () => number)

export const getTime = function (): number {
    return now?.call(performance) || new Date().getTime()
}

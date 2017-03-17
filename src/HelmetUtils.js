export const requestIdleCallback = (() => {
    if (typeof requestIdleCallback !== "undefined") {
        return requestIdleCallback;
    }

    return (cb) => {
        const start = Date.now();
        return setTimeout(() => {
            cb({
                didTimeout: false,
                timeRemaining() {
                    return Math.max(0, 50 - (Date.now() - start));
                }
            });
        }, 1);
    };
})();

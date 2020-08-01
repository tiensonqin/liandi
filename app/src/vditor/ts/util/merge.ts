export const merge = (...options: any[]) => {
    const target: any = {};
    const merger = (obj: any) => {
        for (const prop in obj) {
            if (obj.hasOwnProperty(prop)) {
                if (Object.prototype.toString.call(obj[prop]) === '[object Object]') {
                    target[prop] = merge(target[prop], obj[prop]);
                } else {
                    target[prop] = obj[prop];
                }
            }
        }
    };
    for (const option of options) {
        merger(option);
    }
    return target;
};

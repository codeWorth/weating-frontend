const TIMES = [
    ["second", 1000],
    ["minute", 1000 * 60],
    ["hour", 1000 * 60 * 60],
    ["day", 1000 * 60 * 60 * 24],
    ["week", 1000 * 60 * 60 * 24 * 7],
    ["month", Math.ceil(1000 * 60 * 60 * 24 * 365 / 12)],
    ["year", 1000 * 60 * 60 * 24 * 365]
];

function makePlural(count, unit) {
    if (count > 1) {
        return `${count} ${unit}s`;
    } else {
        return `${count} ${unit}`;
    }
}

function datesDiffToString(then, now) {
    if (!then || !now) return "";

    const diffMs = now - then;

    for (let i = TIMES.length - 1; i >= 0; i--) {
        const [unit, value] = TIMES[i];
        const count = Math.floor(diffMs / value);
        if (count > 0) {
            return makePlural(count, unit);
        }
    }
    return "0 seconds";
}

export default datesDiffToString;
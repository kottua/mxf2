/*
export function calculateFitCondValues(spMixedRtNorm: number[], fitSpreadRate: number): number[] {
    // Check for invalid inputs
    if (!spMixedRtNorm || !fitSpreadRate) {
        console.warn('Invalid inputs or mismatched array lengths, returning an array with a small value.');
        return [1e-10];
    }

    // Calculate 1 + (spMixedRtNorm[i] / fitSpreadRate[i]) for each element
    return spMixedRtNorm.map((value, index) => {
        const divisor = fitSpreadRate;
        // Check for zero division
        if (divisor === 0) {
            console.warn(`Zero found in fitSpreadRate at index ${index}, using small value.`);
            return 1e-10;
        }
        return 1 + value / divisor;
    });
}*/

export function calculateFitCondValues(
    spMixedRtNorm: number[],
    min_liq_refusal_price: number,
    max_liq_refusal_price: number,
    currentPricePerSQM: number
): number[] {
    // Перевірка вхідних даних
    if (
        !spMixedRtNorm ||
        spMixedRtNorm.length === 0 ||
        min_liq_refusal_price === undefined ||
        isNaN(min_liq_refusal_price) ||
        max_liq_refusal_price === undefined ||
        isNaN(max_liq_refusal_price) ||
        currentPricePerSQM === undefined ||
        isNaN(currentPricePerSQM)
    ) {
        console.warn('Invalid inputs: spMixedRtNorm, min_liq_refusal_price, max_liq_refusal_price, or currentPricePerSQM is invalid');
        return [1e-10];
    }

    if (currentPricePerSQM === 0) {
        console.warn('Warning: currentPricePerSQM is zero, using 1e-10');
        currentPricePerSQM = 1e-10;
    }

    // Обчислення b-rate_net і t-rate_net
    const b_rate_net = 1 - min_liq_refusal_price / currentPricePerSQM;// по хорошому, треба не рахувати, а брати з конфіга, де мали б бути збережені на момент онбординга
    const t_rate_net = max_liq_refusal_price / currentPricePerSQM - 1; // по хорошому, треба не рахувати, а брати з конфіга, де мали б бути збережені на момент онбординга
    // Знаходження медіани spMixedRtNorm
    const sortedSpMixedRtNorm = [...spMixedRtNorm].sort((a, b) => a - b);
    const mid = Math.floor(sortedSpMixedRtNorm.length / 2);
    const spMixedRtNorm_med = sortedSpMixedRtNorm.length % 2 === 0
        ? (sortedSpMixedRtNorm[mid - 1] + sortedSpMixedRtNorm[mid]) / 2
        : sortedSpMixedRtNorm[mid];
    // Обчислення spMixedRtNorm_scope
    const spMixedRtNorm_scope = spMixedRtNorm.map(value =>
        value <= spMixedRtNorm_med ? spMixedRtNorm_med - value : value - spMixedRtNorm_med
    );
    // Визначення spMixedRtNorm_scope_b (перше значення) і spMixedRtNorm_scope_t (останнє значення)
    let spMixedRtNorm_scope_b = spMixedRtNorm_scope[0];
    let spMixedRtNorm_scope_t = spMixedRtNorm_scope[spMixedRtNorm_scope.length - 1];
    // Перевірка на нуль для уникнення ділення на нуль
    if (spMixedRtNorm_scope_b === 0) {
        console.warn('Warning: spMixedRtNorm_scope_b is zero, using 1e-10');
        spMixedRtNorm_scope_b = 1e-10;
    }
    if (spMixedRtNorm_scope_t === 0) {
        console.warn('Warning: spMixedRtNorm_scope_t is zero, using 1e-10');
        spMixedRtNorm_scope_t = 1e-10;
    }

    // Обчислення b-fit_transform і t-fit_transform
    const b_fit_transform =  spMixedRtNorm_scope_b / b_rate_net ;
    const t_fit_transform =  spMixedRtNorm_scope_t / t_rate_net ;
    // Обчислення fit_cond_value
    return spMixedRtNorm.map((value, index) => {
        const scopeValue = spMixedRtNorm_scope[index];
        if (value <= spMixedRtNorm_med) {
            return 1 - scopeValue / b_fit_transform;
        } else {
            return 1 + scopeValue / t_fit_transform;
        }
    });
}
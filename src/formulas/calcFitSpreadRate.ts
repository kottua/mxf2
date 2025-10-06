export function calculateFitSpreadRate(scope?: number, spread?: number): number {
    // Check if inputs are undefined or spread is zero
    if (spread === undefined || spread === 0 || scope === undefined) {
        console.warn('Spread is zero or undefined, or scope is undefined/empty, returning an array with a small value.');
        return 1e-10; // Return an array to match the return type
    }

    // Divide each element of scope by spread
    return scope / spread;
}
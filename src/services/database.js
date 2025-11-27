import { productDatabase } from '../data/products';

// Helper to simulate async behavior if needed, or just return directly.
// Keeping it async to match the previous interface and allow for future API calls.
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const getProducts = async (search = '') => {
    await delay(100); // Simulate network/db latency
    if (!search) return productDatabase;

    const term = search.toLowerCase();
    return productDatabase.filter(p =>
        p.name.toLowerCase().includes(term) ||
        p.brand.toLowerCase().includes(term)
    );
};

export const getProductById = async (id) => {
    await delay(50);
    return productDatabase.find(p => p.id === id) || null;
};

export const getProductByBarcode = async (barcode) => {
    await delay(50);
    return productDatabase.find(p => p.barcode === barcode) || null;
};

export const getRecommendations = async (category, currentRating) => {
    await delay(100);

    // Rating logic: A=5, E=0
    const ratingValue = {
        'A': 5, 'A-': 4.5,
        'B+': 4, 'B': 3.5, 'B-': 3,
        'C+': 2.5, 'C': 2, 'C-': 1.5,
        'D+': 1, 'D': 0.5, 'D-': 0.2,
        'E': 0.1, 'E-': 0
    };

    // Filter for same category and good rating (>= 3.5 which is B or better)
    const candidates = productDatabase.filter(p =>
        p.category === category &&
        (ratingValue[p.rating] || 0) >= 3.5
    );

    // Shuffle results
    return candidates.sort(() => 0.5 - Math.random());
};

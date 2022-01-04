import { Page } from 'playwright';

/**
 * Retrieve the react-router MemoryRouter route from the location hash
 */
function getRoute(page: Page): string | null {
    const url = page.url();

    // GUARD: Check that the URL includes a hash
    if (!url.includes('#')) {
        return null;
    }

    // Split the URL on the hash and only retain the last part
    const [, hash] = url.split('#');

    return hash;
}

export default getRoute;

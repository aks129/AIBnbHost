/**
 * PriceLabs API Integration Service
 *
 * Connects to PriceLabs dynamic pricing API to fetch pricing recommendations,
 * listing data, and market analytics.
 *
 * API Documentation: https://api.pricelabs.co/v1/
 */

// PriceLabs API base URL
const PRICELABS_API_BASE = 'https://api.pricelabs.co/v1';

// Get API key from environment
const apiKey = process.env.PRICELABS_API_KEY;

if (!apiKey) {
  console.warn('WARNING: PRICELABS_API_KEY not set in environment variables');
}

// Types for PriceLabs API responses
export interface PriceLabsListing {
  id: string;
  name: string;
  pms?: string;
  listing_id?: string;
  currency?: string;
  base_price?: number;
  min_price?: number;
  max_price?: number;
  last_sync?: string;
  status?: string;
}

export interface PriceLabsPricing {
  date: string;
  price: number;
  min_stay?: number;
  currency?: string;
  reason?: string;
}

export interface PriceLabsNeighborhoodData {
  listing_id: string;
  neighborhood?: string;
  market_data?: {
    avg_daily_rate?: number;
    occupancy_rate?: number;
    revenue_potential?: number;
  };
}

export interface PriceLabsMarketData {
  date: string;
  avg_price?: number;
  median_price?: number;
  occupancy?: number;
  demand?: string;
}

export interface PriceLabsApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * Makes an authenticated request to the PriceLabs API
 */
async function makeRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<PriceLabsApiResponse<T>> {
  const key = apiKey || process.env.PRICELABS_API_KEY;

  if (!key) {
    return {
      success: false,
      error: 'PRICELABS_API_KEY not configured',
      message: 'Please set PRICELABS_API_KEY in environment variables'
    };
  }

  const url = `${PRICELABS_API_BASE}${endpoint}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'X-API-Key': key,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...options.headers,
      },
    });

    const responseText = await response.text();
    let data: T | undefined;

    try {
      data = JSON.parse(responseText);
    } catch {
      // Response might not be JSON
    }

    if (!response.ok) {
      return {
        success: false,
        error: `HTTP ${response.status}: ${response.statusText}`,
        message: responseText || 'Request failed',
        data
      };
    }

    return {
      success: true,
      data
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('PriceLabs API request failed:', errorMessage);
    return {
      success: false,
      error: errorMessage,
      message: 'Failed to connect to PriceLabs API'
    };
  }
}

/**
 * Get all listings connected to PriceLabs account
 */
export async function getListings(): Promise<PriceLabsApiResponse<PriceLabsListing[]>> {
  return makeRequest<PriceLabsListing[]>('/listings');
}

/**
 * Get pricing recommendations for a specific listing
 */
export async function getListingPricing(
  listingId: string,
  startDate?: string,
  endDate?: string
): Promise<PriceLabsApiResponse<PriceLabsPricing[]>> {
  let endpoint = `/listings/${listingId}/pricing`;
  const params = new URLSearchParams();

  if (startDate) params.append('start_date', startDate);
  if (endDate) params.append('end_date', endDate);

  if (params.toString()) {
    endpoint += `?${params.toString()}`;
  }

  return makeRequest<PriceLabsPricing[]>(endpoint);
}

/**
 * Get neighborhood/market data for a listing
 */
export async function getNeighborhoodData(
  listingId: string,
  pms?: string
): Promise<PriceLabsApiResponse<PriceLabsNeighborhoodData>> {
  let endpoint = '/neighborhood_data';
  const params = new URLSearchParams();

  params.append('listing_id', listingId);
  if (pms) params.append('pms', pms);

  endpoint += `?${params.toString()}`;

  return makeRequest<PriceLabsNeighborhoodData>(endpoint);
}

/**
 * Get market analytics for a specific area
 */
export async function getMarketData(
  location: string,
  startDate?: string,
  endDate?: string
): Promise<PriceLabsApiResponse<PriceLabsMarketData[]>> {
  let endpoint = '/market_data';
  const params = new URLSearchParams();

  params.append('location', location);
  if (startDate) params.append('start_date', startDate);
  if (endDate) params.append('end_date', endDate);

  endpoint += `?${params.toString()}`;

  return makeRequest<PriceLabsMarketData[]>(endpoint);
}

/**
 * Sync/push pricing to PriceLabs for a listing
 */
export async function syncListingPricing(
  listingId: string,
  prices: { date: string; price: number; min_stay?: number }[]
): Promise<PriceLabsApiResponse<{ synced: number }>> {
  return makeRequest<{ synced: number }>(`/listings/${listingId}/sync`, {
    method: 'POST',
    body: JSON.stringify({ prices }),
  });
}

/**
 * Get account information and API status
 */
export async function getAccountInfo(): Promise<PriceLabsApiResponse<{
  account_id?: string;
  email?: string;
  plan?: string;
  listings_count?: number;
  api_calls_remaining?: number;
}>> {
  return makeRequest('/account');
}

/**
 * Test API connection with the provided key
 */
export async function testConnection(testApiKey?: string): Promise<PriceLabsApiResponse<unknown>> {
  const key = testApiKey || apiKey || process.env.PRICELABS_API_KEY;

  if (!key) {
    return {
      success: false,
      error: 'No API key provided',
      message: 'Please provide a PriceLabs API key'
    };
  }

  // Try multiple endpoints to test the connection
  const endpoints = ['/listings', '/account', '/neighborhood_data'];

  for (const endpoint of endpoints) {
    try {
      const url = `${PRICELABS_API_BASE}${endpoint}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'X-API-Key': key,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      const responseText = await response.text();
      let data: unknown;

      try {
        data = JSON.parse(responseText);
      } catch {
        data = responseText;
      }

      // Even if it's an error response, we got a response from the API
      return {
        success: response.ok,
        data,
        message: response.ok ? 'Connection successful' : `API responded with status ${response.status}`,
        error: response.ok ? undefined : responseText
      };
    } catch (error) {
      // Continue to next endpoint if this one fails
      continue;
    }
  }

  return {
    success: false,
    error: 'Could not connect to any PriceLabs endpoint',
    message: 'Please check your API key and network connection'
  };
}

/**
 * Export all functions for use in routes
 */
export const priceLabsService = {
  getListings,
  getListingPricing,
  getNeighborhoodData,
  getMarketData,
  syncListingPricing,
  getAccountInfo,
  testConnection,
};

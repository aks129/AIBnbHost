/**
 * Test script for PriceLabs API connection
 * Run with: npx tsx scripts/test-pricelabs.ts
 */

const PRICELABS_API_KEY = process.env.PRICELABS_API_KEY || 'baGyLDNvWlg5yClteDgI2w95oDiArVeupndgYxJ5';
const PRICELABS_API_BASE = 'https://api.pricelabs.co/v1';

interface ApiResponse {
  status: number;
  statusText: string;
  data: unknown;
  headers: Record<string, string>;
}

async function testEndpoint(endpoint: string): Promise<ApiResponse> {
  const url = `${PRICELABS_API_BASE}${endpoint}`;
  console.log(`\nTesting: ${url}`);

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'X-API-Key': PRICELABS_API_KEY,
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

    const headers: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      headers[key] = value;
    });

    return {
      status: response.status,
      statusText: response.statusText,
      data,
      headers,
    };
  } catch (error) {
    return {
      status: 0,
      statusText: error instanceof Error ? error.message : 'Unknown error',
      data: null,
      headers: {},
    };
  }
}

async function main() {
  console.log('='.repeat(60));
  console.log('PriceLabs API Connection Test');
  console.log('='.repeat(60));
  console.log(`API Key: ${PRICELABS_API_KEY.substring(0, 10)}...`);
  console.log(`Base URL: ${PRICELABS_API_BASE}`);

  // Test various endpoints
  const endpoints = [
    '/listings',
    '/account',
    '/neighborhood_data',
    '/market_data',
  ];

  for (const endpoint of endpoints) {
    const result = await testEndpoint(endpoint);
    console.log(`\nStatus: ${result.status} ${result.statusText}`);
    console.log('Response:');
    console.log(JSON.stringify(result.data, null, 2));

    // If we get a successful response, we found a working endpoint
    if (result.status >= 200 && result.status < 300) {
      console.log('\n✅ SUCCESS: API connection working!');
    } else if (result.status === 401 || result.status === 403) {
      console.log('\n❌ Authentication failed - check API key');
    } else if (result.status === 404) {
      console.log('\n⚠️  Endpoint not found - trying next...');
    } else if (result.status >= 500) {
      console.log('\n⚠️  Server error - API may be temporarily unavailable');
    }
  }

  // Also try alternative base URLs
  const alternativeUrls = [
    'https://api.pricelabs.co',
    'https://www.pricelabs.co/api',
    'https://app.pricelabs.co/api',
  ];

  console.log('\n' + '='.repeat(60));
  console.log('Testing alternative base URLs...');
  console.log('='.repeat(60));

  for (const baseUrl of alternativeUrls) {
    try {
      const url = `${baseUrl}/listings`;
      console.log(`\nTesting: ${url}`);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'X-API-Key': PRICELABS_API_KEY,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      const responseText = await response.text();
      let data: unknown;

      try {
        data = JSON.parse(responseText);
      } catch {
        data = responseText.substring(0, 200);
      }

      console.log(`Status: ${response.status} ${response.statusText}`);
      if (response.status >= 200 && response.status < 300) {
        console.log('✅ SUCCESS!');
        console.log('Response:', JSON.stringify(data, null, 2));
        return;
      }
    } catch (error) {
      console.log(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('Test Complete');
  console.log('='.repeat(60));
}

main().catch(console.error);

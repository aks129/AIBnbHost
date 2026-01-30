import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Home,
  BarChart3,
  RefreshCw,
  MapPin,
  Bed,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Percent,
  Building2,
} from 'lucide-react';
import Navigation from '@/components/navigation';

interface PriceLabsListing {
  id: string;
  pms: string;
  name: string;
  latitude?: string;
  longitude?: string;
  country?: string;
  city_name?: string;
  state?: string;
  no_of_bedrooms?: number;
  cleaning_fees?: number;
  min?: number;
  base?: number;
  max?: number | null;
  group?: string;
  isHidden?: boolean;
  push_enabled?: boolean;
  last_date_pushed?: string;
  occupancy_next_7?: string;
  market_occupancy_next_7?: string;
  occupancy_next_30?: string;
  market_occupancy_next_30?: string;
  adr_ytd?: number | string;
  stly_adr_ytd?: number | string;
  revenue_ytd?: number | string;
  stly_revenue_ytd?: number | string;
  bp_ratio?: number | string;
  revpar_ytd?: number | string;
  stly_revpar_ytd?: number | string;
  recommended_base_price?: number | string;
  last_refreshed_at?: string;
}

export default function PriceLabsDashboard() {
  const [selectedListing, setSelectedListing] = useState<string | null>(null);

  const { data: listings = [], isLoading, error, refetch, isFetching } = useQuery<PriceLabsListing[]>({
    queryKey: ['/api/pricelabs/listings'],
  });

  // Calculate aggregate stats
  const totalRevenue = listings.reduce((sum, l) => {
    const rev = typeof l.revenue_ytd === 'number' ? l.revenue_ytd : 0;
    return sum + rev;
  }, 0);

  const avgOccupancy = listings.length > 0
    ? listings.reduce((sum, l) => {
        const occ = parseFloat(l.occupancy_next_30?.replace('%', '') || '0');
        return sum + occ;
      }, 0) / listings.length
    : 0;

  const avgADR = listings.length > 0
    ? listings.reduce((sum, l) => {
        const adr = typeof l.adr_ytd === 'number' ? l.adr_ytd : 0;
        return sum + adr;
      }, 0) / listings.length
    : 0;

  const activeListings = listings.filter(l => l.push_enabled);

  const parseOccupancy = (value: string | undefined): number => {
    if (!value) return 0;
    return parseFloat(value.replace('%', '').trim()) || 0;
  };

  const formatCurrency = (value: number | string | undefined): string => {
    if (value === undefined || value === '-' || value === 'Unavailable') return '-';
    const num = typeof value === 'number' ? value : parseFloat(value);
    if (isNaN(num)) return '-';
    return `$${num.toLocaleString()}`;
  };

  const formatDate = (dateString: string | undefined): string => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getOccupancyColor = (occupancy: number): string => {
    if (occupancy >= 70) return 'text-green-600';
    if (occupancy >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getOccupancyBadge = (occupancy: number): string => {
    if (occupancy >= 70) return 'bg-green-100 text-green-800';
    if (occupancy >= 50) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-red-800 font-medium">Failed to load PriceLabs data</p>
                <p className="text-red-600 text-sm mt-1">Please check your API key configuration</p>
                <Button onClick={() => refetch()} variant="outline" className="mt-4">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Retry
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Dynamic Pricing Dashboard</h1>
            <p className="text-gray-600">Powered by PriceLabs - Real-time pricing optimization</p>
          </div>
          <Button
            onClick={() => refetch()}
            variant="outline"
            disabled={isFetching}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isFetching ? 'animate-spin' : ''}`} />
            Refresh Data
          </Button>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Listings</p>
                  {isLoading ? (
                    <Skeleton className="h-8 w-16 mt-1" />
                  ) : (
                    <p className="text-3xl font-bold text-gray-900">{listings.length}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    {activeListings.length} active
                  </p>
                </div>
                <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Building2 className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Revenue YTD</p>
                  {isLoading ? (
                    <Skeleton className="h-8 w-24 mt-1" />
                  ) : (
                    <p className="text-3xl font-bold text-green-600">
                      ${totalRevenue.toLocaleString()}
                    </p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">Across all properties</p>
                </div>
                <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg Occupancy (30d)</p>
                  {isLoading ? (
                    <Skeleton className="h-8 w-16 mt-1" />
                  ) : (
                    <p className={`text-3xl font-bold ${getOccupancyColor(avgOccupancy)}`}>
                      {avgOccupancy.toFixed(0)}%
                    </p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">Portfolio average</p>
                </div>
                <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <Percent className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg Daily Rate</p>
                  {isLoading ? (
                    <Skeleton className="h-8 w-20 mt-1" />
                  ) : (
                    <p className="text-3xl font-bold text-gray-900">
                      ${avgADR.toFixed(0)}
                    </p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">Year to date</p>
                </div>
                <div className="h-12 w-12 bg-orange-100 rounded-full flex items-center justify-center">
                  <BarChart3 className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="listings" className="space-y-6">
          <TabsList>
            <TabsTrigger value="listings">
              <Home className="h-4 w-4 mr-2" />
              Listings
            </TabsTrigger>
            <TabsTrigger value="performance">
              <TrendingUp className="h-4 w-4 mr-2" />
              Performance
            </TabsTrigger>
            <TabsTrigger value="pricing">
              <DollarSign className="h-4 w-4 mr-2" />
              Pricing
            </TabsTrigger>
          </TabsList>

          {/* Listings Tab */}
          <TabsContent value="listings" className="space-y-4">
            {isLoading ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {[1, 2, 3, 4].map(i => (
                  <Card key={i}>
                    <CardHeader>
                      <Skeleton className="h-6 w-48" />
                      <Skeleton className="h-4 w-32 mt-2" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-24 w-full" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {listings.map(listing => {
                  const occupancy7 = parseOccupancy(listing.occupancy_next_7);
                  const occupancy30 = parseOccupancy(listing.occupancy_next_30);
                  const marketOcc7 = parseOccupancy(listing.market_occupancy_next_7);
                  const marketOcc30 = parseOccupancy(listing.market_occupancy_next_30);

                  return (
                    <Card
                      key={listing.id}
                      className={`hover:shadow-lg transition-shadow cursor-pointer ${
                        selectedListing === listing.id ? 'ring-2 ring-blue-500' : ''
                      }`}
                      onClick={() => setSelectedListing(
                        selectedListing === listing.id ? null : listing.id
                      )}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-lg line-clamp-1">
                              {listing.name}
                            </CardTitle>
                            <CardDescription className="flex items-center gap-1 mt-1">
                              <MapPin className="h-3 w-3" />
                              {listing.city_name}, {listing.state}
                            </CardDescription>
                          </div>
                          <Badge
                            variant="outline"
                            className={listing.push_enabled ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-600'}
                          >
                            {listing.pms.toUpperCase()}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        {/* Price Info */}
                        <div className="grid grid-cols-3 gap-4 mb-4">
                          <div className="text-center p-2 bg-gray-50 rounded-lg">
                            <p className="text-xs text-gray-500">Base</p>
                            <p className="text-lg font-bold text-gray-900">
                              ${listing.base}
                            </p>
                          </div>
                          <div className="text-center p-2 bg-gray-50 rounded-lg">
                            <p className="text-xs text-gray-500">Min</p>
                            <p className="text-lg font-bold text-gray-700">
                              ${listing.min}
                            </p>
                          </div>
                          <div className="text-center p-2 bg-blue-50 rounded-lg">
                            <p className="text-xs text-blue-600">Recommended</p>
                            <p className="text-lg font-bold text-blue-700">
                              {formatCurrency(listing.recommended_base_price)}
                            </p>
                          </div>
                        </div>

                        {/* Occupancy Comparison */}
                        <div className="space-y-3">
                          <div>
                            <div className="flex items-center justify-between text-sm mb-1">
                              <span className="text-gray-600">Next 7 Days</span>
                              <div className="flex items-center gap-2">
                                <span className={`font-medium ${getOccupancyColor(occupancy7)}`}>
                                  {listing.occupancy_next_7}
                                </span>
                                {occupancy7 > marketOcc7 ? (
                                  <ArrowUpRight className="h-4 w-4 text-green-500" />
                                ) : (
                                  <ArrowDownRight className="h-4 w-4 text-red-500" />
                                )}
                                <span className="text-gray-400 text-xs">
                                  vs {listing.market_occupancy_next_7} market
                                </span>
                              </div>
                            </div>
                            <Progress value={occupancy7} className="h-2" />
                          </div>

                          <div>
                            <div className="flex items-center justify-between text-sm mb-1">
                              <span className="text-gray-600">Next 30 Days</span>
                              <div className="flex items-center gap-2">
                                <span className={`font-medium ${getOccupancyColor(occupancy30)}`}>
                                  {listing.occupancy_next_30}
                                </span>
                                {occupancy30 > marketOcc30 ? (
                                  <ArrowUpRight className="h-4 w-4 text-green-500" />
                                ) : (
                                  <ArrowDownRight className="h-4 w-4 text-red-500" />
                                )}
                                <span className="text-gray-400 text-xs">
                                  vs {listing.market_occupancy_next_30} market
                                </span>
                              </div>
                            </div>
                            <Progress value={occupancy30} className="h-2" />
                          </div>
                        </div>

                        {/* Additional Details */}
                        <div className="flex items-center justify-between mt-4 pt-4 border-t text-sm">
                          <div className="flex items-center gap-4">
                            <span className="flex items-center gap-1 text-gray-600">
                              <Bed className="h-4 w-4" />
                              {listing.no_of_bedrooms || '-'} beds
                            </span>
                            <span className="flex items-center gap-1 text-gray-600">
                              <Calendar className="h-4 w-4" />
                              {formatDate(listing.last_refreshed_at)}
                            </span>
                          </div>
                          {listing.group && (
                            <Badge variant="secondary" className="text-xs">
                              {listing.group}
                            </Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* Performance Tab */}
          <TabsContent value="performance" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {isLoading ? (
                [1, 2, 3, 4].map(i => (
                  <Card key={i}>
                    <CardContent className="pt-6">
                      <Skeleton className="h-32 w-full" />
                    </CardContent>
                  </Card>
                ))
              ) : (
                listings.map(listing => {
                  const adrYtd = typeof listing.adr_ytd === 'number' ? listing.adr_ytd : 0;
                  const stlyAdr = typeof listing.stly_adr_ytd === 'number' ? listing.stly_adr_ytd : 0;
                  const adrChange = stlyAdr > 0 ? ((adrYtd - stlyAdr) / stlyAdr * 100) : 0;

                  const revYtd = typeof listing.revenue_ytd === 'number' ? listing.revenue_ytd : 0;
                  const stlyRev = typeof listing.stly_revenue_ytd === 'number' ? listing.stly_revenue_ytd : 0;
                  const revChange = stlyRev > 0 ? ((revYtd - stlyRev) / stlyRev * 100) : 0;

                  return (
                    <Card key={listing.id}>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg line-clamp-1">{listing.name}</CardTitle>
                        <CardDescription>
                          {listing.city_name}, {listing.state}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 gap-4">
                          {/* ADR */}
                          <div className="p-4 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-600 mb-1">ADR (YTD)</p>
                            <p className="text-2xl font-bold">
                              {formatCurrency(listing.adr_ytd)}
                            </p>
                            {stlyAdr > 0 && (
                              <div className={`flex items-center gap-1 text-sm mt-1 ${
                                adrChange >= 0 ? 'text-green-600' : 'text-red-600'
                              }`}>
                                {adrChange >= 0 ? (
                                  <TrendingUp className="h-4 w-4" />
                                ) : (
                                  <TrendingDown className="h-4 w-4" />
                                )}
                                {Math.abs(adrChange).toFixed(1)}% vs STLY
                              </div>
                            )}
                          </div>

                          {/* Revenue */}
                          <div className="p-4 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-600 mb-1">Revenue (YTD)</p>
                            <p className="text-2xl font-bold text-green-700">
                              {formatCurrency(listing.revenue_ytd)}
                            </p>
                            {stlyRev > 0 && (
                              <div className={`flex items-center gap-1 text-sm mt-1 ${
                                revChange >= 0 ? 'text-green-600' : 'text-red-600'
                              }`}>
                                {revChange >= 0 ? (
                                  <TrendingUp className="h-4 w-4" />
                                ) : (
                                  <TrendingDown className="h-4 w-4" />
                                )}
                                {Math.abs(revChange).toFixed(1)}% vs STLY
                              </div>
                            )}
                          </div>

                          {/* RevPAR */}
                          <div className="p-4 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-600 mb-1">RevPAR (YTD)</p>
                            <p className="text-2xl font-bold">
                              {formatCurrency(listing.revpar_ytd)}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              STLY: {formatCurrency(listing.stly_revpar_ytd)}
                            </p>
                          </div>

                          {/* BP Ratio */}
                          <div className="p-4 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-600 mb-1">BP Ratio</p>
                            <p className="text-2xl font-bold">
                              {listing.bp_ratio !== 'Unavailable' && typeof listing.bp_ratio === 'number'
                                ? listing.bp_ratio.toFixed(2)
                                : '-'}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              Base price efficiency
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          </TabsContent>

          {/* Pricing Tab */}
          <TabsContent value="pricing" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Pricing Summary</CardTitle>
                <CardDescription>
                  Overview of base prices and recommendations across your portfolio
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-64 w-full" />
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4 font-medium text-gray-600">Property</th>
                          <th className="text-center py-3 px-4 font-medium text-gray-600">Platform</th>
                          <th className="text-right py-3 px-4 font-medium text-gray-600">Base Price</th>
                          <th className="text-right py-3 px-4 font-medium text-gray-600">Min Price</th>
                          <th className="text-right py-3 px-4 font-medium text-gray-600">Recommended</th>
                          <th className="text-right py-3 px-4 font-medium text-gray-600">Cleaning</th>
                          <th className="text-center py-3 px-4 font-medium text-gray-600">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {listings.map(listing => (
                          <tr key={listing.id} className="border-b hover:bg-gray-50">
                            <td className="py-3 px-4">
                              <div>
                                <p className="font-medium text-gray-900 line-clamp-1">
                                  {listing.name}
                                </p>
                                <p className="text-sm text-gray-500">
                                  {listing.city_name}, {listing.state}
                                </p>
                              </div>
                            </td>
                            <td className="text-center py-3 px-4">
                              <Badge variant="outline">{listing.pms.toUpperCase()}</Badge>
                            </td>
                            <td className="text-right py-3 px-4 font-medium">
                              ${listing.base}
                            </td>
                            <td className="text-right py-3 px-4 text-gray-600">
                              ${listing.min}
                            </td>
                            <td className="text-right py-3 px-4">
                              <span className="font-medium text-blue-600">
                                {formatCurrency(listing.recommended_base_price)}
                              </span>
                            </td>
                            <td className="text-right py-3 px-4 text-gray-600">
                              {listing.cleaning_fees ? `$${listing.cleaning_fees}` : '-'}
                            </td>
                            <td className="text-center py-3 px-4">
                              <Badge
                                className={listing.push_enabled
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-gray-100 text-gray-600'
                                }
                              >
                                {listing.push_enabled ? 'Active' : 'Paused'}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Price Recommendations */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {!isLoading && listings
                .filter(l => l.recommended_base_price && l.recommended_base_price !== 'Unavailable')
                .map(listing => {
                  const recommended = typeof listing.recommended_base_price === 'number'
                    ? listing.recommended_base_price
                    : parseFloat(listing.recommended_base_price as string);
                  const current = listing.base || 0;
                  const diff = recommended - current;
                  const diffPercent = current > 0 ? (diff / current * 100) : 0;

                  return (
                    <Card key={listing.id} className={diff > 0 ? 'border-green-200' : diff < 0 ? 'border-red-200' : ''}>
                      <CardContent className="pt-6">
                        <p className="font-medium text-gray-900 line-clamp-1 mb-2">{listing.name}</p>
                        <div className="flex items-end justify-between">
                          <div>
                            <p className="text-sm text-gray-500">Current: ${current}</p>
                            <p className="text-2xl font-bold text-blue-600">
                              ${recommended.toFixed(0)}
                            </p>
                          </div>
                          <div className={`flex items-center gap-1 text-lg font-medium ${
                            diff > 0 ? 'text-green-600' : diff < 0 ? 'text-red-600' : 'text-gray-600'
                          }`}>
                            {diff > 0 ? (
                              <TrendingUp className="h-5 w-5" />
                            ) : diff < 0 ? (
                              <TrendingDown className="h-5 w-5" />
                            ) : null}
                            {diff > 0 ? '+' : ''}{diffPercent.toFixed(1)}%
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { realDataService } from '../services/realDataService';

export function useRealData() {
  const [carbonCredits, setCarbonCredits] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [forestData, setForestData] = useState([]);
  const [emissionsData, setEmissionsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log('Starting to load real environmental data...');
        
        // Load all data in parallel
        const [credits, companiesData, forest, emissions] = await Promise.all([
          realDataService.generateRealCarbonCredits(),
          realDataService.generateRealCompanies(),
          realDataService.getWorldBankForestData(),
          realDataService.getWorldBankEmissionsData()
        ]);

        console.log('Successfully loaded all real data:', {
          credits: credits.length,
          companies: companiesData.length,
          forest: forest.length,
          emissions: emissions.length
        });

        setCarbonCredits(credits);
        setCompanies(companiesData);
        setForestData(forest);
        setEmissionsData(emissions);
      } catch (err) {
        console.error('Error loading real data:', err);
        setError('Failed to load some environmental data from APIs. Using available data and fallbacks.');
        
        // Load fallback data
        try {
          const [credits, companiesData] = await Promise.all([
            realDataService.generateRealCarbonCredits(),
            realDataService.generateRealCompanies()
          ]);
          setCarbonCredits(credits);
          setCompanies(companiesData);
        } catch (fallbackErr) {
          console.error('Fallback data also failed:', fallbackErr);
          setError('Unable to load any data. Please refresh the page.');
        }
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  return {
    carbonCredits,
    companies,
    forestData,
    emissionsData,
    loading,
    error,
    refetch: () => {
      setLoading(true);
      setError(null);
      // Reload data without full page refresh
      const loadData = async () => {
        try {
          const [credits, companiesData, forest, emissions] = await Promise.all([
            realDataService.generateRealCarbonCredits(),
            realDataService.generateRealCompanies(),
            realDataService.getWorldBankForestData(),
            realDataService.getWorldBankEmissionsData()
          ]);
          setCarbonCredits(credits);
          setCompanies(companiesData);
          setForestData(forest);
          setEmissionsData(emissions);
        } catch (err) {
          setError('Failed to reload data');
        } finally {
          setLoading(false);
        }
      };
      loadData();
    }
  };
}

export function useMarketAnalytics() {
  const [analytics, setAnalytics] = useState({
    totalCredits: 0,
    activeProjects: 0,
    totalValueLocked: 0,
    verificationRate: 0,
    avgPrice: 0,
    priceChange: 0,
    activeBuyers: 0,
    volume24h: 0,
    co2Offset: 0
  });

  const { carbonCredits, companies, loading } = useRealData();

  useEffect(() => {
    if (!loading && carbonCredits.length > 0) {
      const totalCredits = carbonCredits.reduce((sum, credit) => sum + credit.availableCredits, 0);
      const activeProjects = carbonCredits.length;
      const avgPrice = carbonCredits.reduce((sum, credit) => sum + credit.price, 0) / carbonCredits.length;
      const totalValueLocked = totalCredits * avgPrice;
      const verificationRate = (carbonCredits.filter(c => c.verified).length / carbonCredits.length) * 100;
      const avgPriceChange = carbonCredits.reduce((sum, credit) => sum + credit.priceChange, 0) / carbonCredits.length;
      const activeBuyers = companies.length * 8; // Estimate multiple buyers per company
      const volume24h = totalValueLocked * 0.05; // Estimate 5% daily volume
      const co2Offset = carbonCredits.reduce((sum, credit) => sum + credit.co2Reduction, 0);

      setAnalytics({
        totalCredits,
        activeProjects,
        totalValueLocked: Math.round(totalValueLocked),
        verificationRate: Math.round(verificationRate * 10) / 10,
        avgPrice: Math.round(avgPrice * 100) / 100,
        priceChange: Math.round(avgPriceChange * 100) / 100,
        activeBuyers,
        volume24h: Math.round(volume24h),
        co2Offset
      });
    }
  }, [carbonCredits, companies, loading]);

  return { analytics, loading };
}
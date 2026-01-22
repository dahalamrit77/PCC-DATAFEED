import { useEffect, useState, useMemo } from 'react';
import { coverageService } from '../services';
import type { Coverage } from '../types/patient.types';

interface CoverageMap {
  [patientId: number]: Coverage | null;
}

/**
 * Hook to batch fetch coverage for multiple patients
 * This prevents individual API calls for each patient row
 */
export const usePatientCoverage = (patientIds: number[]) => {
  const [coverageMap, setCoverageMap] = useState<CoverageMap>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCoverage = async () => {
      if (patientIds.length === 0) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        // Optimize: Batch in smaller chunks to avoid overwhelming the API
        // Process in batches of 10 to improve performance
        const BATCH_SIZE = 10;
        const batches: number[][] = [];
        
        for (let i = 0; i < patientIds.length; i += BATCH_SIZE) {
          batches.push(patientIds.slice(i, i + BATCH_SIZE));
        }

        const allResults: Array<{ patientId: number; coverage: Coverage | null }> = [];
        
        // Process batches sequentially to avoid overwhelming the server
        for (const batch of batches) {
          const batchPromises = batch.map(async (patientId) => {
            try {
              const coverage = await coverageService.getPatientCoverage(patientId);
              return { patientId, coverage };
            } catch (error) {
              console.warn(`[usePatientCoverage] Failed to fetch coverage for patient ${patientId}`, error);
              return { patientId, coverage: null };
            }
          });

          const batchResults = await Promise.all(batchPromises);
          allResults.push(...batchResults);
          
          // Update coverage map incrementally for better UX
          const incrementalMap: CoverageMap = {};
          allResults.forEach(({ patientId, coverage }) => {
            incrementalMap[patientId] = coverage;
          });
          setCoverageMap(incrementalMap);
        }

        // Final update with all results
        const finalMap: CoverageMap = {};
        allResults.forEach(({ patientId, coverage }) => {
          finalMap[patientId] = coverage;
        });
        setCoverageMap(finalMap);
      } catch (error) {
        console.error('[usePatientCoverage] Error fetching coverage:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCoverage();
  }, [patientIds.join(',')]); // Re-fetch if patient IDs change

  const getCoverage = useMemo(() => {
    return (patientId: number): Coverage | null => {
      return coverageMap[patientId] || null;
    };
  }, [coverageMap]);

  return { getCoverage, loading };
};


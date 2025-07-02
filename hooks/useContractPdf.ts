import { useState } from 'react';
import { Booking } from '@/src/lib/types/Booking';

interface UseContractPdfResult {
  contractUrl: string | null;
  isLoading: boolean;
  error: Error | null;
  downloadContract: () => void;
  openContract: () => void;
}

export function useContractPdf(booking: Booking): UseContractPdfResult {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  const contractUrl = booking.contractUrl || null;
  
  const downloadContract = async () => {
    if (!contractUrl) {
      setError(new Error('No contract URL available'));
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Create a temporary anchor element to trigger download
      const a = document.createElement('a');
      a.href = contractUrl;
      a.download = `revenue-split-contract-${booking.id}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) {
      console.error('Error downloading contract:', err);
      setError(err instanceof Error ? err : new Error('Failed to download contract'));
    } finally {
      setIsLoading(false);
    }
  };
  
  const openContract = () => {
    if (!contractUrl) {
      setError(new Error('No contract URL available'));
      return;
    }
    
    // Open the contract URL in a new tab
    window.open(contractUrl, '_blank');
  };
  
  return {
    contractUrl,
    isLoading,
    error,
    downloadContract,
    openContract
  };
}

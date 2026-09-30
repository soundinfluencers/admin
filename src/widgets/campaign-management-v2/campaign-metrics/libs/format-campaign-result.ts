export const formatCampaignResult = (cpm: number | undefined | null) => {
  if (cpm === undefined || cpm === null || cpm === 0) return "Waiting for campaign insights";
  
  if(cpm < 3) return "Excellent";
  if(cpm < 5) return "Highly above average";
  if(cpm < 9) return "Above average";
  if(cpm < 12) return "Average";
  
  return "Low average";
}

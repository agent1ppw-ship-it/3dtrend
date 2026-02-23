declare module "google-trends-api" {
  interface InterestOverTimeParams {
    keyword: string;
    geo?: string;
    timeframe?: string;
  }
  
  interface InterestOverTimeResponse {
    default: {
      timelineData: Array<{
        time: string;
        value: number[];
        formattedValue: string[];
      }>;
    };
  }
  
  function interestOverTime(params: InterestOverTimeParams): Promise<string>;
  
  export default {
    interestOverTime,
  };
}

declare module '@jackpost/lang' {
  export function jpToJsonV2(jpContent: string): any;
  export function jsonToJpV2(jsonData: any): string;
  export function jpToEnvJsonV2(jpContent: string): any;
  export function envJsonToJpV2(jsonData: any): string;
  export function collectionJpToJson(jpContent: string): any;
  export function jsonToCollectionJp(jsonData: any): string;
  export function dotenvToJson(envContent: string): Record<string, string>;
  export function outdentString(str: string, spaces?: number): string;
}

import * as SecureStore from 'expo-secure-store';

const KEY = 'openai_api_key';

let cached: string | null | undefined;

export async function getApiKey(): Promise<string | null> {
  if (cached === undefined) cached = await SecureStore.getItemAsync(KEY);
  return cached;
}

export async function setApiKey(value: string) {
  const trimmed = value.trim();
  if (trimmed) await SecureStore.setItemAsync(KEY, trimmed);
  else await SecureStore.deleteItemAsync(KEY);
  cached = trimmed || null;
}

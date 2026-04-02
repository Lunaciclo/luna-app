import { NativeModules, Platform } from "react-native";

const IOS_KEY = process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY ?? "";
const ANDROID_KEY = process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY ?? "";

let isConfigured = false;

/**
 * Check if the RevenueCat native module is available.
 * It won't be in Expo Go — only in development/production builds.
 */
function isRevenueCatAvailable(): boolean {
  return !!NativeModules.RNPurchases;
}

/**
 * Lazily get the Purchases SDK. We avoid a top-level import because
 * react-native-purchases accesses its native module at import time,
 * which crashes Expo Go where the native module doesn't exist.
 */
function getPurchases() {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  return require("react-native-purchases").default;
}

/**
 * Ensure RevenueCat is configured before making any API call.
 * Returns true if ready to use, false otherwise.
 */
function ensureConfigured(): boolean {
  if (!isRevenueCatAvailable()) {
    console.warn("[RevenueCat] Native module not available");
    return false;
  }
  if (isConfigured) return true;

  const apiKey = Platform.OS === "ios" ? IOS_KEY : ANDROID_KEY;
  if (!apiKey) {
    console.warn(
      `[RevenueCat] No API key for ${Platform.OS}. Check EXPO_PUBLIC_REVENUECAT_${Platform.OS === "ios" ? "IOS" : "ANDROID"}_KEY`,
    );
    return false;
  }

  try {
    getPurchases().configure({ apiKey });
    isConfigured = true;
    console.log(
      `[RevenueCat] Configured via ensureConfigured for ${Platform.OS}`,
    );
    return true;
  } catch (e) {
    console.error("[RevenueCat] Configure failed:", e);
    return false;
  }
}

export async function initRevenueCat(userId?: string): Promise<void> {
  if (!isRevenueCatAvailable()) {
    console.warn(
      "[RevenueCat] Skipping init — native module not available (Expo Go?)",
    );
    return;
  }
  const apiKey = Platform.OS === "ios" ? IOS_KEY : ANDROID_KEY;
  if (!apiKey) {
    console.warn(`[RevenueCat] Skipping init — no API key for ${Platform.OS}`);
    return;
  }

  try {
    getPurchases().configure({ apiKey, appUserID: userId });
    isConfigured = true;
    console.log(
      `[RevenueCat] Initialized for ${Platform.OS}${userId ? ` (user: ${userId})` : ""}`,
    );
  } catch (e) {
    console.error("[RevenueCat] Init failed:", e);
  }
}

export async function getOfferings() {
  if (!ensureConfigured()) return null;
  try {
    const offerings = await getPurchases().getOfferings();
    return offerings.current;
  } catch {
    return null;
  }
}

export async function purchasePackage(packageToPurchase: unknown) {
  if (!ensureConfigured()) return null;
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await getPurchases().purchasePackage(
      packageToPurchase as any,
    );
    return result;
  } catch {
    return null;
  }
}

export async function restorePurchases() {
  if (!ensureConfigured()) return null;
  try {
    const customerInfo = await getPurchases().restorePurchases();
    return customerInfo;
  } catch {
    return null;
  }
}

export async function checkSubscriptionStatus(): Promise<boolean> {
  if (!ensureConfigured()) return false;
  try {
    const customerInfo = await getPurchases().getCustomerInfo();
    return Object.keys(customerInfo.entitlements.active).length > 0;
  } catch {
    return false;
  }
}

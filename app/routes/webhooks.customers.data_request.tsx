import type { ActionFunctionArgs } from "react-router";
import { authenticate } from "../shopify.server";

/**
 * GDPR compliance webhook: customers/data_request.
 *
 * Shopify sends this when a shopper asks the merchant for the data the app has
 * stored about them. This app stores no customer data — it only injects a
 * storefront widget loader via a theme app extension — so there is nothing to
 * return. We verify the HMAC (via authenticate.webhook) and acknowledge with 200.
 *
 * See: https://shopify.dev/docs/apps/build/privacy-law-compliance
 */
export const action = async ({ request }: ActionFunctionArgs) => {
  const { shop, topic } = await authenticate.webhook(request);

  console.log(`Received ${topic} webhook for ${shop}: no customer data stored.`);

  return new Response();
};

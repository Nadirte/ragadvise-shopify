import type { ActionFunctionArgs } from "react-router";
import { authenticate } from "../shopify.server";

/**
 * GDPR compliance webhook: customers/redact.
 *
 * Shopify sends this when a shopper's data must be deleted. This app stores no
 * customer data, so there is nothing to redact. We verify the HMAC and ack 200.
 *
 * See: https://shopify.dev/docs/apps/build/privacy-law-compliance
 */
export const action = async ({ request }: ActionFunctionArgs) => {
  const { shop, topic } = await authenticate.webhook(request);

  console.log(`Received ${topic} webhook for ${shop}: no customer data to redact.`);

  return new Response();
};

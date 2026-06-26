import type { ActionFunctionArgs } from "react-router";
import { authenticate } from "../shopify.server";
import db from "../db.server";

/**
 * GDPR compliance webhook: shop/redact.
 *
 * Shopify sends this 48 hours after a shop uninstalls the app, asking us to
 * delete the shop's data. The only shop-scoped data we keep is the OAuth session
 * row, so we delete any remaining sessions for the shop. We verify the HMAC and
 * acknowledge with 200.
 *
 * See: https://shopify.dev/docs/apps/build/privacy-law-compliance
 */
export const action = async ({ request }: ActionFunctionArgs) => {
  const { shop, topic } = await authenticate.webhook(request);

  console.log(`Received ${topic} webhook for ${shop}: deleting shop sessions.`);

  await db.session.deleteMany({ where: { shop } });

  return new Response();
};

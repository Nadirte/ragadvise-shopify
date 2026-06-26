import type { HeadersFunction, LoaderFunctionArgs } from "react-router";
import { useLoaderData } from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";

import { authenticate } from "../shopify.server";

// Block handle = the theme app extension block filename (without .liquid).
const BLOCK_HANDLE = "ragadvise-widget";
const RAGADVISE_DASHBOARD_URL = "https://app.ragadvise.com";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);

  // The theme app extension UUID is assigned by Shopify on `shopify app deploy`.
  // When set (e.g. injected at build/deploy time), we can deep-link the merchant
  // straight to the theme editor with our app embed pre-activated. Otherwise we
  // fall back to the generic "App embeds" panel.
  // eslint-disable-next-line no-undef
  const extensionUuid = process.env.THEME_APP_EXTENSION_UUID || "";

  const editorBase = `https://${session.shop}/admin/themes/current/editor`;
  const themeEditorUrl = extensionUuid
    ? `${editorBase}?context=apps&activateAppId=${extensionUuid}/${BLOCK_HANDLE}`
    : `${editorBase}?context=apps`;

  return { themeEditorUrl };
};

export default function Index() {
  const { themeEditorUrl } = useLoaderData<typeof loader>();

  const openThemeEditor = () => window.open(themeEditorUrl, "_blank");
  const openDashboard = () => window.open(RAGADVISE_DASHBOARD_URL, "_blank");

  return (
    <s-page heading="Set up your Site Assistant">
      <s-button slot="primary-action" onClick={openThemeEditor}>
        Open theme editor
      </s-button>

      <s-section heading="Add the assistant to your storefront">
        <s-paragraph>
          The RagAdvise assistant is added through your theme&apos;s app embeds, so it loads
          on every page without editing any code. Follow these three steps.
        </s-paragraph>

        <s-stack direction="block" gap="base">
          <s-box padding="base" borderWidth="base" borderRadius="base">
            <s-stack direction="block" gap="base">
              <s-heading>1. Open the theme editor</s-heading>
              <s-paragraph>
                Click “Open theme editor” above. It opens your live theme with the App embeds
                panel.
              </s-paragraph>
            </s-stack>
          </s-box>

          <s-box padding="base" borderWidth="base" borderRadius="base">
            <s-stack direction="block" gap="base">
              <s-heading>2. Turn on RagAdvise Site Assistant</s-heading>
              <s-paragraph>
                In the App embeds list, toggle “RagAdvise Site Assistant” on, then paste your
                Workspace slug into the block setting.
              </s-paragraph>
            </s-stack>
          </s-box>

          <s-box padding="base" borderWidth="base" borderRadius="base">
            <s-stack direction="block" gap="base">
              <s-heading>3. Save</s-heading>
              <s-paragraph>
                Click Save in the theme editor. Visit your storefront — the assistant appears in
                the corner of every page.
              </s-paragraph>
            </s-stack>
          </s-box>
        </s-stack>
      </s-section>

      <s-section slot="aside" heading="Where is my workspace slug?">
        <s-paragraph>
          Log in to your RagAdvise dashboard, open Site Assistant → Install, and copy the value
          of data-workspace-slug from the embed snippet.
        </s-paragraph>
        <s-button onClick={openDashboard}>Open RagAdvise dashboard</s-button>
      </s-section>

      <s-section slot="aside" heading="Need an account?">
        <s-paragraph>
          Create a free RagAdvise account, configure your assistant, then return here to add it
          to your store.
        </s-paragraph>
      </s-section>
    </s-page>
  );
}

export const headers: HeadersFunction = (headersArgs) => {
  return boundary.headers(headersArgs);
};

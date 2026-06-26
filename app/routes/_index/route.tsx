import type { LoaderFunctionArgs } from "react-router";
import { redirect, Form, useLoaderData } from "react-router";

import { login } from "../../shopify.server";

import styles from "./styles.module.css";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);

  if (url.searchParams.get("shop")) {
    throw redirect(`/app?${url.searchParams.toString()}`);
  }

  return { showForm: Boolean(login) };
};

export default function App() {
  const { showForm } = useLoaderData<typeof loader>();

  return (
    <div className={styles.index}>
      <div className={styles.content}>
        <h1 className={styles.heading}>RagAdvise Site Assistant</h1>
        <p className={styles.text}>
          Add an AI assistant to your storefront that answers customer questions, books
          appointments, and helps shoppers — installed with one click, no theme code.
        </p>
        {showForm && (
          <Form className={styles.form} method="post" action="/auth/login">
            <label className={styles.label}>
              <span>Shop domain</span>
              <input className={styles.input} type="text" name="shop" />
              <span>e.g: my-shop-domain.myshopify.com</span>
            </label>
            <button className={styles.button} type="submit">
              Log in
            </button>
          </Form>
        )}
        <ul className={styles.list}>
          <li>
            <strong>One-click install</strong>. Enable the assistant from your theme editor —
            no Liquid editing, works on every page.
          </li>
          <li>
            <strong>AI answers, on brand</strong>. The assistant is trained on your RagAdvise
            knowledge base and configured from your RagAdvise dashboard.
          </li>
          <li>
            <strong>Free &amp; lightweight</strong>. A small loader script that won&apos;t slow
            your store down.
          </li>
        </ul>
      </div>
    </div>
  );
}

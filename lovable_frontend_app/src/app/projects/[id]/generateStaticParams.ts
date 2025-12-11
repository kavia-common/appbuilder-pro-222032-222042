export const dynamic = "force-static";

/**
 * PUBLIC_INTERFACE
 * Provide params for static export builds.
 * This returns an empty array to allow export with client-side navigation to dynamic routes.
 * Replace with actual project IDs for pre-rendering in real deployments.
 */
export async function generateStaticParams(): Promise<Array<{ id: string }>> {
  return [];
}

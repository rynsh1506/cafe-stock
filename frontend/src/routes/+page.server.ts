import type { ServerLoad } from "@sveltejs/kit";

export interface HomePageData {
  renderedAt: string;
}

export const load: ServerLoad = (): HomePageData => {
  return {
    renderedAt: new Date().toISOString(),
  };
};

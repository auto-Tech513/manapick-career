import config from "../content/network-site.json";
import { networkUrl } from "./network-shared";

export type Station = {
  id: string;
  code: string;
  number: string;
  name: string;
  short: string;
  role: string;
  description: string;
  url: string;
  color: string;
  colorInk: string;
  current: boolean;
};

/**
 * The five manapick stations （学びの路線図）. Data lives in
 * content/network-site.json so a sixth station (e.g. politics) can be
 * added by appending one entry there — rail, footer route map, the SP
 * transfer sheet and station badges all render from this array.
 */
export const stations: Station[] = config.sites.map((site) => ({
  id: site.id,
  code: site.code,
  number: site.number,
  name: site.name,
  short: site.short,
  role: site.role,
  description: site.description,
  url: site.url,
  color: site.color,
  colorInk: site.colorInk,
  current: site.id === config.id,
}));

export const currentStation: Station =
  stations.find((station) => station.current) ?? stations[0];

export function stationHref(station: Station, placement: string): string {
  return station.current ? "/" : networkUrl(station.url, config.id, placement);
}

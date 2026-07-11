"use client";
declare global{interface Window{gtag?:(...args:unknown[])=>void}}
export type CareerEvent="career_open"|"route_result"|"network_click"|"compare"|"pr_click";
export function trackEvent(name:CareerEvent,params:Record<string,string|number|boolean>={}){window.gtag?.("event",name,params)}

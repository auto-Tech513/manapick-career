"use client";
import { useEffect } from "react";
import { trackEvent, type CareerEvent } from "@/lib/analytics";
import { externalRel } from "@/lib/network-links";

export function PageEvent({name,params}:{name:CareerEvent;params?:Record<string,string|number|boolean>}){useEffect(()=>{trackEvent(name,params)},[name,params]);return null}
export function TrackedExternalLink({href,eventLabel,children,className}:{href:string;eventLabel:string;children:React.ReactNode;className?:string}){return <a className={className} href={href} target="_blank" rel={externalRel(href)} data-network-label={eventLabel}>{children}</a>}

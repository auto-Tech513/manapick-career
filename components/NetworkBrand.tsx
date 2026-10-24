import Image from "next/image";
import config from "../content/network-site.json";
export default function NetworkBrand({ className = "" }: { className?: string }) {
  return <span className={`mp-brand ${className}`}><Image src="/network/brand.svg" width={38} height={38} alt="" unoptimized /><span>{config.name}</span></span>;
}

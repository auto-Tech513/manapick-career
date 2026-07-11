export function AdSlot({label="広告"}:{label?:string}){
  if(process.env.NEXT_PUBLIC_MANUAL_ADS!=="true") return null;
  return <aside className="ad-slot" aria-label={label}><small>{label}</small><div>承認済みの手動広告枠</div></aside>;
}

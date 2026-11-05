"use client";
import { track } from "@/lib/device";
const ok = (u?: string | null) => !!u && /^https:\/\//.test(u);
export default function FollowLinks({ photo, whatsapp, instagram }: { photo?: string | null; whatsapp?: string | null; instagram?: string | null }) {
  const A = ({ href, ev, title, sub }: { href: string; ev: string; title: string; sub: string }) => (
    <a className="row card" href={href} target="_blank" rel="noopener noreferrer" onClick={() => track(ev)} style={{ color: "inherit", textDecoration: "none" }}><span><b>{title}</b><p>{sub}</p></span>↗</a>
  );
  return (<>
    {ok(photo) && <A href={photo!} ev="opened_photo_link" title="Find my booth photos" sub="Opens the photo app. Scan your face to see them." />}
    {(ok(whatsapp) || ok(instagram)) && <h2>Stay connected</h2>}
    {ok(whatsapp) && <A href={whatsapp!} ev="followed_whatsapp" title="WhatsApp channel" sub="Opens WhatsApp" />}
    {ok(instagram) && <A href={instagram!} ev="followed_instagram" title="Instagram page" sub="Opens Instagram" />}
  </>);
}

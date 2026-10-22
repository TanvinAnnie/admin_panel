
import Image from "next/image";

interface TeamMemberLivePreviewProps {
  name: string;
  position: string;
  image: string;
  facebook: string;
  instagram: string;
  linkedin: string;
  order: number;
  isActive: boolean;
}

export default function TeamMemberLivePreview({
  name,
  position,
  image,
  facebook,
  instagram,
  linkedin,
  order,
  isActive,
}: TeamMemberLivePreviewProps) {
  const socialLinks = [
    { label: "Facebook", url: facebook },
    { label: "Instagram", url: instagram },
    { label: "LinkedIn", url: linkedin },
  ].filter((item) => item.url.trim());

  return (
    <section className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div>
        <h2 className="text-base font-bold text-slate-900">
          Live Preview
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          {"Preview how this member's information will look."}
        </p>
      </div>

      <article className="mx-auto mt-5 w-full max-w-sm min-w-0 overflow-hidden rounded-xl border border-slate-100 bg-white">
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100">
          {image ? (
            <Image
              src={image}
              alt={name || "Team member preview"}
              fill
              sizes="(max-width: 639px) 100vw, 384px"
              className="object-cover object-top"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-slate-400">
              Profile image preview
            </div>
          )}
        </div>

        <div className="p-4">
          <p className="break-words text-xl font-medium text-slate-900">
            {name || "Team member name"}
          </p>

          <p className="mt-2 break-words text-sm text-slate-600">
            {position || "Member position"}
          </p>

          <div className="mt-3 flex flex-wrap gap-2">
            {socialLinks.map((social) => (
              <span
                key={social.label}
                className="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-600"
              >
                {social.label}
              </span>
            ))}

            {socialLinks.length === 0 && (
              <span className="text-xs text-slate-400">
                Social links will appear here
              </span>
            )}
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3">
            <span className="text-xs text-slate-400">
              Order: {order}
            </span>

            <span
              className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                isActive
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-slate-100 text-slate-600"
              }`}
            >
              {isActive ? "Active" : "Inactive"}
            </span>
          </div>
        </div>
      </article>
    </section>
  );
}

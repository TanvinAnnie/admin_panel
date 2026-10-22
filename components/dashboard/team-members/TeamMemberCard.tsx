
"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

export interface TeamMemberItem {
  _id: string;
  name: string;
  position: string;
  image: string;
  imagePublicId?: string;
  facebook: string;
  instagram: string;
  linkedin: string;
  order: number;
  isActive: boolean;
  createdAt?: string;
}

interface TeamMemberCardProps {
  member: TeamMemberItem;
  deleting: boolean;
  onDelete: (member: TeamMemberItem) => void;
}

export default function TeamMemberCard({
  member,
  deleting,
  onDelete,
}: TeamMemberCardProps) {
  const [imageError, setImageError] = useState(false);

  const socialLinks = [
    { label: "Facebook", url: member.facebook },
    { label: "Instagram", url: member.instagram },
    { label: "LinkedIn", url: member.linkedin },
  ].filter((item) => item.url.trim());

  return (
    <article className="flex min-w-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md">
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100">
        {member.image && !imageError ? (
          <Image
            src={member.image}
            alt={member.name}
            fill
            sizes="(max-width: 639px) 100vw, (max-width: 1279px) 50vw, 33vw"
            className="object-cover object-top"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2 p-4 text-center text-sm text-slate-500">
            <span className="text-3xl" aria-hidden="true">🖼️</span>
            <span>Image unavailable</span>
            {member.image && (
              <span className="break-all text-xs text-slate-400">
                Check the saved image URL
              </span>
            )}
          </div>
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col p-4 sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="min-w-0">
            <h2 className="break-words text-lg font-bold text-slate-900">
              {member.name}
            </h2>
            <p className="mt-1 break-words text-sm text-slate-500">
              {member.position}
            </p>
          </div>

          <span
            className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${
              member.isActive
                ? "bg-emerald-50 text-emerald-700"
                : "bg-slate-100 text-slate-600"
            }`}
          >
            {member.isActive ? "Active" : "Inactive"}
          </span>
        </div>

        <div className="mt-4 flex min-w-0 flex-wrap items-center gap-2">
          {socialLinks.length > 0 ? (
            socialLinks.map((social) => (
              <a
                key={social.label}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${member.name} on ${social.label}`}
                className="inline-flex min-h-9 items-center rounded-lg border border-slate-200 px-3 text-xs font-medium text-slate-600 transition hover:bg-slate-50"
              >
                {social.label}
              </a>
            ))
          ) : (
            <span className="text-xs text-slate-400">
              No social links
            </span>
          )}
        </div>

        <p className="mt-3 text-xs text-slate-400">
          Display order: {member.order}
        </p>

        <div className="mt-auto flex flex-wrap justify-end gap-2 border-t border-slate-100 pt-4">
          <Link
            href={`/team-members/${member._id}/edit`}
            className="inline-flex min-h-10 items-center justify-center rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Edit
          </Link>

          <button
            type="button"
            onClick={() => onDelete(member)}
            disabled={deleting}
            className="inline-flex min-h-10 items-center justify-center rounded-lg border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {deleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </article>
  );
}

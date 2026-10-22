
"use client";

import Image from "next/image";
import type { AboutFormData } from "./AboutForm";

interface AboutLivePreviewProps {
  form: AboutFormData;
}

export default function AboutLivePreview({
  form,
}: AboutLivePreviewProps) {
  return (
    <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      {/* Header */}
      <div className="border-b border-gray-200 p-5 sm:p-7">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Live Preview
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Preview how your About Us content could look on the website.
            </p>
          </div>

          <span
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              form.isActive
                ? "bg-green-50 text-green-700"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            {form.isActive ? "Active" : "Hidden"}
          </span>
        </div>
      </div>

      {/* Preview content */}
      <div className="p-5 sm:p-7">
        <div className="grid gap-8 md:grid-cols-2 md:items-center">
          {/* Image */}
          <div className="relative min-h-64 overflow-hidden rounded-xl bg-gray-100">
            {form.image ? (
              <Image
                src={form.image}
                alt={form.title || "Maheen Accessories About Us"}
                fill
                unoptimized
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
              />
            ) : (
              <div className="flex min-h-64 items-center justify-center px-4 text-center text-sm text-gray-400">
                Your About Us image will appear here
              </div>
            )}
          </div>

          {/* Brand story */}
          <div className="py-2">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">
              About Maheen Accessories
            </p>

            <h3 className="mt-3 text-2xl font-bold leading-tight text-gray-900 sm:text-3xl">
              {form.title || "Your About Us Title"}
            </h3>

            {form.subtitle && (
              <p className="mt-3 text-base font-medium text-gray-600">
                {form.subtitle}
              </p>
            )}

            <p className="mt-5 whitespace-pre-wrap text-sm leading-7 text-gray-600">
              {form.story || "Your brand story will appear here."}
            </p>
          </div>
        </div>

        {/* Mission and vision */}
        {(form.mission || form.vision) && (
          <div className="mt-8 grid gap-5 border-t border-gray-100 pt-8 sm:grid-cols-2">
            {form.mission && (
              <div className="rounded-xl bg-gray-50 p-5">
                <h4 className="text-base font-semibold text-gray-900">
                  Our Mission
                </h4>

                <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-gray-600">
                  {form.mission}
                </p>
              </div>
            )}

            {form.vision && (
              <div className="rounded-xl bg-gray-50 p-5">
                <h4 className="text-base font-semibold text-gray-900">
                  Our Vision
                </h4>

                <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-gray-600">
                  {form.vision}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

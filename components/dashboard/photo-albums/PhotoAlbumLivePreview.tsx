
"use client";

import type { AlbumFormData } from "./PhotoAlbumForm";

interface PhotoAlbumLivePreviewProps {
  album: AlbumFormData;
}

export default function PhotoAlbumLivePreview({
  album,
}: PhotoAlbumLivePreviewProps) {
  return (
    <aside className="space-y-4 xl:sticky xl:top-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">
          Live Preview
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          See how your album card will look.
        </p>
      </div>

      <article className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        {album.coverImage ? (
  <img
    src={album.coverImage}
    alt={`${album.title || "Album"} cover preview`}
    className="aspect-[4/3] w-full bg-gray-100 object-cover"
    onError={(event) => {
      event.currentTarget.style.display = "none";
    }}
  />
) : (
  <div className="flex aspect-[4/3] items-center justify-center bg-gradient-to-br from-pink-50 to-gray-100">
    <span className="text-5xl" aria-hidden="true">
      📸
    </span>
  </div>
)}

        <div className="space-y-3 p-5">
          <div className="flex items-start justify-between gap-3">
            <h3 className="min-w-0 break-words text-lg font-bold text-gray-900">
              {album.title || "Your Album Title"}
            </h3>

            <span
              className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${
                album.isActive
                  ? "bg-green-50 text-green-700"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              {album.isActive ? "Active" : "Inactive"}
            </span>
          </div>

          <p className="whitespace-pre-wrap break-words text-sm leading-6 text-gray-600">
            {album.description ||
              "Your album description will appear here."}
          </p>

          <div className="flex items-center justify-between gap-3 border-t border-gray-100 pt-3 text-xs text-gray-500">
            <span className="shrink-0">
              {album.photos.length} gallery{" "}
              {album.photos.length === 1 ? "photo" : "photos"}
            </span>
            <span className="min-w-0 truncate text-right">
              /{album.slug || "your-album-slug"}
            </span>
          </div>

          {album.photos.length > 0 && (
            <div className="grid grid-cols-3 gap-2">
              {album.photos.slice(0, 3).map((photo, index) => (
                <img
                  key={`${photo}-${index}`}
                  src={photo}
                  alt={`Gallery preview ${index + 1}`}
                  loading="lazy"
                  className="h-20 w-full rounded-lg bg-gray-100 object-cover"
                />
              ))}
            </div>
          )}
        </div>
      </article>

      <p className="rounded-xl border border-blue-100 bg-blue-50 p-4 text-xs leading-5 text-blue-700">
        This preview updates when you change the album information or gallery.
      </p>
    </aside>
  );
}

"use client";

import Image from "next/image";
import { useCallback, useState } from "react";

export interface PhotoItem {
  url: string;
  sortOrder: number;
  isPrimary: boolean;
}

interface PhotoUploaderProps {
  photos: PhotoItem[];
  onChange: (photos: PhotoItem[]) => void;
  maxPhotos?: number;
}

export function PhotoUploader({
  photos,
  onChange,
  maxPhotos = 10,
}: PhotoUploaderProps) {
  const [dragOver, setDragOver] = useState(false);

  const addPhotos = useCallback(
    (files: FileList | File[]) => {
      const remaining = maxPhotos - photos.length;
      const toAdd = Array.from(files).slice(0, remaining);

      toAdd.forEach((file, i) => {
        const reader = new FileReader();
        reader.onload = () => {
          const url = reader.result as string;
          onChange([
            ...photos,
            {
              url,
              sortOrder: photos.length + i,
              isPrimary: photos.length === 0 && i === 0,
            },
          ]);
        };
        reader.readAsDataURL(file);
      });
    },
    [photos, onChange, maxPhotos]
  );

  function removePhoto(index: number) {
    const updated = photos.filter((_, i) => i !== index);
    if (updated.length > 0 && !updated.some((p) => p.isPrimary)) {
      updated[0].isPrimary = true;
    }
    onChange(updated.map((p, i) => ({ ...p, sortOrder: i })));
  }

  function setPrimary(index: number) {
    onChange(
      photos.map((p, i) => ({ ...p, isPrimary: i === index }))
    );
  }

  return (
    <div>
      {photos.length < maxPhotos && (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            if (e.dataTransfer.files.length) addPhotos(e.dataTransfer.files);
          }}
          className={`rounded-xl border-2 border-dashed p-8 text-center transition-colors ${
            dragOver
              ? "border-teal-400 bg-teal-50"
              : "border-slate-300 bg-slate-50"
          }`}
        >
          <svg
            className="mx-auto h-10 w-10 text-slate-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <p className="mt-2 text-sm font-medium text-slate-700">
            Drag photos here or click to upload
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Up to {maxPhotos} photos. First photo is the cover.
          </p>
          <label className="mt-4 inline-block cursor-pointer rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700">
            Choose files
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => e.target.files && addPhotos(e.target.files)}
            />
          </label>
        </div>
      )}

      {photos.length > 0 && (
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {photos.map((photo, index) => (
            <div
              key={index}
              className="relative aspect-square overflow-hidden rounded-lg border border-slate-200"
            >
              <Image
                src={photo.url}
                alt={`Photo ${index + 1}`}
                fill
                className="object-cover"
                sizes="150px"
              />
              {photo.isPrimary && (
                <span className="absolute left-1 top-1 rounded bg-teal-600 px-1.5 py-0.5 text-[10px] font-medium text-white">
                  Cover
                </span>
              )}
              <div className="absolute bottom-1 right-1 flex gap-1">
                {!photo.isPrimary && (
                  <button
                    type="button"
                    onClick={() => setPrimary(index)}
                    className="rounded bg-white/90 px-1.5 py-0.5 text-[10px] font-medium text-slate-700 hover:bg-white"
                  >
                    Set cover
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => removePhoto(index)}
                  className="rounded bg-red-600/90 px-1.5 py-0.5 text-[10px] font-medium text-white hover:bg-red-600"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

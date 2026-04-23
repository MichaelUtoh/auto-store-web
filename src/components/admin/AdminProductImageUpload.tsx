"use client";

import { useRef, useState } from "react";
import { X, Link as LinkIcon, Upload } from "lucide-react";
import { isAxiosError } from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import toast from "react-hot-toast";
import type { ProductImageRow } from "@/types/product";
import {
  addProductImages,
  deleteProductImage,
  uploadImages,
  validateProductImageFile,
} from "@/lib/api/upload";

const FILE_INPUT_ACCEPT = "image/jpeg,image/png,image/webp";

interface AdminProductImageUploadProps {
  productId: string | null;
  value: ProductImageRow[];
  onChange: (rows: ProductImageRow[]) => void;
  disabled?: boolean;
  maxCount?: number;
}

export function AdminProductImageUpload({
  productId,
  value,
  onChange,
  disabled = false,
  maxCount = 10,
}: AdminProductImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [addingUrl, setAddingUrl] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const [removingIndex, setRemovingIndex] = useState<number | null>(null);
  const [urlInput, setUrlInput] = useState("");
  const canAdd = !!productId;

  const showNonAxiosError = (err: unknown) => {
    if (isAxiosError(err)) return;
    const msg =
      err instanceof Error ? err.message : "Something went wrong";
    toast.error(msg);
  };

  const remove = async (index: number) => {
    const row = value[index];
    if (!row) return;

    if (productId && row.id) {
      setRemovingIndex(index);
      try {
        await deleteProductImage(productId, row.id);
        onChange(value.filter((_, i) => i !== index));
      } catch (err: unknown) {
        showNonAxiosError(err);
      } finally {
        setRemovingIndex(null);
      }
      return;
    }

    onChange(value.filter((_, i) => i !== index));
  };

  const handleAddByUrl = async () => {
    const url = urlInput.trim();
    if (!productId || !url) return;
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      toast.error("Enter a valid image URL (https://...)");
      return;
    }
    setAddingUrl(true);
    try {
      const created = await addProductImages(productId, [
        {
          url,
          display_order: value.length,
          is_primary: value.length === 0,
        },
      ]);
      const img = created[0];
      onChange([
        ...value,
        { id: img.id, url: img.url },
      ]);
      setUrlInput("");
    } catch (err: unknown) {
      showNonAxiosError(err);
    } finally {
      setAddingUrl(false);
    }
  };

  const handleFileInputChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const list = e.target.files;
    if (!productId || !list?.length) return;

    const remaining = maxCount - value.length;
    if (remaining <= 0) {
      toast.error(`You can add at most ${maxCount} images.`);
      e.target.value = "";
      return;
    }

    const files = Array.from(list);
    const errors: string[] = [];
    const valid: File[] = [];
    for (const file of files) {
      const msg = validateProductImageFile(file);
      if (msg) errors.push(msg);
      else valid.push(file);
    }
    if (errors.length) {
      const shown = errors.slice(0, 3);
      const suffix =
        errors.length > 3 ? ` (+${errors.length - 3} more)` : "";
      toast.error(shown.join(" ") + suffix);
    }
    const toUpload = valid.slice(0, remaining);
    if (toUpload.length === 0) {
      e.target.value = "";
      return;
    }
    if (valid.length > remaining) {
      toast.error(
        `Only ${remaining} slot${remaining === 1 ? "" : "s"} left; extra files were not uploaded.`
      );
    }

    setUploadingFiles(true);
    try {
      const urls = await uploadImages(toUpload);
      if (urls.length !== toUpload.length) {
        toast.error("Upload returned an unexpected number of URLs.");
      }
      const created = await addProductImages(
        productId,
        urls.map((url, i) => ({
          url,
          display_order: value.length + i,
          is_primary: value.length === 0 && i === 0,
        }))
      );
      onChange([
        ...value,
        ...created.map((c) => ({ id: c.id, url: c.url })),
      ]);
    } catch (err: unknown) {
      showNonAxiosError(err);
    } finally {
      setUploadingFiles(false);
      e.target.value = "";
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-3">
        {value.map((row, i) => (
          <div
            key={row.id ?? `${row.url}-${i}`}
            className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg border border-gray-200 bg-muted"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={row.url} alt="" className="h-full w-full object-cover" />
            {!disabled && (
              <button
                type="button"
                onClick={() => remove(i)}
                disabled={removingIndex === i}
                className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white hover:bg-black/80 disabled:opacity-50"
                aria-label="Remove image"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
        ))}
      </div>
      {value.length < maxCount && (
        <div className="space-y-4">
          <div className="rounded-lg border border-gray-200 bg-muted/30 p-4">
            <Label htmlFor="product-image-files">Upload images</Label>
            <p className="mt-1 text-sm text-secondary">
              JPEG, PNG, or WebP, up to 5 MB each. Files are sent to the server,
              then linked to this product.
            </p>
            <input
              ref={fileInputRef}
              id="product-image-files"
              type="file"
              accept={FILE_INPUT_ACCEPT}
              multiple
              className="sr-only"
              disabled={!canAdd || uploadingFiles || disabled}
              onChange={handleFileInputChange}
            />
            <div className="mt-3">
              <Button
                type="button"
                variant="secondary"
                disabled={!canAdd || uploadingFiles || disabled}
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="mr-2 h-4 w-4" />
                {uploadingFiles ? "Uploading…" : "Choose files"}
              </Button>
            </div>
            {!canAdd && (
              <p className="mt-2 text-sm text-secondary">
                Save the product first to add images.
              </p>
            )}
          </div>

          <div className="rounded-lg border border-gray-200 bg-muted/30 p-4">
            <Label htmlFor="product-image-url">Image URL</Label>
            <p className="mt-1 text-sm text-secondary">
              Or paste a public URL if the image is already hosted (CDN, etc.).
            </p>
            <div className="mt-3 flex flex-col gap-2 sm:flex-row">
              <Input
                id="product-image-url"
                type="url"
                placeholder="https://..."
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddByUrl();
                  }
                }}
                className="flex-1"
                disabled={!canAdd || addingUrl || disabled}
              />
              <Button
                type="button"
                disabled={!canAdd || !urlInput.trim() || addingUrl || disabled}
                onClick={handleAddByUrl}
              >
                <LinkIcon className="mr-2 h-4 w-4" />
                {addingUrl ? "Adding…" : "Add image"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

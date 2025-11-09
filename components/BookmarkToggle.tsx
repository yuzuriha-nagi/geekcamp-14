"use client";

import { useState } from "react";
import { IconButton, Tooltip } from "@mui/material";
import { createClient } from "@/lib/supabase/client";

type ResourceType = "assignment" | "material";

type BookmarkToggleProps = {
  resourceId: string;
  resourceType: ResourceType;
  initialBookmarked: boolean;
  size?: "small" | "medium";
};

const TABLE_MAP: Record<ResourceType, { table: string; column: string }> = {
  assignment: { table: "assignment_bookmarks", column: "assignment_id" },
  material: { table: "material_bookmarks", column: "material_id" },
};

export default function BookmarkToggle({
  resourceId,
  resourceType,
  initialBookmarked,
  size = "small",
}: BookmarkToggleProps) {
  const [bookmarked, setBookmarked] = useState(initialBookmarked);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const tableInfo = TABLE_MAP[resourceType];
  const supabase = createClient();

  const handleToggle = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setIsSubmitting(false);
        return;
      }

      if (bookmarked) {
        await supabase
          .from(tableInfo.table)
          .delete()
          .match({ [tableInfo.column]: resourceId, user_id: user.id });
        setBookmarked(false);
      } else {
        await supabase
          .from(tableInfo.table)
          .insert({ [tableInfo.column]: resourceId, user_id: user.id });
        setBookmarked(true);
      }
    } catch (error) {
      console.error("Bookmark toggle failed:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const label =
    resourceType === "assignment" ? "課題をブックマーク" : "資料をブックマーク";

  return (
    <Tooltip title={bookmarked ? `${label}解除` : label}>
      <span>
        <IconButton
          size={size}
          onClick={handleToggle}
          disabled={isSubmitting}
          aria-label={label}
        >
          <span
            style={{
              color: bookmarked ? "#f97316" : "#a1a1aa",
              fontSize: size === "small" ? "1rem" : "1.2rem",
              transition: "color 0.2s ease",
            }}
          >
            {bookmarked ? "★" : "☆"}
          </span>
        </IconButton>
      </span>
    </Tooltip>
  );
}

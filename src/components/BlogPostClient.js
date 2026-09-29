"use client";

import BlogPost from "@/static-pages/BlogPost";
import { useParams } from "next/navigation";

export default function BlogPostClient() {
  const params = useParams();
  return <BlogPost match={{ params }} />;
}
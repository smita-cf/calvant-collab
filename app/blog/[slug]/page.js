"use client";
import BlogPost from "@/static-pages/BlogPost";
import { useParams } from "next/navigation";
import { HelmetProvider } from "react-helmet-async";

export default function Page() {
  const params = useParams();
  return (
    <HelmetProvider>
      <BlogPost slug={params?.slug} match={{ params }} />
    </HelmetProvider>
  );
}

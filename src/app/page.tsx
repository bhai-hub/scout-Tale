
"use client";

import type { NextPage } from "next";
import { useState, useEffect, useMemo } from "react";
import Image from "next/image"; // Import next/image
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Search, Compass, Calendar, User, Loader2, ImageOff, Mountain } from "lucide-react";
import { getVlogPosts } from "@/actions/vlog";
import type { VlogPostClient } from "@/schemas/vlog";

const Home: NextPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [vlogs, setVlogs] = useState<VlogPostClient[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchVlogs() {
      setIsLoading(true);
      try {
        const fetchedVlogs = await getVlogPosts();
        setVlogs(fetchedVlogs);
      } catch (error) {
        console.error("Failed to fetch vlogs:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchVlogs();
  }, []);

  const filteredVlogs = useMemo(() => {
    if (!searchTerm) {
      return vlogs;
    }
    return vlogs.filter((vlog) =>
      vlog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vlog.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vlog.author.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, vlogs]);

  const generatePreview = (htmlContent: string, maxLength: number = 100) => {
    if (typeof document !== 'undefined') {
        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = htmlContent;
        const text = tempDiv.textContent || tempDiv.innerText || "";
        return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
    }
    return ""; 
  };


  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="relative">
        <Input
          type="search"
          placeholder="Search vlogs..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 pr-4 py-2 text-base md:text-sm"
        />
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
      </div>

      {filteredVlogs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVlogs.map((vlog) => (
            <Card key={vlog._id} className="flex flex-col overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="p-0 relative aspect-video bg-muted flex items-center justify-center overflow-hidden">
                 {vlog.featuredImageUrl ? (
                    <Image
                        src={vlog.featuredImageUrl}
                        alt={vlog.title || "Featured image"}
                        fill
                        style={{ objectFit: 'cover' }}
                        className="transition-transform duration-300 group-hover:scale-105"
                        data-ai-hint="featured blog image"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                 ) : (
                    <div className="w-full h-full flex items-center justify-center bg-secondary/50">
                        <Mountain className="h-16 w-16 text-muted-foreground" />
                    </div>
                 )}
              </CardHeader>
              <CardContent className="p-4 flex flex-col flex-grow">
                <CardTitle className="text-lg font-semibold mb-2">{vlog.title}</CardTitle>
                 <div className="flex items-center text-xs text-muted-foreground mb-1 space-x-2">
                    <User className="h-3 w-3" />
                    <span>{vlog.author}</span>
                 </div>
                 <div className="flex items-center text-xs text-muted-foreground mb-3 space-x-2">
                    <Calendar className="h-3 w-3" />
                    <span>{new Date(vlog.createdAt).toLocaleDateString()}</span>
                 </div>
                <CardDescription className="text-sm text-foreground/80 mb-4 flex-grow">
                    {generatePreview(vlog.content)}
                </CardDescription>
                <Link href={`/vlogs/${vlog.slug}`} passHref>
                  <Button variant="outline" size="sm" className="mt-auto w-full bg-accent text-accent-foreground hover:bg-accent/90 border-accent">
                    Read More
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center text-muted-foreground py-10">
          <Compass className="mx-auto h-12 w-12 mb-4" />
          <p>{searchTerm ? "No vlogs found matching your search." : "No vlog posts yet. Check back soon!"}</p>
        </div>
      )}
    </div>
  );
};

export default Home;


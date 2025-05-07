
"use client";

import { useParams, useRouter } 
from 'next/navigation';
import { useEffect, useState } from 'react';
import Image from 'next/image'; // Import next/image
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'; 
import { Calendar, User, ArrowLeft, Loader2, Mountain } from 'lucide-react'; 
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { getVlogPostBySlug } from '@/actions/vlog'; 
import type { VlogPostClient } from '@/schemas/vlog'; 

export default function VlogPostPage() {
  const params = useParams();
  const slug = params.id as string; 
  const [vlog, setVlog] = useState<VlogPostClient | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter(); 

  useEffect(() => {
    if (slug) {
      setLoading(true);
      async function fetchVlog() {
        try {
          const foundVlog = await getVlogPostBySlug(slug);
          if (foundVlog) {
            setVlog(foundVlog);
          } else {
            console.warn(`Vlog post with slug "${slug}" not found.`);
            // Consider redirecting to a 404 page if desired
            // router.push('/404'); 
          }
        } catch (error) {
          console.error("Failed to fetch vlog post:", error);
        } finally {
          setLoading(false);
        }
      }
      fetchVlog();
    }
  }, [slug, router]);

  if (loading) {
    return (
       <div className="max-w-3xl mx-auto space-y-6 py-8">
          <Skeleton className="h-9 w-32 mb-6" /> {/* Back button */}
          <Skeleton className="h-60 w-full rounded-md" /> {/* Featured Image Skeleton */}
          <Skeleton className="h-8 w-3/4 mt-4" /> {/* Title */}
          <div className="flex space-x-4 mt-2">
             <Skeleton className="h-4 w-24" /> {/* Author */}
             <Skeleton className="h-4 w-24" /> {/* Date */}
          </div>
          <div className="space-y-3 mt-4">
             <Skeleton className="h-4 w-full" />
             <Skeleton className="h-4 w-full" />
             <Skeleton className="h-4 w-5/6" />
             <Skeleton className="h-4 w-full" />
             <Skeleton className="h-4 w-1/2" />
          </div>
       </div>
    );
  }


  if (!vlog) {
    return (
      <div className="text-center py-10 max-w-3xl mx-auto">
         <Link href="/" passHref className="mb-6 inline-block">
             <Button variant="outline">
               <ArrowLeft className="mr-2 h-4 w-4" /> Back to Vlogs
             </Button>
         </Link>
        <p className="text-xl font-semibold text-destructive">Vlog post not found.</p>
        <p className="text-muted-foreground mt-2">The vlog post you are looking for does not exist or may have been moved.</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-8">
       <Link href="/" passHref className="mb-6 inline-block">
         <Button variant="outline">
           <ArrowLeft className="mr-2 h-4 w-4" /> Back to Vlogs
         </Button>
       </Link>
      <Card className="overflow-hidden shadow-lg">
         {vlog.featuredImageUrl && (
             <CardHeader className="p-0 relative aspect-video">
                <Image
                    src={vlog.featuredImageUrl}
                    alt={vlog.title || "Featured image"}
                    fill
                    priority // Prioritize loading for LCP
                    style={{ objectFit: 'cover' }}
                    className="rounded-t-lg"
                    data-ai-hint="blog header image"
                    sizes="(max-width: 1024px) 100vw, 896px" // 896px is max-w-3xl approx
                />
             </CardHeader>
         )}
         {!vlog.featuredImageUrl && (
            <div className="aspect-video bg-muted flex items-center justify-center rounded-t-lg">
                <Mountain className="h-24 w-24 text-muted-foreground" />
            </div>
         )}
        <CardContent className="p-6 space-y-4">
          <CardTitle className="text-2xl md:text-3xl font-bold">{vlog.title}</CardTitle>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
             <div className="flex items-center space-x-1.5">
                <User className="h-4 w-4" />
                <span>By {vlog.author}</span>
             </div>
              <div className="flex items-center space-x-1.5">
                <Calendar className="h-4 w-4" />
                <span>{new Date(vlog.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
          </div>
           <div
             className="prose dark:prose-invert max-w-none tiptap" 
             dangerouslySetInnerHTML={{ __html: vlog.content }}
           />
        </CardContent>
      </Card>
    </div>
  );
}


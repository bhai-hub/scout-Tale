
"use client";

import { useParams, useRouter } // Added useRouter
from 'next/navigation';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'; // Removed CardDescription
import { Calendar, User, ArrowLeft, Loader2 } from 'lucide-react'; // Added Loader2
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { getVlogPostBySlug } from '@/actions/vlog'; // Import server action
import type { VlogPostClient } from '@/schemas/vlog'; // Import type

export default function VlogPostPage() {
  const params = useParams();
  const slug = params.id as string; // Assuming 'id' from the route is the slug
  const [vlog, setVlog] = useState<VlogPostClient | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter(); // For navigation

  useEffect(() => {
    if (slug) {
      setLoading(true);
      async function fetchVlog() {
        try {
          const foundVlog = await getVlogPostBySlug(slug);
          if (foundVlog) {
            setVlog(foundVlog);
          } else {
            // Handle not found, e.g., redirect or show a message
            console.warn(`Vlog post with slug "${slug}" not found.`);
            // router.push('/404'); // Or a custom not-found page for vlogs
          }
        } catch (error) {
          console.error("Failed to fetch vlog post:", error);
          // Handle error, e.g., show an error message
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
          <Skeleton className="h-96 w-full rounded-lg" /> {/* Image */}
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
         {vlog.imageUrl && (
            <CardHeader className="p-0">
                <Image
                  src={vlog.imageUrl}
                  alt={vlog.title}
                  width={800}
                  height={400}
                  className="w-full h-auto object-cover max-h-96"
                  data-ai-hint="article hero image" // Generic hint
                  priority
                />
            </CardHeader>
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
             className="prose dark:prose-invert max-w-none tiptap" // Added 'tiptap' class for global styling
             dangerouslySetInnerHTML={{ __html: vlog.content }}
           />
        </CardContent>
      </Card>
    </div>
  );
}

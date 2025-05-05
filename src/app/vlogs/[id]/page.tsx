"use client";

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Calendar, User, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton'; // Import Skeleton

// Mock data - replace with actual data fetching logic
interface VlogPost {
  id: string;
  title: string;
  date: string;
  author: string;
  content: string; // Full content
  imageUrl: string;
  imageHint: string;
}

const mockVlogPosts: VlogPost[] = [
   { id: "1", title: "Summer Camp Adventures", date: "2024-07-15", author: "Admin", content: "This year's summer camp was an unforgettable experience! We started with setting up tents under the starry sky, followed by a thrilling scavenger hunt the next morning. Evenings were spent around the campfire, sharing stories and roasting marshmallows. The highlight was definitely the canoe race on the final day. We learned teamwork, resilience, and made memories to last a lifetime. Looking forward to next year!", imageUrl: "https://picsum.photos/800/400", imageHint: "summer camp bonfire group" },
   { id: "2", title: "Knot Tying Workshop", date: "2024-06-28", author: "Admin", content: "Knowing the right knots can be crucial in the outdoors. In our workshop, scouts practiced the bowline, square knot, clove hitch, and taut-line hitch. We discussed practical applications for each, from securing gear to setting up shelters. Practice makes perfect, so keep reviewing these essential skills!", imageUrl: "https://picsum.photos/800/400", imageHint: "close up rope knots" },
   { id: "3", title: "Hiking the Green Trail", date: "2024-06-10", author: "Admin", content: "The Green Trail offered breathtaking views and a good challenge. We covered 5 miles, navigating using map and compass skills learned previously. Along the way, we identified various plants and wildlife, putting our nature knowledge to the test. Remember to always follow Leave No Trace principles on your hikes.", imageUrl: "https://picsum.photos/800/400", imageHint: "mountain hiking view" },
   { id: "4", title: "Community Service Day", date: "2024-05-22", author: "Admin", content: "Giving back to the community is a core part of scouting. Our troop spent the day cleaning up the local park, planting new trees, and helping at the food bank. It was hard work, but incredibly rewarding to see the positive impact we made together. Great job, everyone!", imageUrl: "https://picsum.photos/800/400", imageHint: "people planting tree park" },
 ];


export default function VlogPostPage() {
  const params = useParams();
  const id = params.id as string;
  const [vlog, setVlog] = useState<VlogPost | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      setLoading(true);
      // Simulate API call to fetch vlog post by ID
      setTimeout(() => {
        const foundVlog = mockVlogPosts.find(post => post.id === id);
        setVlog(foundVlog || null);
        setLoading(false);
      }, 500); // Simulate network delay
    }
  }, [id]);

  if (loading) {
    return (
       <div className="max-w-3xl mx-auto space-y-6">
          <Skeleton className="h-9 w-32" /> {/* Back button */}
          <Skeleton className="h-96 w-full rounded-lg" /> {/* Image */}
          <Skeleton className="h-8 w-3/4" /> {/* Title */}
          <div className="flex space-x-4">
             <Skeleton className="h-4 w-24" /> {/* Author */}
             <Skeleton className="h-4 w-24" /> {/* Date */}
          </div>
          <div className="space-y-3">
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
      <div className="text-center py-10">
        <p className="text-destructive">Vlog post not found.</p>
         <Link href="/" passHref>
            <Button variant="link" className="mt-4 text-accent">Go back to Vlogs</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
       <Link href="/" passHref className="mb-6 inline-block">
         <Button variant="outline">
           <ArrowLeft className="mr-2 h-4 w-4" /> Back to Vlogs
         </Button>
       </Link>
      <Card className="overflow-hidden shadow-lg">
         <CardHeader className="p-0">
             <Image
               src={vlog.imageUrl}
               alt={vlog.title}
               width={800}
               height={400}
               className="w-full h-auto object-cover max-h-96" // Constrain image height
                data-ai-hint={vlog.imageHint}
             />
         </CardHeader>
        <CardContent className="p-6 space-y-4">
          <CardTitle className="text-2xl md:text-3xl font-bold">{vlog.title}</CardTitle>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
             <div className="flex items-center space-x-1.5">
                <User className="h-4 w-4" />
                <span>By {vlog.author}</span>
             </div>
              <div className="flex items-center space-x-1.5">
                <Calendar className="h-4 w-4" />
                <span>{new Date(vlog.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
          </div>
           {/* Basic rendering of content. Replace with a proper HTML renderer if content is HTML */}
           <CardDescription className="text-base leading-relaxed text-foreground/90 whitespace-pre-line">
                {vlog.content}
           </CardDescription>
        </CardContent>
      </Card>
    </div>
  );
}

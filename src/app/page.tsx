"use client";

import type { NextPage } from "next";
import { useState, useEffect, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Search, Compass, Calendar, User } from "lucide-react"; // Added icons

// Mock data for vlogs - replace with actual data fetching
interface VlogPost {
  id: string;
  title: string;
  date: string; // Keep as string for simplicity, format later
  author: string;
  preview: string; // Short preview text
  imageUrl: string;
  imageHint: string; // For AI hint
}

const initialVlogs: VlogPost[] = [
  { id: "1", title: "Summer Camp Adventures", date: "2024-07-15", author: "Admin", preview: "Relive the best moments from our annual summer camp...", imageUrl: "https://picsum.photos/400/250", imageHint: "summer camp bonfire" },
  { id: "2", title: "Knot Tying Workshop", date: "2024-06-28", author: "Admin", preview: "Master essential knots for your next outdoor trip...", imageUrl: "https://picsum.photos/400/250", imageHint: "rope knots hands" },
  { id: "3", title: "Hiking the Green Trail", date: "2024-06-10", author: "Admin", preview: "Join us on a virtual hike through the scenic Green Trail...", imageUrl: "https://picsum.photos/400/250", imageHint: "forest hiking trail" },
  { id: "4", title: "Community Service Day", date: "2024-05-22", author: "Admin", preview: "See how our scouts made a difference in the local community...", imageUrl: "https://picsum.photos/400/250", imageHint: "volunteers community service" },
];

const Home: NextPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [vlogs, setVlogs] = useState<VlogPost[]>([]); // Initialize with empty array

  // Simulate fetching data on component mount
  useEffect(() => {
    // Replace with actual API call in a real app
    setVlogs(initialVlogs);
  }, []);

  const filteredVlogs = useMemo(() => {
    if (!searchTerm) {
      return vlogs;
    }
    return vlogs.filter((vlog) =>
      vlog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vlog.preview.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vlog.author.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, vlogs]);

  return (
    <div className="space-y-8">
      <div className="relative">
        <Input
          type="search"
          placeholder="Search vlogs..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 pr-4 py-2 text-base md:text-sm" // Adjust padding for icon
        />
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
      </div>

      {filteredVlogs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVlogs.map((vlog) => (
            <Card key={vlog.id} className="flex flex-col overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="p-0 relative">
                 <Image
                    src={vlog.imageUrl}
                    alt={vlog.title}
                    width={400}
                    height={250}
                    className="w-full h-48 object-cover"
                    data-ai-hint={vlog.imageHint} // Add AI hint
                  />
              </CardHeader>
              <CardContent className="p-4 flex flex-col flex-grow">
                <CardTitle className="text-lg font-semibold mb-2">{vlog.title}</CardTitle>
                 <div className="flex items-center text-xs text-muted-foreground mb-1 space-x-2">
                    <User className="h-3 w-3" />
                    <span>{vlog.author}</span>
                 </div>
                 <div className="flex items-center text-xs text-muted-foreground mb-3 space-x-2">
                    <Calendar className="h-3 w-3" />
                    <span>{new Date(vlog.date).toLocaleDateString()}</span> {/* Format date */}
                 </div>
                <CardDescription className="text-sm text-foreground/80 mb-4 flex-grow">{vlog.preview}</CardDescription>
                <Link href={`/vlogs/${vlog.id}`} passHref>
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
          <p>No vlogs found matching your search.</p>
        </div>
      )}
    </div>
  );
};

export default Home;

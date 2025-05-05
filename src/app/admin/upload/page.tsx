"use client";

import { useState, type FormEvent } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea"; // Using Textarea as placeholder
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { UploadCloud } from "lucide-react";

// Placeholder for authentication check - replace with actual logic
const isAdminAuthenticated = true; // Simulate admin being logged in

export default function AdminUploadPage() {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("Admin"); // Default author
  const [content, setContent] = useState(""); // State for rich text editor content
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setIsUploading(true);

    // Simulate API call
    console.log("Uploading:", { title, author, content });
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network delay

    setIsUploading(false);
    setTitle("");
    setContent("");
    // Optionally reset author or keep it
    toast({
      title: "Vlog Post Uploaded!",
      description: `"${title}" has been successfully added.`,
      variant: "default", // Use 'default' which maps to success style via theme
    });
  };

  if (!isAdminAuthenticated) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-destructive">Access Denied. Please log in as an admin.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Upload New Vlog Post</CardTitle>
          <CardDescription>Fill in the details below to create a new vlog entry.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter the vlog title"
                required
                className="text-base md:text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="author">Author</Label>
              <Input
                id="author"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="Enter the author's name"
                required
                className="text-base md:text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Content</Label>
              {/* Rich Text Editor Placeholder */}
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your vlog content here... (Rich text editor integration needed)"
                required
                className="min-h-[200px] text-base md:text-sm" // Increased height
              />
              <p className="text-xs text-muted-foreground">
                Note: This is a basic text area. A full rich text editor (like Tiptap, Quill, etc.) should be integrated here.
              </p>
            </div>

             {/* Placeholder for Image Upload */}
             <div className="space-y-2">
              <Label htmlFor="image">Featured Image (Optional)</Label>
              <Input id="image" type="file" className="text-base md:text-sm file:text-foreground" />
              <p className="text-xs text-muted-foreground">
                 Image upload functionality needs to be implemented.
              </p>
            </div>


            <Button type="submit" disabled={isUploading} className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
              {isUploading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Uploading...
                </div>
              ) : (
                 <>
                 <UploadCloud className="mr-2 h-4 w-4" /> Upload Post
                 </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

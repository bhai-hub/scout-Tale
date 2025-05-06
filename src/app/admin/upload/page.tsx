
"use client";

import { useState, type FormEvent, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { UploadCloud } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import TiptapEditor from "@/components/tiptap/TiptapEditor"; // Import TiptapEditor

export default function AdminUploadPage() {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("Admin"); // Default author
  const [content, setContent] = useState(""); // State for Tiptap content (HTML)
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();
  const { isAdmin, isLoading } = useAuth();
  const router = useRouter();

  // Effect to redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAdmin) {
        toast({
            title: "Access Denied",
            description: "Please log in as an admin.",
            variant: "destructive",
        });
      router.push("/admin/login");
    }
  }, [isAdmin, isLoading, router, toast]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!isAdmin) {
        toast({ title: "Unauthorized", description: "You must be logged in to upload.", variant: "destructive" });
        return;
    }
    // Basic validation for Tiptap content
    // Tiptap editor.isEmpty might be true even with empty tags.
    // A simple check for non-empty text content is usually better.
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = content;
    const textContent = tempDiv.textContent || tempDiv.innerText || "";

    if (!textContent.trim()) {
         toast({ title: "Content Missing", description: "Please write some content for your vlog post.", variant: "destructive" });
         return;
    }


    setIsUploading(true);

    // Simulate API call
    console.log("Uploading:", { title, author, content }); // Content is now HTML
    await new Promise(resolve => setTimeout(resolve, 1500));

    setIsUploading(false);
    setTitle("");
    setContent(""); // Reset Tiptap content
    toast({
      title: "Vlog Post Uploaded!",
      description: `"${title}" has been successfully added.`,
      variant: "default",
    });
  };

  // Show loading state or access denied message while checking auth
  if (isLoading || !isAdmin) {
    return (
      <div className="flex justify-center items-center h-64">
         {isLoading ? (
             <p>Loading authentication...</p>
         ) : (
             !isAdmin && <p>Redirecting to login...</p>
         )}
      </div>
    );
  }

  // Render the form if authenticated
  return (
    <div className="max-w-4xl mx-auto">
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
              <TiptapEditor
                content={content}
                onChange={setContent}
                placeholder="Write your vlog content here..."
              />
            </div>

             <div className="space-y-2">
              <Label htmlFor="image">Featured Image (Optional)</Label>
              <Input id="image" type="file" className="text-base md:text-sm file:text-foreground" />
              <p className="text-xs text-muted-foreground">
                 Image upload functionality needs to be implemented (store URL in DB).
              </p>
            </div>


            <Button type="submit" disabled={isUploading || !isAdmin} className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
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

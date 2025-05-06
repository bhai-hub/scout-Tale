
"use client";

import { useState, type FormEvent, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { UploadCloud, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import TiptapEditor from "@/components/tiptap/TiptapEditor";
import { createVlogPost } from "@/actions/vlog"; // Import server action
import { vlogPostFormSchema, type VlogPostFormData, type VlogPostToInsert } from "@/schemas/vlog"; // Import Zod schema
import { z } from "zod"; // Import z for error handling

function generateSlug(title: string): string {
    return title
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '') // Remove non-alphanumeric characters (except spaces and hyphens)
        .replace(/\s+/g, '-')     // Replace spaces with hyphens
        .replace(/-+/g, '-');    // Replace multiple hyphens with a single hyphen
}

export default function AdminUploadPage() {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("Admin");
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState(""); // For image URL input
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();
  const { isAdmin, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();
  const [formErrors, setFormErrors] = useState<z.ZodIssue[]>([]);


  useEffect(() => {
    if (!isAuthLoading && !isAdmin) {
        toast({
            title: "Access Denied",
            description: "Please log in as an admin.",
            variant: "destructive",
        });
      router.push("/admin/login");
    }
  }, [isAdmin, isAuthLoading, router, toast]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!isAdmin) {
        toast({ title: "Unauthorized", description: "You must be logged in to upload.", variant: "destructive" });
        return;
    }
    setFormErrors([]); // Clear previous errors

    const rawFormData: VlogPostFormData = {
        title,
        author,
        content,
        imageUrl: imageUrl || undefined, // Pass undefined if empty for optional validation
    };

    const validationResult = vlogPostFormSchema.safeParse(rawFormData);

    if (!validationResult.success) {
        setFormErrors(validationResult.error.issues);
        toast({
            title: "Validation Error",
            description: "Please check the form for errors.",
            variant: "destructive",
        });
        setIsUploading(false);
        return;
    }

    setIsUploading(true);

    const dataToSave: VlogPostToInsert = {
        ...validationResult.data,
        slug: generateSlug(validationResult.data.title),
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    const result = await createVlogPost(dataToSave);

    setIsUploading(false);

    if (result.success) {
      setTitle("");
      setAuthor("Admin"); // Reset to default or clear
      setContent("");
      setImageUrl("");
      toast({
        title: "Vlog Post Uploaded!",
        description: `"${dataToSave.title}" has been successfully added.`,
        variant: "default",
      });
      // Optionally redirect or update UI
      // router.push(`/vlogs/${dataToSave.slug}`);
    } else {
      toast({
        title: "Upload Failed",
        description: result.message || "An unexpected error occurred.",
        variant: "destructive",
      });
      if (result.errors) {
        setFormErrors(result.errors);
      }
    }
  };

  const getErrorForField = (fieldName: keyof VlogPostFormData) => {
    return formErrors.find(err => err.path.includes(fieldName))?.message;
  }

  if (isAuthLoading || (!isAuthLoading && !isAdmin)) {
    return (
      <div className="flex justify-center items-center h-64">
         {isAuthLoading ? (
             <p>Loading authentication...</p>
         ) : (
             !isAdmin && <p>Redirecting to login...</p>
         )}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Upload New Vlog Post</CardTitle>
          <CardDescription>Fill in the details below to create a new vlog entry.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter the vlog title"
                className="text-base md:text-sm mt-1"
              />
              {getErrorForField('title') && <p className="text-sm text-destructive mt-1">{getErrorForField('title')}</p>}
            </div>

            <div>
              <Label htmlFor="author">Author</Label>
              <Input
                id="author"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="Enter the author's name"
                className="text-base md:text-sm mt-1"
              />
              {getErrorForField('author') && <p className="text-sm text-destructive mt-1">{getErrorForField('author')}</p>}
            </div>

            <div>
              <Label htmlFor="content">Content</Label>
              <TiptapEditor
                content={content}
                onChange={setContent}
                placeholder="Write your vlog content here..."
              />
              {getErrorForField('content') && <p className="text-sm text-destructive mt-1">{getErrorForField('content')}</p>}
            </div>

             <div>
              <Label htmlFor="imageUrl">Featured Image URL (Optional)</Label>
              <Input
                id="imageUrl"
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="text-base md:text-sm mt-1"
              />
              {getErrorForField('imageUrl') && <p className="text-sm text-destructive mt-1">{getErrorForField('imageUrl')}</p>}
               <p className="text-xs text-muted-foreground mt-1">
                 Paste the URL of an image hosted online.
              </p>
            </div>


            <Button type="submit" disabled={isUploading || !isAdmin} className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Uploading...
                </>
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

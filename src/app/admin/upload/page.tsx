
"use client";

import { useState, type FormEvent, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { UploadCloud, Loader2, Image as ImageIcon, XCircle } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import TiptapEditor from "@/components/tiptap/TiptapEditor";
import { createVlogPost } from "@/actions/vlog";
import { uploadImageToCloudinary } from "@/actions/cloudinary";
import { vlogPostFormSchema, type VlogPostFormData, type VlogPostToInsert } from "@/schemas/vlog";
import { z } from "zod";

function generateSlug(title: string): string {
    return title
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
}

export default function AdminUploadPage() {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("Admin");
  const [content, setContent] = useState("");
  const [featuredImageFile, setFeaturedImageFile] = useState<File | null>(null);
  const [featuredImageUrl, setFeaturedImageUrl] = useState<string | null>(null);
  const [isUploadingFeaturedImage, setIsUploadingFeaturedImage] = useState(false);
  const [isSubmittingForm, setIsSubmittingForm] = useState(false); 
  const { toast } = useToast();
  const { isAdmin, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();
  const [formErrors, setFormErrors] = useState<z.ZodIssue[]>([]);
  const featuredImageInputRef = useRef<HTMLInputElement>(null);


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


  const handleTiptapImageUpload = async (file: File): Promise<string | undefined> => {
    const formData = new FormData();
    formData.append('file', file);
    
    const uploadResult = await uploadImageToCloudinary(formData);
    
    if (uploadResult.success && uploadResult.imageUrl) {
      toast({
        title: "Image Inserted",
        description: "Image successfully uploaded and inserted into the editor.",
        variant: "default",
      });
      return uploadResult.imageUrl;
    } else {
      toast({
        title: "Editor Image Upload Failed",
        description: uploadResult.error || "Could not upload image to editor.",
        variant: "destructive",
      });
      return undefined;
    }
  };

  const handleFeaturedImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFeaturedImageFile(file);
      // Create a preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setFeaturedImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveFeaturedImage = () => {
    setFeaturedImageFile(null);
    setFeaturedImageUrl(null);
    if (featuredImageInputRef.current) {
      featuredImageInputRef.current.value = ""; // Reset file input
    }
  };


  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!isAdmin) {
        toast({ title: "Unauthorized", description: "You must be logged in to upload.", variant: "destructive" });
        return;
    }
    setFormErrors([]);
    setIsSubmittingForm(true);

    let uploadedFeaturedImageUrl: string | undefined = undefined;

    if (featuredImageFile) {
      setIsUploadingFeaturedImage(true);
      const formData = new FormData();
      formData.append('file', featuredImageFile);
      const uploadResult = await uploadImageToCloudinary(formData);
      setIsUploadingFeaturedImage(false);

      if (uploadResult.success && uploadResult.imageUrl) {
        uploadedFeaturedImageUrl = uploadResult.imageUrl;
      } else {
        toast({
          title: "Featured Image Upload Failed",
          description: uploadResult.error || "Could not upload featured image.",
          variant: "destructive",
        });
        setIsSubmittingForm(false);
        return;
      }
    }


    const rawFormData: VlogPostFormData = {
        title,
        author,
        content,
        featuredImageUrl: uploadedFeaturedImageUrl, 
    };

    const validationResult = vlogPostFormSchema.safeParse(rawFormData);

    if (!validationResult.success) {
        setFormErrors(validationResult.error.issues);
        toast({
            title: "Validation Error",
            description: "Please check the form for errors.",
            variant: "destructive",
        });
        setIsSubmittingForm(false);
        return;
    }


    const dataToSave: VlogPostToInsert = {
        ...validationResult.data,
        slug: generateSlug(validationResult.data.title),
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    const result = await createVlogPost(dataToSave);

    setIsSubmittingForm(false);

    if (result.success) {
      setTitle("");
      setAuthor("Admin");
      setContent("");
      setFeaturedImageFile(null);
      setFeaturedImageUrl(null);
      if (featuredImageInputRef.current) {
        featuredImageInputRef.current.value = "";
      }
      toast({
        title: "Vlog Post Uploaded!",
        description: `"${dataToSave.title}" has been successfully added.`,
        variant: "default",
      });
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

  const getErrorForField = (fieldName: keyof VlogPostFormData | 'featuredImageFile') => {
    // For featuredImageUrl, it's a string, but we're validating the file or its presence
    if (fieldName === 'featuredImageFile') {
        return formErrors.find(err => err.path.includes('featuredImageUrl'))?.message;
    }
    return formErrors.find(err => err.path.includes(fieldName))?.message;
  }

  if (isAuthLoading || (!isAuthLoading && !isAdmin)) {
    return (
      <div className="flex justify-center items-center h-64">
         {isAuthLoading ? (
             <Loader2 className="h-8 w-8 animate-spin" />
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
                <Label htmlFor="featuredImage">Featured Image (Optional)</Label>
                <Input
                    id="featuredImage"
                    type="file"
                    accept="image/*"
                    onChange={handleFeaturedImageChange}
                    className="text-base md:text-sm mt-1"
                    ref={featuredImageInputRef}
                    disabled={isUploadingFeaturedImage || isSubmittingForm}
                />
                {isUploadingFeaturedImage && (
                    <div className="flex items-center mt-2 text-sm text-muted-foreground">
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Uploading featured image...
                    </div>
                )}
                {featuredImageUrl && !isUploadingFeaturedImage && (
                    <div className="mt-2 relative group">
                        <Image
                            src={featuredImageUrl}
                            alt="Featured image preview"
                            width={200}
                            height={120}
                            className="rounded-md object-cover"
                            data-ai-hint="blog preview"
                        />
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute top-1 right-1 h-6 w-6 bg-background/70 hover:bg-background text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={handleRemoveFeaturedImage}
                            disabled={isSubmittingForm}
                            aria-label="Remove featured image"
                        >
                            <XCircle className="h-4 w-4" />
                        </Button>
                    </div>
                )}
                {getErrorForField('featuredImageFile') && <p className="text-sm text-destructive mt-1">{getErrorForField('featuredImageFile')}</p>}
            </div>


            <div>
              <Label htmlFor="content">Content</Label>
              <TiptapEditor
                content={content}
                onChange={setContent}
                placeholder="Write your vlog content here..."
                onImageUpload={handleTiptapImageUpload}
              />
              {getErrorForField('content') && <p className="text-sm text-destructive mt-1">{getErrorForField('content')}</p>}
            </div>

            <Button type="submit" disabled={isSubmittingForm || isUploadingFeaturedImage || !isAdmin} className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
              {isSubmittingForm || isUploadingFeaturedImage ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                  {isUploadingFeaturedImage ? "Uploading Image..." : "Submitting Post..."}
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



import { z } from 'zod';

export const vlogPostFormSchema = z.object({
  title: z.string().min(5, { message: "Title must be at least 5 characters." }).max(200, { message: "Title cannot exceed 200 characters." }),
  author: z.string().min(2, { message: "Author must be at least 2 characters." }).max(100, { message: "Author cannot exceed 100 characters." }),
  content: z.string().min(50, { message: "Content must be at least 50 characters." }),
  featuredImageUrl: z.string().url({ message: "Please enter a valid URL." }).optional(),
});

export type VlogPostFormData = z.infer<typeof vlogPostFormSchema>;

// Schema for data as it's typically structured when retrieved (e.g., _id as string)
// This is useful for validating data passed to client components or API responses
export const vlogPostClientSchema = vlogPostFormSchema.extend({
  _id: z.string(), // MongoDB ObjectId will be converted to string
  slug: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type VlogPostClient = z.infer<typeof vlogPostClientSchema>;


// This represents the data structure you expect to insert into MongoDB,
// excluding _id as it's auto-generated, but including server-generated fields.
export const vlogPostToInsertSchema = vlogPostFormSchema.extend({
    slug: z.string(),
    createdAt: z.date(),
    updatedAt: z.date(),
});
export type VlogPostToInsert = z.infer<typeof vlogPostToInsertSchema>;

// If you need to represent the exact DB structure with ObjectId (e.g., for server-side processing)
// import { ObjectId } from 'mongodb'; // Make sure mongodb is a dependency
// export const vlogPostStoredSchema = vlogPostToInsertSchema.extend({
//   _id: z.custom<ObjectId>((val) => val instanceof ObjectId, "Invalid ObjectId"),
// });
// export type VlogPostStored = z.infer<typeof vlogPostStoredSchema>;


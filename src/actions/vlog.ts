
'use server';

import { z } from 'zod';
import { vlogPostFormSchema, type VlogPostToInsert, type VlogPostClient } from '@/schemas/vlog';
import clientPromise from '@/lib/mongodb';
import { revalidatePath } from 'next/cache';
import { ObjectId } from 'mongodb'; // Import ObjectId

interface ActionResult {
    success: boolean;
    message: string;
    vlogId?: string; // Optionally return the ID of the created vlog
    errors?: z.ZodIssue[]; // For detailed Zod errors
}

function generateSlug(title: string): string {
    return title
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '') // Remove non-alphanumeric characters (except spaces and hyphens)
        .replace(/\s+/g, '-')     // Replace spaces with hyphens
        .replace(/-+/g, '-');    // Replace multiple hyphens with a single hyphen
}


export async function createVlogPost(
    formData: VlogPostToInsert // Expecting data already conforming to VlogPostToInsert
): Promise<ActionResult> {
    try {
        const client = await clientPromise;
        const db = client.db();
        const collection = db.collection<VlogPostToInsert>('vlogPosts');

        const result = await collection.insertOne(formData);

        if (result.acknowledged && result.insertedId) {
            revalidatePath('/'); // Revalidate home page to show new vlog
            revalidatePath(`/vlogs/${formData.slug}`); // Revalidate the specific vlog page
            return { success: true, message: 'Vlog post created successfully!', vlogId: result.insertedId.toString() };
        } else {
            return { success: false, message: 'Failed to create vlog post.' };
        }
    } catch (error) {
        console.error('Database Error (Create Vlog):', error);
        if (error instanceof z.ZodError) {
             return { success: false, message: 'Validation failed.', errors: error.issues };
        }
        return { success: false, message: 'Database error. Failed to create vlog post.' };
    }
}

export async function getVlogPosts(): Promise<VlogPostClient[]> {
    try {
        const client = await clientPromise;
        const db = client.db();
        const collection = db.collection('vlogPosts'); // No specific type here, as we map later

        // Find all posts, sort by creation date descending
        const posts = await collection.find({}).sort({ createdAt: -1 }).toArray();

        // Map to VlogPostClient, ensuring _id is a string and dates are Date objects
        return posts.map(post => ({
            ...post,
            _id: post._id.toString(),
            createdAt: new Date(post.createdAt), // Ensure Date objects
            updatedAt: new Date(post.updatedAt),
        })) as VlogPostClient[]; // Cast to VlogPostClient[] after mapping

    } catch (error) {
        console.error('Database Error (Get Vlog Posts):', error);
        return []; // Return empty array on error
    }
}

export async function getVlogPostBySlug(slug: string): Promise<VlogPostClient | null> {
    try {
        const client = await clientPromise;
        const db = client.db();
        const collection = db.collection('vlogPosts');

        const post = await collection.findOne({ slug });

        if (!post) {
            return null;
        }

        // Map to VlogPostClient
        return {
            ...post,
            _id: post._id.toString(),
            createdAt: new Date(post.createdAt),
            updatedAt: new Date(post.updatedAt),
        } as VlogPostClient; // Cast after mapping

    } catch (error) {
        console.error('Database Error (Get Vlog Post By Slug):', error);
        return null;
    }
}

export async function getVlogPostById(id: string): Promise<VlogPostClient | null> {
    try {
        if (!ObjectId.isValid(id)) {
            console.warn('Invalid ObjectId format:', id);
            return null;
        }
        const client = await clientPromise;
        const db = client.db();
        const collection = db.collection('vlogPosts');

        const post = await collection.findOne({ _id: new ObjectId(id) });

        if (!post) {
            return null;
        }
         return {
            ...post,
            _id: post._id.toString(),
            createdAt: new Date(post.createdAt),
            updatedAt: new Date(post.updatedAt),
        } as VlogPostClient;

    } catch (error) {
        console.error('Database Error (Get Vlog Post By ID):', error);
        return null;
    }
}

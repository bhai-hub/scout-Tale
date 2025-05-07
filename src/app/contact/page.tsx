
'use client';

import { useActionState } from 'react'; // Changed from 'react-dom'
import { useFormStatus } from 'react-dom'; // useFormStatus is still from 'react-dom'
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useRef } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { contactFormSchema, type ContactFormData } from '@/schemas/contact';
import { submitContactForm } from '@/actions/contact';
import { Send, Loader2 } from 'lucide-react';
import type { ZodIssue } from 'zod';

const initialState = {
    success: false,
    message: '',
    errors: undefined as ZodIssue[] | undefined,
};

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" disabled={pending} className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
            {pending ? (
                <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending...
                </>
            ) : (
                <>
                   <Send className="mr-2 h-4 w-4" /> Send Message
                </>
            )}
        </Button>
    );
}


export default function ContactPage() {
    const [state, formAction] = useActionState(submitContactForm, initialState); // Changed to useActionState
    const { toast } = useToast();
    const formRef = useRef<HTMLFormElement>(null);

    const form = useForm<ContactFormData>({
        resolver: zodResolver(contactFormSchema),
        defaultValues: {
            name: '',
            email: '',
            subject: '',
            message: '',
        },
    });

    useEffect(() => {
        if (state?.errors) {
            state.errors.forEach((error) => {
                const fieldName = error.path[0] as keyof ContactFormData;
                if (fieldName) {
                    form.setError(fieldName, { type: 'server', message: error.message });
                }
            });
        }
        if (state?.message && state.message !== initialState.message) { 
            toast({
                title: state.success ? 'Success!' : 'Error',
                description: state.message,
                variant: state.success ? 'default' : 'destructive',
            });

            if (state.success) {
                form.reset(); 
                formRef.current?.reset(); 
            }
        }
    }, [state, toast, form]);

    return (
        <div className="flex items-center justify-center py-12">
            <Card className="w-full max-w-lg">
                <CardHeader>
                    <CardTitle>Contact Us</CardTitle>
                    <CardDescription>Have questions? Fill out the form below and we'll get back to you.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form ref={formRef} action={formAction} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="name">Name</Label>
                            <Input
                                id="name"
                                {...form.register('name')}
                                placeholder="Your Name"
                                aria-invalid={!!form.formState.errors.name}
                            />
                            {form.formState.errors.name && (
                                <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                {...form.register('email')}
                                placeholder="your.email@example.com"
                                aria-invalid={!!form.formState.errors.email}
                            />
                            {form.formState.errors.email && (
                                <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="subject">Subject</Label>
                            <Input
                                id="subject"
                                {...form.register('subject')}
                                placeholder="Regarding..."
                                aria-invalid={!!form.formState.errors.subject}
                            />
                            {form.formState.errors.subject && (
                                <p className="text-sm text-destructive">{form.formState.errors.subject.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="message">Message</Label>
                            <Textarea
                                id="message"
                                {...form.register('message')}
                                placeholder="Your message here..."
                                rows={5}
                                aria-invalid={!!form.formState.errors.message}
                            />
                            {form.formState.errors.message && (
                                <p className="text-sm text-destructive">{form.formState.errors.message.message}</p>
                            )}
                        </div>
                        
                        <SubmitButton />

                         {!state.success && state.message && !state.errors && (
                            <p className="text-sm text-destructive text-center">{state.message}</p>
                         )}
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}


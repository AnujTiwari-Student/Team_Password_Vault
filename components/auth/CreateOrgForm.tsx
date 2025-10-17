import { CreateOrgSchema } from "@/schema/zod-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import React from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { FormError } from "./form-error";
import { FormSuccess } from "./form-success";
import axios from "axios";

type CreateOrgFormValues = z.infer<typeof CreateOrgSchema>;

interface CreateOrgFormProps {
  onSuccess: () => void;
  onClose: () => void;
}

function CreateOrgForm({ onSuccess, onClose }: CreateOrgFormProps) {
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);
  const [isPending, startTransition] = React.useTransition();

  const form = useForm<CreateOrgFormValues>({
    resolver: zodResolver(CreateOrgSchema),
    defaultValues: {
      name: "",
      description: "",
    }
  });

  const handleSubmit = async (data: CreateOrgFormValues) => {
    try {
      startTransition(async () => {
        setError(null);
        setSuccess(null);

        const response = await axios.post('/api/orgs/data', {
          name: data.name,
          description: data.description
        });

        if (response.data.success) {
          setSuccess("Organization created successfully!");
          setTimeout(() => {
            onSuccess();
            onClose();
          }, 1000);
        } else {
          setError(response.data.error || "Failed to create organization");
        }
      });
    } catch (error) {
      console.error("Create organization error:", error);
      setError("An unexpected error occurred. Please try again.");
    }
  };

  return (
    <div className='w-full'>
      <Form {...form}>
        <form className='space-y-4' onSubmit={form.handleSubmit(handleSubmit)}>
          <div className='space-y-4'>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='text-[#bfbfbf]'>Organization Name</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="text"
                      placeholder="Enter organization name"
                      className="text-white"
                      disabled={isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='text-[#bfbfbf]'>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Brief description of your organization"
                      className="text-white resize-none"
                      rows={3}
                      disabled={isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormError message={error} />
          <FormSuccess message={success} />
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              className="flex-1 bg-blue-500 hover:bg-gray-600 hover:text-white"
              onClick={onClose}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className={`flex-1 bg-blue-500 hover:bg-gray-600 hover:text-white`}
              disabled={isPending}
            >
              {isPending ? 'Creating...' : 'Create Organization'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

export default CreateOrgForm;

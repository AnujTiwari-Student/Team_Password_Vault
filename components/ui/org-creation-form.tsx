"use client"

import { OrgCreationSchema, OrgCreationType } from "@/schema/zod-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "./form";
import { Input } from "./input";
import React from "react";

interface OrgCreationFormProps {
    setOrgName: (name: string) => void;
}

function OrgCreationForm({ setOrgName }: OrgCreationFormProps) {

    const form = useForm<OrgCreationType>({
        resolver: zodResolver(OrgCreationSchema),
        defaultValues: {
            orgName: "",
        },
        mode: "onChange"
    })

    const orgNameValue = form.watch("orgName");
    React.useEffect(() => {
        setOrgName(orgNameValue);
    }, [orgNameValue, setOrgName]);

    return (
        <div className='w-full'>
            <Form {...form}>
                <form className='space-y-4'>
                    <div className='space-y-4'>
                        <FormField
                            control={form.control}
                            name="orgName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-white">Organization Name</FormLabel>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            type="text"
                                            placeholder="Your organization name"
                                            className="w-full px-4 h-10 bg-gray-900/50 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 placeholder-gray-500"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                </form>
            </Form>
        </div>
    )
}

export default OrgCreationForm
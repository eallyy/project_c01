"use client"
import { cn } from "@/lib/utils";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const formSchema = z.object({
  email: z.email(),
  password: z.string()
})

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter(); 

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: ""
    }
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      const data = await res.json();

      if (!res.ok) {
        // Show API error via form
        form.setError("email", { type: "manual", message: data.code || "LOGIN_FAILED" });
        return;
      }

      // Redirect to home
      router.push("/");
    } catch (error) {
      console.error("Login error:", error);
      form.setError("email", { type: "manual", message: "SERVER_ERROR" });
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Login to your account</CardTitle>
          <CardDescription>
            Enter your email below to login to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <div className="flex flex-col gap-6">
                {form.formState.errors.root && (
  <p className="text-sm text-red-500">{form.formState.errors.root.message}</p>
)}
                  <div className="grid gap-3">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="email"
                              placeholder="me@example.com"
                              required
                            />
                          </FormControl>
                  <FormMessage />
                        </FormItem>
                      )}
                    >
                    </FormField>
                  </div>
                  <div className="grid gap-3">
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center">
                            Password
                            <a
                              href="#"
                              className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                            >
                              Forgot your password?
                            </a>
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="password"
                              required
                            />
                          </FormControl>
                          <FormDescription>
                          </FormDescription>
                        </FormItem>
                      )}
                    >
                    </FormField>
                  </div>
                  <div className="flex flex-col gap-3">
                    <Button type="submit" className="w-full">
                      Login
                    </Button>
                  </div>
                </div>
              </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}

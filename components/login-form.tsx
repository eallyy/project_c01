"use client"
import { useTranslations } from "next-intl";
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
  const t = useTranslations("login");
  const t_err = useTranslations("errors");
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
        form.setError("email", { type: "manual", message: t_err("LOGIN_FAILED") });
        return;
      }

      // Redirect to home
      router.push("/");
    } catch (error) {
      console.error("Login error:", error);
      form.setError("email", { type: "manual", message: t_err("SERVER_ERROR") });
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>{t("heading_title")}</CardTitle>
          <CardDescription>{t("heading_desc")}</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <div className="flex flex-col gap-6">
                  <div className="grid gap-3">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("email_label")}</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="email"
                              placeholder={t("email_placeholder")}
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
                            {t("password_label")}
                            <a
                              href="#"
                              className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                            >
                              {t("forgot_password")}
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
                      {t("submit_button")}
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

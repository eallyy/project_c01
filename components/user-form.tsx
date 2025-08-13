"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { PermissionCheckbox } from "@/components/permission-checkbox";
import { Plus, Save } from "lucide-react";
import { useTranslations } from "next-intl";

// Schema Definitions
const makeCreateSchema = (t: (k: string) => string) =>
  z.object({
    name: z.string().min(1, t("create_user.form_alerts.name_required")),
    email: z.string().email(t("create_user.form_alerts.email_invalid")),
    password: z.string().min(8, t("create_user.form_alerts.password_min")),
    permissions: z.array(z.object({ code: z.string() })).default([]),
  });

const makeEditSchema = (t: (k: string) => string) =>
  z.object({
    name: z.string().min(1, t("create_user.form_alerts.name_required")),
    email: z.string().email(t("create_user.form_alerts.email_invalid")),
    password: z.string().optional().default(""),
    permissions: z.array(z.object({ code: z.string() })).default([]),
  });

export type CreateValues = z.infer<ReturnType<typeof makeCreateSchema>>;
export type EditValues = z.infer<ReturnType<typeof makeEditSchema>>;

type UserFormProps =
  | {
      mode: "create";
      defaultValues?: Partial<CreateValues>;
      onSubmit: (values: CreateValues) => void | Promise<void>;
    }
  | {
      mode: "edit";
      defaultValues?: Partial<EditValues>;
      onSubmit: (values: EditValues) => void | Promise<void>;
    };


export function UserForm({ mode, defaultValues, onSubmit }: UserFormProps) {
  const t = useTranslations("users");

  const PERMISSIONS = [
    {
      code: "VIEW_DASHBOARD",
      label: t("permissions.VIEW_DASHBOARD.title"),
      description: t("permissions.VIEW_DASHBOARD.desc"),
    },
    {
      code: "VIEW_USERS",
      label: t("permissions.VIEW_USERS.title"),
      description: t("permissions.VIEW_USERS.desc"),
    },
    {
      code: "DELETE_USER",
      label: t("permissions.DELETE_USER.title"),
      description: t("permissions.DELETE_USER.desc"),
    },
  ];

  const PERMISSION_PRESETS = {
    all: PERMISSIONS.map((p) => p.code),
    guest: ["VIEW_DASHBOARD"],
  };

  // Picking scheme according to mode
  const schema = mode === "create" ? makeCreateSchema(t) : makeEditSchema(t);

  type UserFormValues = typeof schema extends z.ZodType<any, any, any>
    ? z.infer<typeof schema>
    : never;

  const defaults: UserFormValues = {
    name: "",
    email: "",
    password: mode === "create" ? "" : undefined,
    permissions: Array.isArray(defaultValues?.permissions)
    ? defaultValues?.permissions.map((p: any) =>
        typeof p === "string" ? p : p.code
      )
    : [],
    ...(defaultValues as Partial<UserFormValues>),
  };

  const form = useForm<UserFormValues>({
    resolver: zodResolver(schema),
    defaultValues: defaults,
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Name */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {t("create_user.name")}
                {mode === "create" && "*"}
              </FormLabel>
              <FormControl>
                <Input placeholder={t("create_user.name_placeholder")} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Email */}
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {t("create_user.email")}
                {mode === "create" && "*"}
              </FormLabel>
              <FormControl>
                <Input placeholder={t("create_user.email_placeholder")} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Password */}
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {t("create_user.password")}
                {mode === "create" && "*"}
              </FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder={
                    mode === "create"
                      ? t("create_user.password_placeholder")
                      : t("edit_user.password_placeholder")
                  }
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Permissions */}
        <FormField
          control={form.control}
          name="permissions"
          render={({ field }) => {
            // field.value: {code}[]
            const selectedCodes = new Set((field.value || []).map((p) => p.code));

            // {code}[] generator helper
            const toCodeObjects = (codes: string[]) => codes.map((c) => ({ code: c }));
            return (
              <FormItem>
                <FormLabel>{t("create_user.permissions")}</FormLabel>

                {/* Preset Buttons */}
                <div className="flex flex-wrap gap-2 mb-4">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => field.onChange(toCodeObjects(PERMISSION_PRESETS.all))}
                  >
                    {t("create_user.permission_presets.all_permissions")}
                  </Button>

                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => field.onChange(toCodeObjects(PERMISSION_PRESETS.guest))}
                  >
                    {t("create_user.permission_presets.guest_user")}
                  </Button>
                </div>

                {/* Permission Checkbox */}
                <div className="grid gap-3">
                  {PERMISSIONS.map((perm) => (
                    <PermissionCheckbox
                      key={perm.code}
                      id={perm.code}
                      label={perm.label}
                      description={perm.description}
                      checked={selectedCodes.has(perm.code)}
                      onChange={(isChecked) => {
                        const codes = new Set(selectedCodes);
                        if (isChecked) codes.add(perm.code);
                        else codes.delete(perm.code);
                        field.onChange(toCodeObjects(Array.from(codes)));
                      }}
                    />
                  ))}
                </div>
                <FormMessage />
              </FormItem>
            );
          }}
        />

        {/* Submit */}
        <Button type="submit">
          {mode === "create" ? (
            <>
              <Plus /> {t("create_user.submit_button")}
            </>
          ) : (
            <>
              <Save /> {t("edit_user.submit_button")}
            </>
          )}
        </Button>
      </form>
    </Form>
  );
}

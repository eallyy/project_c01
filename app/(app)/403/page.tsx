import { useTranslations } from "next-intl";

export default function ForbiddenPage() {
  const t = useTranslations("403");
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <h1 className="text-4xl font-bold">403 - {t("access_denied")}</h1>
      <p className="mt-4 text-gray-500">
        {t("description")}
      </p>
    </div>
  );
}

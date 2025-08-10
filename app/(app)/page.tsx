import { useTranslations } from "next-intl";
import { ChartAreaInteractive } from "@/components/chart-area-interactive";
import { ChartPieDonutText } from "@/components/chart-pie-donut-text";
import { ChartBarActive } from "@/components/chart-bar-active";
import { ChartMiniDataTable } from "@/components/chart-mini-datatable";
import { DataTable } from "@/components/data-table";
import { SectionCards } from "@/components/section-cards";
import { SiteHeader } from "@/components/site-header";

import data from "./data.json"

export default function Page() {
  const t = useTranslations("dashboard");

  return (<>
        <SiteHeader title={t("site_header")} />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <SectionCards />
              <div className="px-4 lg:px-6">
                <ChartAreaInteractive />
              </div>
              <div className="px-4 lg:px-6 flex w-full gap-4">
                <div className="flex-1">
                  <ChartMiniDataTable />
                </div>
                <div className="flex-1">
                  <ChartBarActive />
                </div>
                <div className="flex-1">
                  <ChartPieDonutText />
                </div>
              </div>
              <DataTable data={data} />
            </div>
          </div>
        </div>
  </>)
}

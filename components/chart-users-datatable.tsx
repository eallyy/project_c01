"use client"

import * as React from "react"
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table"
import { ArrowUpDown, CheckCircle2Icon, ChevronDown, TrashIcon, UserPenIcon, AlertCircleIcon, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle
} from "@/components/ui/sheet";
import type { Prisma } from "@/lib/generated/prisma";
import { UserForm, EditValues, CreateValues } from "@/components/user-form";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { SessionUser } from "@/lib/session";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useUser } from "@/contexts/UserContext";

type UserWithPermissions = Prisma.UserGetPayload<{
  include: { permissions: true }
}>;

export function ChartUsersDataTable() {
  const t = useTranslations("users");
  const t_err = useTranslations("errors");
  const { user } = useUser();
  const router = useRouter();
  const [alert, setAlert] = React.useState<{ code: string; type: string } | null>(null);
  const [data, setData] = React.useState<SessionUser[]>([]);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  // Deleting
  const [openDeleteDialog, setOpenDeleteDialog] = React.useState(false);
  const [deleteUser, setDeleteUser] = React.useState<SessionUser | null>(null);
  const [deleting, setDeleting] = React.useState(false);
  // User edit/create
  const [openUserDialog, setOpenUserDialog] = React.useState(false);
  const [editUser, setEditUser] = React.useState<UserWithPermissions | null>(null);

  async function fetchUsers() {
    try {
      const res = await fetch("/api/users");
      if (!res.ok) throw new Error("Failed to fetch users");
      const json = await res.json();
      setData(json.users || []);
    } catch (error) {
      console.error(error);
    } 
  }

  React.useEffect(() => {
    fetchUsers();
  }, []);

  // Delete handler
  async function handleDeleteUser() {
    if (!deleteUser?.id) return;
    try {
      setDeleting(true);
      const res = await fetch(`/api/users/${deleteUser?.id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.code === "FORBIDDEN") {
          router.push("/403");
          return;
        }

        setAlert({ code: data.code || "USER_DELETE_FAILED", type: "error" });
      }
      else {
        setData(prev => prev.filter(u => u.id !== deleteUser?.id));
        setOpenDeleteDialog(false);
        setAlert({ code: data.code || "USER_DELETED_SUCCESS", type: "success" });
      }
      
    }
    catch (error) {
        console.log(error);
        setAlert({ code: "USER_DELETE_FAILED", type: "error" });
    }
    finally {
      setDeleting(false);
    }
  }
  
  // Create handler
  async function handleCreateUser(values: CreateValues) {
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await res.json();
      
      if (!res.ok) {
        if (data.code === "FORBIDDEN") {
          router.push("/403");
          return;
        }

        setAlert({ code: data.code || "USER_CREATE_FAILED", type: "error" });
      }
      // success UI feedback
      fetchUsers();
      setOpenUserDialog(false);
    } catch (err) {
      console.error(err);
    }
  }

  // Edit handler
  async function handleUpdateUser(id: number, values: EditValues) {
    if (!editUser) return;
    try {
      const { password, ...rest } = values;
      const payload: Omit<EditValues, "password"> & { password?: string } = {
        ...rest,
        ...(password && password.trim().length >= 1 ? { password } : {}),
      };

      const res = await fetch(`/api/users/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok) {
        if (data.code === "FORBIDDEN") {
          router.push("/403");
          return;
        }

        setAlert({ code: data.code || "USER_UPDATE_FAILED", type: "error" });
      }
      // success UI feedback
      fetchUsers();
      setOpenUserDialog(false);
      setEditUser(null);
    } catch (err) {
      console.error(err);
    }
  }

  const columns: ColumnDef<SessionUser>[] = [
      {
        accessorKey: "id",
        header: t("user_id"),
        cell: ({ row }) => (
          <div>{row.getValue("id")}</div>
        ),
      },
      {
        accessorKey: "name",
        header: t("name"),
        cell: ({ row }) => {
          const name: string = row.getValue("name");
          return (<div className="flex items-center gap-2 capitalize">
                    <Avatar className="h-8 w-8 rounded-lg">
                      <AvatarImage alt={row.getValue("email")} />
                      <AvatarFallback className="rounded-lg">
                          {name
                            .split(" ")
                            .slice(0, 2)
                            .map(word => word.charAt(0).toUpperCase())
                            .join("")}    
                      </AvatarFallback>
                    </Avatar>
          {row.getValue("name")} {row.getValue("id") == user?.id ? `(${t("you")})` : null}
          </div>)
        },
      },
      {
        accessorKey: "email",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
              {t("email")}
              <ArrowUpDown />
            </Button>
          )
        },
        cell: ({ row }) => <div className="lowercase">{row.getValue("email")}</div>,
      },
      {
        id: "actions",
        enableHiding: false,
        cell: ({ row }) => {
          return (<div className="flex justify-end gap-1">
            <Button variant="outline" size="sm" onClick={() => {
              setEditUser(row.original);
              console.log(row.original);
              setOpenUserDialog(true);
            }}>
              <UserPenIcon />
              {t("edit")}
            </Button>
              <Tooltip>
                <TooltipTrigger asChild>
                    <Button variant="ghost" 
                        size="icon" 
                        className="size-8" 
                        disabled={row.getValue("id") == user?.id}
                        onClick={() => {
                          setDeleteUser(row.original);
                          setOpenDeleteDialog(true);
                        }}>
                      <TrashIcon className="text-red-500"/>
                    </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{t("delete_user")} (ID: {row.getValue("id")})</p>
                </TooltipContent>
              </Tooltip>
          </div>)
        },
      },
    ]

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  })

  return (
    <div className="w-full">
      { alert && (
      <Alert variant={alert.type === "error" ? "destructive" : "default"}>
        { alert.type === "error" ? <AlertCircleIcon /> : <CheckCircle2Icon /> }
        <AlertTitle>{t_err(alert.code)}</AlertTitle>
      </Alert>)}
      <div className="flex items-center gap-2 py-4">
        <Input
          placeholder={t("filter_emails")}
          value={(table.getColumn("email")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("email")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        <div className="flex items-center gap-2 ml-auto">
            {/* Create User */}
            <div>
                <Button variant="default" onClick={() => {
                  setEditUser(null);
                  setOpenUserDialog(true);
                }}>
                    <Plus className="h-4 w-4" />
                    {t("create_user.sheet_open_button")}
                </Button>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  {t("columns")} <ChevronDown />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {table
                  .getAllColumns()
                  .filter((column) => column.getCanHide())
                  .map((column) => {
                    return (
                      <DropdownMenuCheckboxItem
                        key={column.id}
                        className="capitalize"
                        checked={column.getIsVisible()}
                        onCheckedChange={(value) =>
                          column.toggleVisibility(!!value)
                        }
                      >
                        {column.id}
                      </DropdownMenuCheckboxItem>
                    )
                  })}
              </DropdownMenuContent>
            </DropdownMenu>
        </div>
      </div>
      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  {t("no_results")}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {/* Delete User Dialog */}
      <Dialog open={openDeleteDialog} onOpenChange={(isOpen) => {
        if (deleting && !isOpen) return;
        setOpenDeleteDialog(isOpen);
      }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("delete_dialog.header")}</DialogTitle>
              <DialogDescription>
                {t("delete_dialog.description")}
              </DialogDescription>
            </DialogHeader>
            <div className="mt-2">
              <strong>{deleteUser?.name}</strong> ({deleteUser?.email})
            </div>
            <DialogFooter>
              <Button variant="destructive" onClick={handleDeleteUser} disabled={deleting}>
                {t("delete_dialog.submit_button")}
              </Button>
            </DialogFooter>
          </DialogContent>
      </Dialog>
      <Sheet open={openUserDialog} onOpenChange={setOpenUserDialog}>
          <SheetContent className="w-full sm:w-[540px] overflow-y-auto">
            <SheetHeader>
              <SheetTitle>
                {editUser ? t("edit_user.sheet_title") : t("create_user.sheet_title")}
              </SheetTitle>
              <SheetDescription>
                {editUser ? t("edit_user.sheet_desc") : t("create_user.sheet_desc")}
              </SheetDescription>
                <div className="scroll-auto mt-3">
                { editUser ? (
                  <UserForm 
                    mode="edit" 
                    defaultValues={editUser}
                    onSubmit={(values) => editUser && handleUpdateUser(editUser.id, values)} />
                ) : (
                  <UserForm 
                    mode="create" 
                    onSubmit={handleCreateUser} />
                )}
                </div>
            </SheetHeader>
          </SheetContent>
      </Sheet>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="text-muted-foreground flex-1 text-sm">
         {`${t("total_registered_users")}: ${table.getFilteredRowModel().rows.length}`}
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            {t("previous")}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            {t("next")}
          </Button>
        </div>
      </div>
    </div>
  )
}


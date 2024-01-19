import { Plus, LayoutGrid, AlignJustify, File, Pencil } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "../../../components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../../components/ui/dropdown-menu";
import { useRef } from "react";
import { Input } from "../../../components/ui/input";
import useStorageStore from "../store";
import { invalidateFilesQuery, useUploadFileMutation } from "../hooks";
import useAppStore from "@/features/app/useAppStore";
import { useNavigate } from "react-router-dom";

export default function StorageHeader() {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const selectedDisplayTab = useStorageStore((state) => state.selectedDisplay);
  const setSelectedDisplayTab = useStorageStore(
    (state) => state.setSelectedDisplay
  );

  const uploadFileMutation = useUploadFileMutation();
  const setLoading = useAppStore((state) => state.actions.setLoading);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    for (const file of files) {
      setLoading(true);
      uploadFileMutation.mutate(file, {
        onSuccess: () => {
          invalidateFilesQuery();
          setLoading(false);
        },
      });
    }
  };

  return (
    <div className="h-14  w-full flex justify-between items-center">
      <div className="flex w-full px-5 md:px-0">
        <h3 className="text-4xl font-semibold tracking-tight">Storage</h3>
      </div>

      <div className="mr-4 flex gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger>
            <div
              onClick={() => {
                inputRef.current?.click();
              }}
              className="rounded-full p-1 h-8 w-8 flex items-center justify-center hover:bg-card-foreground"
            >
              <Plus />
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="rounded-xl">
            <DropdownMenuItem
              className="rounded-xl"
              onClick={() => {
                navigate("/note");
              }}
            >
              <Pencil className="mr-2 h-4 w-4" />
              <span>Note</span>
            </DropdownMenuItem>

            <DropdownMenuItem
              className="rounded-xl"
              onClick={() => {
                inputRef.current?.click();
              }}
            >
              <File className="mr-2 h-4 w-4" />
              <span>File</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Tabs
          value={selectedDisplayTab}
          onValueChange={(value) => setSelectedDisplayTab(value as any)}
        >
          <TabsList>
            <TabsTrigger value="grid">
              <LayoutGrid />
            </TabsTrigger>
            <TabsTrigger value="list">
              <AlignJustify />
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <Input
        type="file"
        multiple
        id="my-input"
        className="hidden"
        ref={inputRef}
        onChange={handleChange}
      />
    </div>
  );
}

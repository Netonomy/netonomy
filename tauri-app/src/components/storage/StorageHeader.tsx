import { Plus, LayoutGrid, AlignJustify, File, Pencil } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "../ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { useRef } from "react";
import { Input } from "../ui/input";
import useCollectionStore, {
  selectedStorageDisplayTabAtom,
} from "@/stores/useFileStorageStore";
import { useAtom } from "jotai/react";
import { useNavigate } from "react-router-dom";

export default function StorageHeader() {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const uploadFile = useCollectionStore((state) => state.actions.uploadFile);
  const [selectedDisplayTab, setSelectedDisplayTab] = useAtom(
    selectedStorageDisplayTabAtom
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    for (const file of files) {
      uploadFile(file);
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
              className="rounded-full bg-secondary p-1 h-8 w-8 flex items-center justify-center"
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

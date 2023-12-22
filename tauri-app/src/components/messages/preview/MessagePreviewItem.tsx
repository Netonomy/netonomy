import { useNavigate } from "react-router-dom";
import { Avatar, AvatarImage } from "../../ui/avatar";

export default function MessagePreviewItem({
  selected,
}: {
  selected: boolean;
}) {
  const navigate = useNavigate();

  return (
    <div
      className={`w-full h-16 flex gap-4 items-center hover:bg-myGrey p-2 rounded-md cursor-pointer ${
        selected && "bg-myGrey"
      }`}
      onClick={() => navigate("/messages")}
    >
      <Avatar>
        <AvatarImage src="/AI.png" alt="ai" />
      </Avatar>

      <div className="h-full flex-1 flex flex-col justify-center gap-1">
        <div className="text-lg font-semibold">Yo</div>
        <p className="text-sm text-muted-foreground">Hey, how are you doing?</p>
      </div>

      <div className="h-full">
        <p className="text-sm text-muted-foreground">5 mins ago</p>
      </div>
    </div>
  );
}

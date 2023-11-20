import { Card, CardContent } from "../ui/card";

export default function CredentialsWidget() {
  return (
    <div className="row-span-3 col-span-1">
      <Card className="w-full h-full min-h-28 lg:h-full rounded-xl shadow-lg">
        <CardContent className="flex items-center justify-center h-full">
          <div className="text-lg font-semibold"> Credentials Coming Soon!</div>
        </CardContent>
      </Card>
    </div>
  );
}

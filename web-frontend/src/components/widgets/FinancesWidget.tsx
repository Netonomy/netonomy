import { Card, CardContent } from "../ui/card";

export default function FinancesWidget() {
  return (
    <div className="col-span-1 row-span-2">
      <Card className="cursor-pointer rounded-xl shadow-lg w-full h-full">
        <CardContent className="flex items-center justify-center h-full">
          <div className="text-lg font-semibold">Finances Coming Soon!</div>
        </CardContent>
      </Card>
    </div>
  );
}
